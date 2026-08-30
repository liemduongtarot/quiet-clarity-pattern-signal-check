import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createAppServer } from "../src/api/server.mjs";
import { issueIdentityToken } from "../src/auth/identity.mjs";
import { createHarness } from "./helpers.mjs";

const AUTH_SECRET = "test-only-free-access-secret-with-32-bytes";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("HTTP API and Free Access UI", () => {
  let harness;
  let server;
  let baseUrl;
  let token;

  before(async () => {
    harness = createHarness();
    server = createAppServer({
      service: harness.service,
      policy: harness.policy,
      authSecret: AUTH_SECRET,
      publicDirectory: resolve(root, "public"),
      clock: harness.clock,
    });
    await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    token = issueIdentityToken(
      { subject: harness.identity.userId, email: harness.identity.email },
      { secret: AUTH_SECRET, now: harness.clock.now() },
    );
  });

  after(async () => {
    await new Promise((resolveClose) => server.close(resolveClose));
    harness.close();
  });

  test("UI exposes eligible, working, result, exhausted, error, and history states", async () => {
    const response = await fetch(`${baseUrl}/`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-security-policy"), /default-src 'self'/);
    for (const state of ["auth-error", "quota-status", "working-state", "result-panel", "exhausted-state", "error-state", "history-list"]) {
      assert.match(html, new RegExp(`id="${state}"`));
    }
    assert.match(html, /Deterministic mock executor · PSC core not connected/);
  });

  test("API requires a verified bearer identity", async () => {
    const response = await fetch(`${baseUrl}/api/quota`);
    const body = await response.json();
    assert.equal(response.status, 401);
    assert.equal(body.error.code, "AUTHENTICATION_REQUIRED");
  });

  test("quota, create, history, and reopen preserve one stored result", async () => {
    const headers = { authorization: `Bearer ${token}` };
    const initial = await fetch(`${baseUrl}/api/quota`, { headers }).then((response) => response.json());
    assert.equal(initial.quota.remainingSuccessfulResults, 4);

    const createResponse = await fetch(`${baseUrl}/api/readings`, {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "application/json",
        "idempotency-key": "api-test-key-0001",
      },
      body: JSON.stringify({ request: { prompt: "A repeated API decision pattern", context: {} } }),
    });
    const created = await createResponse.json();
    assert.equal(createResponse.status, 201);
    assert.equal(created.quota.successfulUses, 1);

    const retryResponse = await fetch(`${baseUrl}/api/readings`, {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "application/json",
        "idempotency-key": "api-test-key-0001",
      },
      body: JSON.stringify({ request: { prompt: "A repeated API decision pattern", context: {} } }),
    });
    const retried = await retryResponse.json();
    assert.equal(retryResponse.status, 200);
    assert.equal(retryResponse.headers.get("idempotency-replayed"), "true");
    assert.equal(retried.reading.id, created.reading.id);

    const history = await fetch(`${baseUrl}/api/readings`, { headers }).then((response) => response.json());
    assert.equal(history.readings.length, 1);
    const reopened = await fetch(`${baseUrl}/api/readings/${created.reading.id}`, { headers }).then((response) => response.json());
    assert.deepEqual(reopened.reading.result, created.reading.result);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
    assert.equal(harness.executor.metrics.livePscExecutions, 0);
  });
});
