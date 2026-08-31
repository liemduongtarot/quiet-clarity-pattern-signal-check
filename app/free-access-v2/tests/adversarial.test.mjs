import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import { performance } from "node:perf_hooks";
import { RECEIPT_MS, createHarness, deferred, testRequest } from "./helpers.mjs";

describe("adversarial quota, issuance, duplicate and bounded recovery", () => {
  let harness;
  afterEach(() => harness?.close());

  test("A01 / Q06 — deliberate distinct-receipt concurrent bypass is accepted leakage", async () => {
    const gate = deferred();
    harness = createHarness({ behavior: ({ sequence }) => sequence >= 4 ? gate.promise : undefined });
    for (let index = 1; index <= 3; index += 1) await harness.submit(index);
    const sharedOldToken = harness.browser.token;
    const tabOne = harness.submit(4, { quotaToken: sharedOldToken });
    const tabTwo = harness.submit(5, { quotaToken: sharedOldToken });
    gate.resolve();
    const [one, two] = await Promise.all([tabOne, tabTwo]);
    assert.equal(one.quota.successfulUses, 4);
    assert.equal(two.quota.successfulUses, 4);
    assert.equal(harness.executor.metrics.mockExecutions, 5);
    assert.notEqual(one.reading.result.executionId, two.reading.result.executionId);
  });

  test("A02 / Q04 — simultaneous duplicate receipt cannot execute twice", async () => {
    const gate = deferred();
    harness = createHarness({ behavior: () => gate.promise });
    const first = harness.submit(1);
    await assert.rejects(harness.submit(1), { code: "REQUEST_IN_PROGRESS" });
    gate.resolve();
    await first;
    assert.equal(harness.executor.metrics.mockExecutions, 1);
    assert.equal(harness.service.quota(harness.browser.token).successfulUses, 1);
  });

  test("A03 / Q04 — response-loss retry recovers without a second quota transition", async () => {
    harness = createHarness();
    const execution = harness.execution(1);
    const created = await harness.submit(1);
    const retry = await harness.submit(1, { receipt: execution.receipt, quotaToken: undefined });
    assert.equal(retry.reading.result.executionId, created.reading.result.executionId);
    assert.equal(retry.replayed, true);
    assert.equal(retry.quota.successfulUses, 1);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
    assert.equal(harness.store.snapshot().quota_cycle_started, 1);
  });

  test("A04 / Q03 — explicit pre-issuance rejection consumes zero; same receipt can recover", async () => {
    harness = createHarness();
    await assert.rejects(harness.submit(1, { issueResponse: () => false }), { code: "RESPONSE_NOT_ISSUED" });
    assert.equal(harness.browser.token, undefined);
    assert.equal(harness.service.quota(undefined).successfulUses, 0);
    assert.equal(harness.store.snapshot().psc_result_valid_committed ?? 0, 0);
    const recovered = await harness.submit(1);
    assert.equal(recovered.quota.successfulUses, 1);
    assert.equal(harness.store.snapshot().psc_result_valid_committed, 1);
  });

  test("A05 / Q03 — thrown response writer cannot commit quota or leak raw errors", async () => {
    harness = createHarness();
    await assert.rejects(harness.submit(1, { issueResponse() { throw new Error("SYNTHETIC_WRITER_PRIVATE_CANARY"); } }), (error) => {
      assert.equal(error.code, "RESPONSE_NOT_ISSUED");
      assert.doesNotMatch(error.message, /SYNTHETIC_WRITER_PRIVATE_CANARY/);
      return true;
    });
    assert.equal(harness.browser.token, undefined);
    assert.equal(harness.store.snapshot().quota_cycle_started ?? 0, 0);
  });

  test("A06 / Q03 — serialization failure before issuance consumes zero", async () => {
    harness = createHarness();
    await assert.rejects(harness.submit(1, { issueResponse(outcome) {
      const circular = { outcome }; circular.self = circular;
      JSON.stringify(circular);
    } }), { code: "RESPONSE_NOT_ISSUED" });
    assert.equal(harness.browser.token, undefined);
    assert.equal(harness.issued.length, 0);
  });

  test("A07 / Q03 — asynchronous issuance callback is rejected as unissued", async () => {
    harness = createHarness();
    await assert.rejects(harness.submit(1, { issueResponse: async () => undefined }), { code: "RESPONSE_NOT_ISSUED" });
    assert.equal(harness.browser.token, undefined);
    assert.equal(harness.store.snapshot().psc_result_valid_committed ?? 0, 0);
  });

  test("A08 / Q03 — late output at the execution deadline cannot commit", async () => {
    const gate = deferred();
    harness = createHarness({ behavior: () => gate.promise });
    const pending = harness.submit(1);
    harness.clock.advance(10_000);
    gate.resolve();
    await assert.rejects(pending, { code: "EXECUTION_TIMEOUT" });
    assert.equal(harness.browser.token, undefined);
    assert.equal(harness.issued.length, 0);
  });

  test("A09 / Q03 — real 10-second executor deadline fails closed", { timeout: 20_000 }, async () => {
    const gate = deferred();
    harness = createHarness({ behavior: () => gate.promise });
    const keepAlive = setTimeout(() => {}, 15_000);
    const started = performance.now();
    try {
      await assert.rejects(harness.submit(1), { code: "EXECUTION_TIMEOUT" });
      const elapsed = performance.now() - started;
      assert.ok(elapsed >= 9_500 && elapsed < 15_000, `Deadline elapsed ${Math.round(elapsed)}ms`);
      gate.resolve();
      await new Promise((resolveTurn) => setImmediate(resolveTurn));
      assert.equal(harness.issued.length, 0);
      assert.equal(harness.browser.token, undefined);
    } finally { clearTimeout(keepAlive); gate.resolve(); }
  });

  test("A10 / Q05 — expiry is exclusive and opens exactly at the boundary", async () => {
    harness = createHarness();
    let last;
    for (let index = 1; index <= 4; index += 1) last = await harness.submit(index);
    const end = Date.parse(last.quota.cycleEndsAt);
    harness.clock.set(end - 1);
    await assert.rejects(harness.submit(50), { code: "QUOTA_EXHAUSTED" });
    harness.clock.set(end);
    const next = await harness.submit(51);
    assert.equal(next.quota.successfulUses, 1);
    assert.equal(Date.parse(next.quota.cycleStartsAt), end);
  });

  test("A11 / Q04 — replay cannot accidentally replace a newer quota with its old count", async () => {
    harness = createHarness();
    const first = await harness.submit(1);
    await harness.submit(2);
    await harness.submit(3);
    const replay = await harness.submit(1);
    assert.equal(replay.reading.result.executionId, first.reading.result.executionId);
    assert.equal(replay.quota.successfulUses, 3);
    assert.equal(harness.quotaTokens.parse(harness.browser.token).successful_uses, 3);
    assert.equal(harness.executor.metrics.mockExecutions, 3);
    assert.equal(harness.store.snapshot().psc_result_valid_committed, 3);
  });

  test("A12 / S02 — retention is bounded from admission, never extended by replay", async () => {
    harness = createHarness();
    const admittedAt = harness.clock.now();
    const receipt = harness.execution(1);
    assert.equal(Date.parse(receipt.expiresAt), admittedAt + RECEIPT_MS);
    await harness.submit(1);
    harness.clock.advance(RECEIPT_MS - 1);
    assert.equal((await harness.submit(1)).replayed, true);
    harness.clock.advance(1);
    await assert.rejects(harness.submit(1), { code: "EXECUTION_RECEIPT_EXPIRED" });
    assert.equal(harness.executor.metrics.mockExecutions, 1);
  });

  test("A13 / S02 — abandoned state is automatically swept without another request", async () => {
    harness = createHarness();
    harness.execution(1);
    assert.equal(harness.service.receiptCount, 1);
    harness.clock.advance(RECEIPT_MS);
    await new Promise((resolveTick) => setTimeout(resolveTick, 1_150));
    assert.equal(harness.service.receiptCount, 0);
    assert.equal(harness.service.sweepExpired(), 0);
  });

  test("A14 / Q04 — changed request collides while normalized exact replay remains stable", async () => {
    harness = createHarness();
    const request = { prompt: "Synthetic normalized request", context: { z: 2, a: 1 } };
    const first = await harness.submit(1, { request });
    await assert.rejects(harness.submit(1, { request: testRequest(2) }), { code: "IDEMPOTENCY_COLLISION" });
    const replay = await harness.submit(1, { request: { prompt: `  ${request.prompt}  `, context: { a: 1, z: 2 } } });
    assert.equal(replay.reading.result.executionId, first.reading.result.executionId);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
  });

  test("A15 / S02 — process-wide receipt capacity fails without visitor tracking or quota use", () => {
    harness = createHarness();
    for (let index = 0; index < 1_000; index += 1) harness.service.issueExecution();
    assert.throws(() => harness.service.issueExecution(), { code: "CAPACITY_EXCEEDED" });
    assert.equal(harness.service.receiptCount, 1_000);
    assert.equal(harness.executor.metrics.mockExecutions, 0);
    assert.equal(harness.service.quota(undefined).successfulUses, 0);
    harness.clock.advance(RECEIPT_MS);
    harness.service.sweepExpired();
    assert.equal(harness.service.receiptCount, 0);
    assert.ok(harness.service.issueExecution().receipt);
  });

  test("A16 / S02 — restart invalidates old receipt while existing browser quota remains valid", async () => {
    harness = createHarness();
    const oldReceipt = harness.execution(1).receipt;
    await harness.submit(1);
    const oldToken = harness.browser.token;
    const nextProcess = createHarness({ clock: harness.clock });
    try {
      await assert.rejects(nextProcess.submit(1, { receipt: oldReceipt, quotaToken: oldToken }), { code: "EXECUTION_RECEIPT_INVALID" });
      assert.equal(nextProcess.executor.metrics.mockExecutions, 0);
      assert.equal(nextProcess.service.quota(oldToken).successfulUses, 1);
    } finally { nextProcess.close(); }
  });

  test("A17 / S02 — unknown or edited receipts never become fresh executions", async () => {
    harness = createHarness();
    const receipt = harness.execution(1).receipt;
    for (const candidate of ["", "unknown", `${receipt.slice(0, -1)}!`, receipt.repeat(100)]) {
      await assert.rejects(harness.submit(1, { receipt: candidate }), { code: "EXECUTION_RECEIPT_INVALID" });
    }
    assert.equal(harness.executor.metrics.mockExecutions, 0);
  });

  test("A18 / Q06 — old valid token rollback is documented accepted leakage", async () => {
    harness = createHarness();
    await harness.submit(1);
    const oldValid = harness.browser.token;
    for (let index = 2; index <= 4; index += 1) await harness.submit(index);
    const rolledBack = await harness.submit(5, { quotaToken: oldValid });
    assert.equal(rolledBack.quota.successfulUses, 2);
    assert.equal(harness.executor.metrics.mockExecutions, 5);
  });

  test("A19 / Q06 — deletion and another browser start fresh without identity enforcement", async () => {
    harness = createHarness();
    await harness.submit(1);
    const freshBrowser = { token: undefined };
    const second = await harness.submit(2, { browser: freshBrowser });
    assert.equal(second.quota.successfulUses, 1);
    const deleted = await harness.submit(3, { quotaToken: undefined });
    assert.equal(deleted.quota.successfulUses, 1);
    assert.equal(harness.executor.metrics.mockExecutions, 3);
  });

  test("A20 / S02 — close immediately drops all recovery references", async () => {
    harness = createHarness();
    await harness.submit(1);
    harness.execution(2);
    assert.equal(harness.service.receiptCount, 2);
    harness.service.close();
    assert.equal(harness.service.receiptCount, 0);
  });

  test("A21 / Q03 — result validation crossing the deadline cannot commit", async () => {
    const result = {
      schemaVersion: "psc-execution-result/v1", executionMode: "mock",
      executionId: "synthetic-validation-latency", inputHash: "a".repeat(64),
    };
    Object.defineProperty(result, "reading", {
      enumerable: true,
      get() {
        harness.clock.advance(10_000);
        return { summary: "Synthetic validation-latency fixture", signals: [], nextSteps: [] };
      },
    });
    harness = createHarness({ behavior: () => result });
    await assert.rejects(harness.submit(1), { code: "EXECUTION_TIMEOUT" });
    assert.equal(harness.issued.length, 0);
    assert.equal(harness.browser.token, undefined);
    assert.equal(harness.store.snapshot().psc_result_valid_committed, 0);
  });

  test("A22 / S02 — shutdown aborts an active execution without waiting for its result", async () => {
    const entered = deferred();
    const result = deferred();
    harness = createHarness({ behavior: () => { entered.resolve(); return result.promise; } });
    const pending = harness.submit(1);
    await entered.promise;
    harness.service.close();
    await assert.rejects(pending, { code: "EXECUTION_TIMEOUT" });
    result.resolve();
    await new Promise((resolveTurn) => setImmediate(resolveTurn));
    assert.equal(harness.service.receiptCount, 0);
    assert.equal(harness.issued.length, 0);
    assert.equal(harness.browser.token, undefined);
  });

  test("A23 / S02 — normalization crossing receipt expiry cannot replay a retained result", async () => {
    harness = createHarness();
    const admittedAt = harness.clock.now();
    await harness.submit(1);
    harness.clock.set(admittedAt + RECEIPT_MS - 1);
    const normal = testRequest(1);
    const request = {
      context: normal.context,
      get prompt() { harness.clock.advance(1); return normal.prompt; },
    };
    await assert.rejects(harness.submit(1, { request }), { code: "EXECUTION_RECEIPT_EXPIRED" });
    assert.equal(harness.issued.length, 1);
    assert.equal(harness.service.receiptCount, 0);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
    assert.equal(harness.store.snapshot().psc_result_valid_committed, 1);
  });
});
