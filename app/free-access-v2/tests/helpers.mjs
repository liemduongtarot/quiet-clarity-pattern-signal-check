// TEST-ONLY synthetic fixtures. No live PSC, visitor identity, or payment data.
import { mkdtempSync, rmSync } from "node:fs";
import http from "node:http";
import https from "node:https";
import { tmpdir } from "node:os";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createPolicy } from "../src/policy.mjs";
import { ManualClock } from "../src/clock.mjs";
import { MockPSCExecutor } from "../src/executor/mock-psc.mjs";
import { FreeAccessService } from "../src/service/free-access-service.mjs";
import { SqliteFreeAccessStore } from "../src/storage/sqlite-store.mjs";
import { SignedQuotaTokens } from "../src/auth/quota-token.mjs";
import { createAppServer } from "../src/api/server.mjs";

export const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const REPOSITORY_ROOT = resolve(APP_ROOT, "../..");
export const PARENT_COMMIT = "f53035341a12834170be8afdd1b4ed6481085ed4";
export const CONTRACT_COMMIT = "68bc66eb14016520ac140041ee221b0d96aea424";
export const CYCLE_MS = 720 * 60 * 60 * 1000;
export const RECEIPT_MS = 48_000;
export const TEST_QUOTA_KEY_ID = "qualification-test-only";
export const TEST_QUOTA_SECRET = "TEST-ONLY-quota-signing-secret-not-for-production-2026";

export function testRequest(index = 1) {
  return { prompt: `Synthetic situation ${index}: a repeated decision pattern.`, context: { index } };
}

export function deferred() {
  let resolveValue;
  let rejectValue;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolveValue = resolvePromise;
    rejectValue = rejectPromise;
  });
  return { promise, resolve: resolveValue, reject: rejectValue };
}

export function createHarness({ behavior, clock: suppliedClock, store: suppliedStore, executor: suppliedExecutor } = {}) {
  const clock = suppliedClock ?? new ManualClock();
  const policy = createPolicy();
  const store = suppliedStore ?? new SqliteFreeAccessStore();
  const executor = suppliedExecutor ?? new MockPSCExecutor({ clock, behavior });
  const quotaTokens = new SignedQuotaTokens({
    keys: { [TEST_QUOTA_KEY_ID]: TEST_QUOTA_SECRET },
    keyId: TEST_QUOTA_KEY_ID,
    clock,
  });
  const service = new FreeAccessService({ store, executor, policy, clock, quotaTokens });
  const browser = { token: undefined };
  const executionFixtures = new Map();
  const issued = [];
  let closed = false;
  return {
    clock, executor, policy, service, store, quotaTokens, browser, issued,
    execution(index = 1) {
      if (!executionFixtures.has(index)) executionFixtures.set(index, service.issueExecution());
      return executionFixtures.get(index);
    },
    async submit(index = 1, options = {}) {
      const scopedBrowser = options.browser ?? browser;
      const receipt = options.receipt ?? this.execution(index).receipt;
      return service.createReading({
        receipt,
        quotaToken: Object.hasOwn(options, "quotaToken") ? options.quotaToken : scopedBrowser.token,
        request: options.request ?? testRequest(index),
        issueResponse(outcome, token) {
          const result = options.issueResponse?.(outcome, token);
          if (result !== false && !(result && typeof result.then === "function")) {
            if (token !== undefined) scopedBrowser.token = token;
            issued.push({ outcome, token });
          }
          return result;
        },
      });
    },
    close() {
      if (closed) return;
      closed = true;
      service.close();
      store.close();
      executionFixtures.clear();
      issued.length = 0;
      browser.token = undefined;
    },
  };
}

export function temporaryDirectory(testContext, label = "fixture") {
  const prefix = `psc-free-access-v2-${label}-`;
  const directory = mkdtempSync(resolve(tmpdir(), prefix));
  testContext.after(() => {
    const absolute = resolve(directory);
    const allowedRoot = `${resolve(tmpdir())}${sep}`;
    if (!absolute.startsWith(allowedRoot) || !absolute.slice(allowedRoot.length).startsWith(prefix)) {
      throw new Error("Refusing fixture cleanup outside its verified temporary root");
    }
    rmSync(absolute, { recursive: true, force: true });
  });
  return directory;
}

// A real HTTP(S) request; this does not stand in for real-browser qualification.
export function requestHttp(baseUrl, path, options = {}) {
  const target = new URL(baseUrl);
  const method = options.method ?? (Object.hasOwn(options, "json") ? "POST" : "GET");
  const headers = { ...options.headers };
  const body = Object.hasOwn(options, "json") ? JSON.stringify(options.json) : options.body;
  if (body !== undefined && !Object.keys(headers).some((key) => key.toLowerCase() === "content-type")) {
    headers["Content-Type"] = "application/json";
  }
  if (method === "POST" && options.origin !== false) headers.Origin = options.origin ?? baseUrl;
  if (options.cookie !== undefined) headers.Cookie = options.cookie;
  if (body !== undefined) headers["Content-Length"] = Buffer.byteLength(body);
  const transport = target.protocol === "https:" ? https : http;
  return new Promise((resolveResponse, rejectResponse) => {
    const request = transport.request({
      hostname: target.hostname, port: target.port, path, method, headers,
      ca: options.ca, agent: false,
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let json;
        try { json = JSON.parse(text); } catch { /* Non-JSON static/error fixture. */ }
        resolveResponse({ status: response.statusCode, headers: response.headers, text, json });
      });
      response.on("error", rejectResponse);
    });
    request.setTimeout(options.timeoutMs ?? 5_000, () => request.destroy(new Error("Synthetic HTTP fixture timed out")));
    request.on("error", rejectResponse);
    request.end(body);
  });
}

export async function startServer(testContext, { harness = createHarness(), tlsOptions, localSynthetic = tlsOptions === undefined } = {}) {
  const server = createAppServer({
    service: harness.service, policy: harness.policy, quotaTokens: harness.quotaTokens,
    publicDirectory: resolve(APP_ROOT, "public"), localSynthetic, tlsOptions,
  });
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const baseUrl = `${tlsOptions ? "https" : "http"}://127.0.0.1:${server.address().port}`;
  let cookie;
  testContext.after(async () => {
    server.closeAllConnections();
    await new Promise((resolveClose) => server.close(resolveClose));
    harness.close();
    cookie = undefined;
  });
  return {
    harness, server, baseUrl,
    get cookie() { return cookie; },
    set cookie(value) { cookie = value; },
    async request(path, options = {}) {
      const response = await requestHttp(baseUrl, path, {
        ca: tlsOptions?.cert, ...options,
        cookie: options.omitCookie ? undefined : (Object.hasOwn(options, "cookie") ? options.cookie : cookie),
      });
      if (response.headers["set-cookie"] && !options.ignoreSetCookie) {
        cookie = response.headers["set-cookie"][0].split(";")[0];
      }
      return response;
    },
    async execute(index = 1, options = {}) {
      const executionResponse = await this.request("/api/executions", { json: {} });
      if (executionResponse.status !== 201 && executionResponse.status !== 200) {
        throw new Error(`Execution fixture admission failed: ${executionResponse.status}`);
      }
      const receipt = executionResponse.json.receipt;
      const response = await this.request("/api/readings", { json: { receipt, request: testRequest(index) }, ...options });
      return { ...response, receipt };
    },
  };
}
