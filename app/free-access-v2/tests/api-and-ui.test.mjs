import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import http from "node:http";
import { resolve } from "node:path";
import { test } from "node:test";
import { createAppServer, isLoopbackAddress } from "../src/api/server.mjs";
import { CLIENT_COUNTERS } from "../src/analytics/counters.mjs";
import { APP_ROOT, createHarness, deferred, startServer, testRequest } from "./helpers.mjs";

function noStore(response) {
  assert.equal(response.headers["cache-control"], "no-store");
  assert.equal(response.headers["referrer-policy"], "no-referrer");
  assert.equal(response.headers["x-content-type-options"], "nosniff");
}

function testTlsOptions() {
  return {
    key: readFileSync(resolve(APP_ROOT, "tests/fixtures/localhost-test-only.key.pem")),
    cert: readFileSync(resolve(APP_ROOT, "tests/fixtures/localhost-test-only.cert.pem")),
  };
}

test("H01 / R01 S03 — real HTTP serves protected no-account UI and mock disclosure", async (t) => {
  const client = await startServer(t);
  const response = await client.request("/");
  assert.equal(response.status, 200);
  noStore(response);
  assert.match(response.headers["content-security-policy"], /default-src 'self'/);
  assert.equal(response.headers["x-frame-options"], "DENY");
  assert.equal(response.headers["cross-origin-opener-policy"], "same-origin");
  for (const id of ["quota-status", "working-state", "result-panel", "exhausted-state", "error-state", "copy-result", "download-result"]) {
    assert.ok(response.text.includes(`id="${id}"`));
  }
  assert.match(response.text, /No account, name or email required/);
  assert.match(response.text, /Deterministic mock executor · PSC core not connected/);
  assert.match(response.text, /<html lang="en">/);
  assert.match(response.text, /autocomplete="off"/);
  assert.match(response.text, /spellcheck="false"/);
  assert.doesNotMatch(response.text, /type="(?:email|password)"|id="history-list"|completely anonymous/i);
  assert.equal(response.headers["set-cookie"], undefined);
});

test("H02 / Q01 — quota and receipt GET/POST never mint a quota cookie or success", async (t) => {
  const client = await startServer(t);
  const quota = await client.request("/api/quota");
  assert.equal(quota.status, 200);
  assert.equal(quota.json.quota.successfulUses, 0);
  assert.equal(quota.json.quota.remainingSuccessfulResults, 4);
  assert.equal(quota.json.quota.cycleStartsAt, null);
  assert.equal(quota.headers["set-cookie"], undefined);
  const admission = await client.request("/api/executions", { json: {} });
  assert.equal(admission.status, 201);
  assert.deepEqual(Object.keys(admission.json).sort(), ["expiresAt", "receipt"]);
  assert.equal(admission.headers["set-cookie"], undefined);
  assert.equal(client.harness.store.snapshot().psc_result_valid_committed, 0);
  noStore(quota); noStore(admission);
});

test("H03 / Q02 — HTTP sequential cookie flow delivers fourth and blocks fifth before executor", async (t) => {
  const client = await startServer(t);
  for (let index = 1; index <= 4; index += 1) {
    const response = await client.execute(index);
    assert.equal(response.status, 201);
    assert.equal(response.json.quota.successfulUses, index);
    assert.equal(response.json.quota.remainingSuccessfulResults, 4 - index);
    assert.match(response.json.reading.result.reading.summary, new RegExp(`Synthetic situation ${index}`));
    assert.deepEqual(Object.keys(response.json.reading).sort(), ["createdAt", "result"]);
    assert.match(client.cookie, /^psc_quota_local_synthetic=/);
    assert.equal(response.text.includes(client.cookie.split("=")[1]), false);
    noStore(response);
  }
  const fifth = await client.execute(5);
  assert.equal(fifth.status, 429);
  assert.equal(fifth.json.error.code, "QUOTA_EXHAUSTED");
  assert.equal(client.harness.executor.metrics.mockExecutions, 4);
  assert.equal(client.harness.executor.metrics.livePscExecutions, 0);
  noStore(fifth);
});

test("H04 / Q04 — HTTP retry sends the same content and no extra success or cookie rollback", async (t) => {
  const client = await startServer(t);
  const first = await client.execute(1);
  await client.execute(2);
  const newerCookie = client.cookie;
  const replay = await client.request("/api/readings", { json: { receipt: first.receipt, request: testRequest(1) } });
  assert.equal(replay.status, 200);
  assert.equal(replay.headers["idempotency-replayed"], "true");
  assert.deepEqual(replay.json.reading, first.json.reading);
  assert.equal(replay.json.quota.successfulUses, 2);
  assert.equal(client.cookie, newerCookie);
  assert.equal(client.harness.executor.metrics.mockExecutions, 2);
  assert.equal(client.harness.store.snapshot().psc_result_valid_committed, 2);
});

test("H05 / Q06 — edited cookie and cross-mode cookie fail before execution", async (t) => {
  const client = await startServer(t);
  const first = await client.execute(1);
  const token = client.cookie.split("=")[1];
  const badCookie = `psc_quota_local_synthetic=${token.slice(0, -1)}!`;
  const badQuota = await client.request("/api/quota", { cookie: badCookie });
  assert.equal(badQuota.status, 400);
  assert.equal(badQuota.json.error.code, "QUOTA_TOKEN_INVALID");
  const attempt = await client.request("/api/readings", { cookie: badCookie, json: { receipt: first.receipt, request: testRequest(1) } });
  assert.equal(attempt.status, 400);
  const crossMode = await client.request("/api/quota", { cookie: `__Host-psc_quota=${token}` });
  assert.equal(crossMode.status, 400);
  assert.equal(client.harness.executor.metrics.mockExecutions, 1);
});

test("H06 / S01 C01 — legacy identity, history and commerce routes are absent", async (t) => {
  const client = await startServer(t);
  for (const path of ["/api/readings", "/api/readings/synthetic-id", "/api/history", "/api/reopen", "/api/metrics", "/api/checkout", "/api/payment", "/api/auth/dev"]) {
    const response = await client.request(path);
    assert.equal(response.status, 404, path);
    noStore(response);
  }
  for (const path of ["/api/checkout", "/api/payment", "/api/auth/dev"]) {
    const response = await client.request(path, { json: {} });
    assert.equal(response.status, 404);
  }
  assert.equal(client.harness.executor.metrics.mockExecutions, 0);
});

test("H07 / S01 — legacy bearer/idempotency headers cannot reintroduce identity", async (t) => {
  const client = await startServer(t);
  for (const headers of [{ authorization: "Bearer SYNTHETIC_IDENTITY" }, { "idempotency-key": "SYNTHETIC_OLD_USER_KEY" }]) {
    const response = await client.request("/api/quota", { headers });
    assert.equal(response.status, 400);
    assert.equal(response.json.error.code, "VALIDATION_ERROR");
    assert.doesNotMatch(response.text, /SYNTHETIC_/);
  }
});

test("H08 / S03 — missing/cross-site Origin and fetch metadata fail closed", async (t) => {
  const client = await startServer(t);
  for (const options of [{ origin: false }, { origin: "https://unrelated.example.test" }, { headers: { "sec-fetch-site": "cross-site" } }]) {
    const response = await client.request("/api/executions", { json: {}, ...options });
    assert.equal(response.status, 403);
    assert.equal(response.json.error.code, "ORIGIN_REJECTED");
    assert.equal(response.headers["access-control-allow-origin"], undefined);
  }
  assert.equal(client.harness.service.receiptCount, 0);
});

test("H09 / S03 S04 — raw query/path probes are rejected without echo or caching", async (t) => {
  const client = await startServer(t);
  const marker = "SYNTHETIC_RAW_URL_CANARY_381f";
  for (const path of [`/api/quota?prompt=${marker}`, `/api/readings/${marker}`, `/../${marker}`, `//${marker}`]) {
    const response = await client.request(path);
    assert.ok(response.status === 400 || response.status === 404);
    assert.equal(response.text.includes(marker), false);
    noStore(response);
  }
  assert.equal(client.harness.executor.metrics.mockExecutions, 0);
});

test("H10 / S03 — strict JSON media, encoding, syntax and body size are enforced", async (t) => {
  const client = await startServer(t);
  const plain = await client.request("/api/executions", { method: "POST", body: "{}", headers: { "content-type": "text/plain" } });
  assert.equal(plain.status, 415);
  const encoded = await client.request("/api/executions", { json: {}, headers: { "content-encoding": "gzip" } });
  assert.equal(encoded.status, 415);
  const malformed = await client.request("/api/executions", { method: "POST", body: "{INVALID_SYNTHETIC_JSON" });
  assert.equal(malformed.status, 400);
  assert.doesNotMatch(malformed.text, /INVALID_SYNTHETIC_JSON/);
  const oversized = await client.request("/api/executions", { json: { x: "x".repeat(16_385) } });
  assert.equal(oversized.status, 400);
  assert.equal(client.harness.service.receiptCount, 0);
  assert.equal(client.harness.executor.metrics.mockExecutions, 0);
});

test("H11 / S01 S04 — unknown request fields including identity and faults are rejected", async (t) => {
  const client = await startServer(t);
  const execution = await client.request("/api/executions", { json: {} });
  const receipt = execution.json.receipt;
  for (const field of ["identity", "userId", "email", "faults", "quota_token", "variant", "history"]) {
    const envelope = await client.request("/api/readings", { json: { receipt, request: testRequest(1), [field]: "SYNTHETIC_CANARY" } });
    assert.equal(envelope.status, 400);
    const nested = await client.request("/api/readings", { json: { receipt, request: { ...testRequest(1), [field]: "SYNTHETIC_CANARY" } } });
    assert.equal(nested.status, 400);
    assert.equal(nested.text.includes("SYNTHETIC_CANARY"), false);
  }
  assert.equal(client.harness.executor.metrics.mockExecutions, 0);
});

test("H12 / A01 — metrics accept exact finite event bodies and no credential or linkage", async (t) => {
  const client = await startServer(t);
  for (const event of CLIENT_COUNTERS) {
    const response = await client.request("/api/metrics", { json: { event }, omitCookie: true });
    assert.equal(response.status, 202);
    assert.equal(client.harness.store.snapshot()[event], 1);
    noStore(response);
  }
  for (const field of ["raw", "question", "result", "quota_token", "token_hash", "receipt", "visitor_id", "classification", "status", "timestamp", "market", "language", "use_number", "variant"]) {
    const response = await client.request("/api/metrics", { json: { event: "psc_started", [field]: "SYNTHETIC_PRIVATE_METRIC" }, omitCookie: true });
    assert.equal(response.status, 400);
    assert.doesNotMatch(response.text, /SYNTHETIC_PRIVATE_METRIC/);
  }
  for (const event of ["psc_result_valid_committed", "quota_cycle_reached_4", "payment_completed", "downloaded", "unknown"]) {
    const response = await client.request("/api/metrics", { json: { event }, omitCookie: true });
    assert.equal(response.status, 400);
  }
  const credentialed = await client.request("/api/metrics", { json: { event: "psc_started" }, cookie: "synthetic-cookie=value" });
  assert.equal(credentialed.status, 400);
  assert.equal(client.harness.store.snapshot().psc_started, 1);
  assert.equal(client.harness.store.snapshot().psc_result_valid_committed, 0);
});

test("H13 / S03 — production HTTP cannot be authorized by forwarded HTTPS headers", async (t) => {
  const client = await startServer(t, { localSynthetic: false });
  const response = await client.request("/health", { headers: { "x-forwarded-proto": "https", forwarded: "proto=https" } });
  assert.equal(response.status, 403);
  assert.equal(response.json.error.code, "TRANSPORT_REQUIRED");
  assert.equal(response.headers["set-cookie"], undefined);
  noStore(response);
});

test("H14 / S03 — local synthetic mode refuses non-loopback Host", async (t) => {
  const client = await startServer(t);
  const response = await client.request("/health", { headers: { Host: "public.example.test" } });
  assert.equal(response.status, 403);
  assert.equal(response.json.error.code, "TRANSPORT_REQUIRED");
  for (const address of ["8.8.8.8", "localhost.example.test", "127.0.0.999", "0.0.0.0"]) assert.equal(isLoopbackAddress(address), false);
  for (const address of ["127.0.0.1", "localhost", "::1", "::ffff:127.0.0.1"]) assert.equal(isLoopbackAddress(address), true);
});

test("H15 / S03 — production NODE_ENV cannot enable local HTTP exception", () => {
  const harness = createHarness();
  const original = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    assert.throws(() => createAppServer({
      service: harness.service, policy: harness.policy, quotaTokens: harness.quotaTokens,
      publicDirectory: resolve(APP_ROOT, "public"), localSynthetic: true,
    }), TypeError);
  } finally {
    if (original === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = original;
    harness.close();
  }
});

test("H16 / S03 — actual trusted HTTPS issues production Host cookie with all required flags", async (t) => {
  const client = await startServer(t, { tlsOptions: testTlsOptions() });
  const health = await client.request("/health");
  assert.equal(health.status, 200);
  assert.equal(health.json.mode, "encrypted-mock");
  const result = await client.execute(1);
  assert.equal(result.status, 201);
  const cookie = result.headers["set-cookie"][0];
  assert.match(cookie, /^__Host-psc_quota=/);
  for (const flag of ["Secure", "HttpOnly", "SameSite=Lax", "Path=/"]) assert.ok(cookie.split("; ").includes(flag));
  assert.doesNotMatch(cookie, /(?:^|;)\s*Domain=/i);
  assert.equal(result.json.quota.successfulUses, 1);
  noStore(result);
  const localCookie = client.cookie.replace("__Host-psc_quota", "psc_quota_local_synthetic");
  const refused = await client.request("/api/quota", { cookie: localCookie });
  assert.equal(refused.status, 400);
});

test("H17 / S03 — questionnaire/assets/errors ignore cache validators and never return cached raw state", async (t) => {
  const client = await startServer(t);
  for (const path of ["/", "/index.html", "/app.js", "/styles.css", "/api/quota", "/missing", "/favicon.ico"]) {
    const response = await client.request(path, { headers: { "if-none-match": "*", "if-modified-since": "Fri, 01 Jan 2100 00:00:00 GMT" } });
    assert.notEqual(response.status, 304);
    assert.equal(response.headers["cache-control"], "no-store");
    assert.equal(response.headers.etag, undefined);
  }
});

test("H18 / S04 — raw executor errors are absent from HTTP and console output", async (t) => {
  const output = [];
  for (const method of ["log", "warn", "error", "info", "debug", "trace"]) t.mock.method(console, method, (...values) => output.push(values.join(" ")));
  const canary = "SYNTHETIC_HTTP_RAW_ERROR_CANARY_b012";
  const client = await startServer(t, { harness: createHarness({ behavior: () => new Error(canary) }) });
  const response = await client.execute(1);
  assert.equal(response.status, 503);
  assert.equal(response.json.error.code, "EXECUTION_FAILED");
  assert.equal(response.text.includes(canary), false);
  assert.equal(response.headers["set-cookie"], undefined);
  assert.equal(output.length, 0);
  assert.equal(client.harness.store.snapshot().psc_result_valid_committed, 0);
});

test("H19 / Q03 — actual disconnected HTTP response consumes zero then same receipt recovers", { timeout: 10_000 }, async (t) => {
  const entered = deferred();
  const release = deferred();
  const client = await startServer(t, { harness: createHarness({ behavior: () => { entered.resolve(); return release.promise; } }) });
  const execution = await client.request("/api/executions", { json: {} });
  const receipt = execution.json.receipt;
  const body = JSON.stringify({ receipt, request: testRequest(1) });
  const responseClosed = deferred();
  client.server.on("request", (request, response) => {
    if (request.url === "/api/readings") response.once("close", () => responseClosed.resolve());
  });
  const request = http.request(`${client.baseUrl}/api/readings`, {
    method: "POST", headers: { Origin: client.baseUrl, "content-type": "application/json", "content-length": Buffer.byteLength(body) }, agent: false,
  });
  request.on("error", () => {});
  request.end(body);
  await entered.promise;
  request.destroy();
  await responseClosed.promise;
  release.resolve();
  await new Promise((resolveTurn) => setTimeout(resolveTurn, 20));
  assert.equal(client.harness.store.snapshot().psc_result_valid_committed, 0);
  assert.equal(client.cookie, undefined);
  const retry = await client.request("/api/readings", { json: { receipt, request: testRequest(1) } });
  assert.equal(retry.status, 201);
  assert.equal(retry.json.quota.successfulUses, 1);
  assert.equal(client.harness.executor.metrics.mockExecutions, 1);
  assert.equal(client.harness.store.snapshot().psc_result_valid_committed, 1);
});

test("H20 / Q03 — actual HTTP serialization failure never issues a result or quota", async (t) => {
  const circular = {
    schemaVersion: "psc-execution-result/v1", executionMode: "mock", executionId: "synthetic-circular-fixture",
    inputHash: "f".repeat(64), reading: { summary: "SYNTHETIC_CIRCULAR_PRIVATE", signals: [], nextSteps: [] },
  };
  circular.cycle = circular;
  const client = await startServer(t, { harness: createHarness({ behavior: () => circular }) });
  const response = await client.execute(1);
  assert.equal(response.status, 503);
  assert.equal(response.json.error.code, "RESPONSE_NOT_ISSUED");
  assert.equal(response.headers["set-cookie"], undefined);
  assert.equal(response.text.includes("SYNTHETIC_CIRCULAR_PRIVATE"), false);
  assert.equal(client.harness.store.snapshot().psc_result_valid_committed, 0);
});
