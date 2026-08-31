import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { APP_ROOT, TEST_QUOTA_SECRET, requestHttp, temporaryDirectory, testRequest } from "./helpers.mjs";

function processEnvironment(filename) {
  const environment = {
    ...process.env, PSC_LOCAL_SYNTHETIC: "1", PSC_QUOTA_SECRET: TEST_QUOTA_SECRET,
    PSC_QUOTA_KEY_ID: "lifecycle-test-only", PSC_DATABASE: filename, BIND_HOST: "127.0.0.1", PORT: "0", NODE_ENV: "test",
  };
  for (const key of Object.keys(environment)) {
    if (key.startsWith("FREE_ACCESS_") || key === "PSC_QUOTA_VERIFY_KEYS_JSON" || key === "PSC_TLS_KEY_FILE" || key === "PSC_TLS_CERT_FILE") delete environment[key];
  }
  return environment;
}

async function startProcess(filename) {
  const child = spawn(process.execPath, ["src/index.mjs"], { cwd: APP_ROOT, env: processEnvironment(filename), stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const startup = await new Promise((resolveStartup, rejectStartup) => {
    const timeout = setTimeout(() => { child.kill(); rejectStartup(new Error("Synthetic server startup timed out")); }, 5_000);
    child.once("error", (error) => { clearTimeout(timeout); rejectStartup(error); });
    child.once("exit", () => { clearTimeout(timeout); rejectStartup(new Error("Synthetic server exited before startup")); });
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      const line = stdout.split(/\r?\n/).find((item) => item.startsWith("{"));
      if (!line) return;
      try {
        const event = JSON.parse(line);
        if (event.event === "free_access_started") { clearTimeout(timeout); resolveStartup(event); }
      } catch { /* Wait for the remainder of the startup line. */ }
    });
  });
  return {
    startup, baseUrl: `http://127.0.0.1:${startup.port}`,
    get stdout() { return stdout; }, get stderr() { return stderr; },
    async stop() {
      if (child.exitCode !== null || child.signalCode !== null) return;
      const stopped = new Promise((resolveStop) => child.once("exit", resolveStop));
      child.kill();
      await stopped;
    },
  };
}

test("L01 / S02 S04 — real process restart rejects old receipt and retains only aggregate counts", { timeout: 20_000 }, async (t) => {
  const directory = temporaryDirectory(t, "real-process-restart");
  const filename = resolve(directory, "aggregate.sqlite");
  let first;
  let second;
  const marker = "SYNTHETIC_PROCESS_RAW_CANARY_c34a";
  try {
    first = await startProcess(filename);
    const admission = await requestHttp(first.baseUrl, "/api/executions", { json: {} });
    const receipt = admission.json.receipt;
    const request = { ...testRequest(1), prompt: marker };
    const outcome = await requestHttp(first.baseUrl, "/api/readings", { json: { receipt, request } });
    assert.equal(outcome.status, 201);
    const cookie = outcome.headers["set-cookie"][0].split(";")[0];
    assert.equal(outcome.json.quota.successfulUses, 1);
    await first.stop();
    second = await startProcess(filename);
    const quota = await requestHttp(second.baseUrl, "/api/quota", { cookie });
    assert.equal(quota.json.quota.successfulUses, 1);
    const retry = await requestHttp(second.baseUrl, "/api/readings", { cookie, json: { receipt, request } });
    assert.equal(retry.status, 400);
    assert.equal(retry.json.error.code, "EXECUTION_RECEIPT_INVALID");
    assert.equal(retry.headers["set-cookie"], undefined);
    const health = await requestHttp(second.baseUrl, "/health");
    assert.equal(health.json.livePscExecutions, 0);
    await second.stop();
    const database = new DatabaseSync(filename, { readOnly: true });
    try {
      assert.equal(database.prepare("SELECT value FROM aggregate_counters WHERE counter='psc_result_valid_committed'").get().value, 1);
      assert.deepEqual(database.prepare("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name").all().map((row) => row.name), ["aggregate_counters", "schema_migrations"]);
    } finally { database.close(); }
    for (const instance of [first, second]) {
      assert.equal(instance.stdout.trim().split(/\r?\n/).length, 1, "Runtime emits only a fixed startup event, never request logs");
      assert.equal(instance.stderr, "");
      for (const secret of [marker, receipt, cookie, TEST_QUOTA_SECRET]) {
        assert.equal(instance.stdout.includes(secret), false);
        assert.equal(instance.stderr.includes(secret), false);
      }
      assert.deepEqual(Object.keys(instance.startup).sort(), ["event", "executor", "implementation", "livePscExecutions", "mode", "port"]);
    }
  } finally { await first?.stop(); await second?.stop(); }
});

test("L02 / S03 S04 — rejected production HTTP configuration logs only a fixed code", (t) => {
  const directory = temporaryDirectory(t, "config-rejection");
  const environment = processEnvironment(resolve(directory, "unused.sqlite"));
  environment.NODE_ENV = "production";
  environment.PSC_QUOTA_SECRET = "SYNTHETIC_PRIVATE_INVALID_CONFIGURATION";
  const run = spawnSync(process.execPath, ["src/index.mjs"], { cwd: APP_ROOT, env: environment, encoding: "utf8", timeout: 5_000, windowsHide: true });
  assert.equal(run.status, 1);
  assert.equal(run.stdout, "");
  assert.deepEqual(JSON.parse(run.stderr.trim()), { event: "free_access_start_failed", code: "CONFIGURATION_REJECTED" });
  assert.equal(run.stderr.includes(environment.PSC_QUOTA_SECRET), false);
});
