import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import { ExecutionError } from "../src/errors.mjs";
import { CYCLE_MS, RECEIPT_MS, createHarness, testRequest } from "./helpers.mjs";

// Retains the useful v1 canonical scenarios; authentication and durable history
// expectations are deliberately replaced by the frozen browser-bounded contract.
describe("canonical browser-bounded Free Access acceptance", () => {
  let harness;
  afterEach(() => harness?.close());

  test("C01 / Q01 — Free access accepts a request without account or identity", async () => {
    harness = createHarness();
    const outcome = await harness.submit(1);
    assert.equal(outcome.quota.successfulUses, 1);
    assert.equal(outcome.reading.result.executionMode, "mock");
    assert.deepEqual(harness.executor.metrics, { mockExecutions: 1, livePscExecutions: 0 });
    assert.equal(Object.hasOwn(outcome.reading, "userId"), false);
  });

  test("C02 / Q01 — visits and execution admission leave four slots and no cycle", () => {
    harness = createHarness();
    for (let index = 0; index < 3; index += 1) {
      const quota = harness.service.quota(undefined);
      assert.equal(quota.successfulUses, 0);
      assert.equal(quota.remainingSuccessfulResults, 4);
      assert.equal(quota.cycleStartsAt, null);
      assert.equal(quota.cycleEndsAt, null);
      harness.service.issueExecution();
    }
    assert.equal(harness.browser.token, undefined);
    assert.equal(harness.executor.metrics.mockExecutions, 0);
    assert.equal(harness.store.snapshot().psc_result_valid_committed ?? 0, 0);
  });

  test("C03 / Q01 — first valid issuance starts exactly 720 hours at completion time", async () => {
    harness = createHarness({ behavior: () => { harness.clock.advance(1_234); } });
    const receiptCreatedAt = harness.clock.now();
    harness.execution(1);
    harness.clock.advance(2_000);
    const outcome = await harness.submit(1);
    const issuedAt = receiptCreatedAt + 3_234;
    assert.equal(Date.parse(outcome.quota.cycleStartsAt), issuedAt);
    assert.equal(Date.parse(outcome.quota.cycleEndsAt), issuedAt + CYCLE_MS);
    assert.equal(harness.quotaTokens.parse(harness.browser.token).successful_uses, 1);
  });

  test("C04 / Q02 — second and third successes each consume exactly one use", async () => {
    harness = createHarness();
    await harness.submit(1);
    await harness.submit(2);
    const third = await harness.submit(3);
    assert.equal(third.quota.successfulUses, 3);
    assert.equal(third.quota.remainingSuccessfulResults, 1);
    assert.equal(harness.executor.metrics.mockExecutions, 3);
  });

  test("C05 / Q02 — fourth result is issued in full while remaining allowance becomes zero", async () => {
    harness = createHarness();
    for (let index = 1; index <= 3; index += 1) await harness.submit(index);
    const fourth = await harness.submit(4);
    assert.equal(fourth.reading.result.schemaVersion, "psc-execution-result/v1");
    assert.equal(fourth.reading.result.executionMode, "mock");
    assert.match(fourth.reading.result.reading.summary, /Synthetic situation 4/);
    assert.equal(fourth.reading.result.reading.signals.length, 2);
    assert.equal(fourth.quota.successfulUses, 4);
    assert.equal(fourth.quota.remainingSuccessfulResults, 0);
    assert.equal(harness.issued.length, 4);
    assert.equal(harness.quotaTokens.parse(harness.issued.at(-1).token).successful_uses, 4);
  });

  test("C06 / Q02 — fifth new execution is blocked before the mock executor", async () => {
    harness = createHarness();
    for (let index = 1; index <= 4; index += 1) await harness.submit(index);
    await assert.rejects(harness.submit(5), { code: "QUOTA_EXHAUSTED" });
    assert.equal(harness.executor.metrics.mockExecutions, 4);
    assert.equal(harness.executor.metrics.livePscExecutions, 0);
    assert.equal(harness.store.snapshot().quota_blocked, 1);
  });

  test("C07 / Q03 — execution error consumes zero and does not start the cycle", async () => {
    harness = createHarness({ behavior: () => new ExecutionError("SYNTHETIC_PRIVATE_ERROR") });
    await assert.rejects(harness.submit(1), { code: "EXECUTION_FAILED" });
    const quota = harness.service.quota(harness.browser.token);
    assert.equal(quota.successfulUses, 0);
    assert.equal(quota.remainingSuccessfulResults, 4);
    assert.equal(quota.cycleStartsAt, null);
    assert.equal(harness.browser.token, undefined);
    assert.equal(harness.store.snapshot().psc_result_valid_committed ?? 0, 0);
  });

  test("C08 / Q03 — invalid output consumes zero and is never issued", async () => {
    harness = createHarness({ behavior: () => ({ schemaVersion: "wrong", raw: "SYNTHETIC_PRIVATE_RESULT" }) });
    await assert.rejects(harness.submit(1), { code: "EXECUTION_FAILED" });
    assert.equal(harness.service.quota(harness.browser.token).remainingSuccessfulResults, 4);
    assert.equal(harness.issued.length, 0);
  });

  test("C09 / Q04 — exact retry replays one result without another use or execution", async () => {
    harness = createHarness();
    const first = await harness.submit(1);
    const replay = await harness.submit(1);
    assert.equal(replay.replayed, true);
    assert.deepEqual(replay.reading, first.reading);
    assert.equal(replay.quota.successfulUses, 1);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
    assert.equal(harness.store.snapshot().psc_result_valid_committed, 1);
  });

  test("C10 / S01 — anonymous service and database offer no history or reopen", async () => {
    harness = createHarness();
    await harness.submit(1);
    assert.equal(typeof harness.service.history, "undefined");
    assert.equal(typeof harness.service.reopen, "undefined");
    assert.deepEqual(harness.store.schemaInventory().map((table) => table.name).sort(), ["aggregate_counters", "schema_migrations"]);
  });

  test("C11 / S02 — recovery expiry rejects old receipt without rerun or history", async () => {
    harness = createHarness();
    await harness.submit(1);
    const token = harness.browser.token;
    harness.clock.advance(RECEIPT_MS);
    await assert.rejects(harness.submit(1), { code: "EXECUTION_RECEIPT_EXPIRED" });
    assert.equal(harness.executor.metrics.mockExecutions, 1);
    assert.equal(harness.browser.token, token);
    assert.equal(harness.service.quota(token).successfulUses, 1);
  });

  test("C12 / Q05 — exact cycle expiry resets and next success starts a new cycle", async () => {
    harness = createHarness();
    const first = await harness.submit(1);
    const expiry = Date.parse(first.quota.cycleEndsAt);
    harness.clock.set(expiry);
    const between = harness.service.quota(harness.browser.token);
    assert.equal(between.successfulUses, 0);
    assert.equal(between.cycleStartsAt, null);
    const next = await harness.submit(2);
    assert.equal(next.quota.successfulUses, 1);
    assert.equal(Date.parse(next.quota.cycleStartsAt), expiry);
    assert.equal(Date.parse(next.quota.cycleEndsAt), expiry + CYCLE_MS);
  });

  test("C13 / Q05 — late success and visits never move an existing cycle expiry", async () => {
    harness = createHarness();
    const first = await harness.submit(1);
    harness.clock.advance(700 * 60 * 60 * 1000);
    for (let index = 0; index < 3; index += 1) assert.equal(harness.service.quota(harness.browser.token).cycleEndsAt, first.quota.cycleEndsAt);
    const second = await harness.submit(2);
    assert.equal(second.quota.cycleStartsAt, first.quota.cycleStartsAt);
    assert.equal(second.quota.cycleEndsAt, first.quota.cycleEndsAt);
    assert.equal(second.quota.successfulUses, 2);
  });

  test("C14 / Q03 — invalid input is rejected before execution or quota issuance", async () => {
    harness = createHarness();
    for (const request of [null, {}, { prompt: "   " }, { prompt: "x".repeat(4_001) }]) {
      await assert.rejects(harness.service.createReading({
        receipt: harness.service.issueExecution().receipt, quotaToken: undefined, request,
        issueResponse: () => assert.fail("invalid input must not be issued"),
      }), { code: "VALIDATION_ERROR" });
    }
    assert.equal(harness.executor.metrics.mockExecutions, 0);
    assert.equal(harness.browser.token, undefined);
  });

  test("C15 / Q01 — ordinary synchronous issuance fixes a validated result and signed quota", async () => {
    harness = createHarness();
    let observed = 0;
    const outcome = await harness.submit(1, { issueResponse(result, token) {
      observed += 1;
      assert.equal(result.reading.result.executionMode, "mock");
      assert.equal(harness.quotaTokens.parse(token).successful_uses, 1);
      assert.equal(harness.store.snapshot().psc_result_valid_committed ?? 0, 0);
      // Returning undefined is the normal response API contract, not a test bypass.
    } });
    assert.equal(observed, 1);
    assert.equal(outcome.quota.successfulUses, 1);
    assert.equal(harness.store.snapshot().psc_result_valid_committed, 1);
  });

  test("C16 / R01 — Unicode input survives transport normalization without invented localization", async () => {
    harness = createHarness();
    const prompt = "Tình huống giả lập: lựa chọn lặp lại — không dùng thông tin thật.";
    const outcome = await harness.submit(1, { request: { ...testRequest(1), prompt } });
    assert.ok(outcome.reading.result.reading.summary.includes(prompt));
    assert.equal(outcome.reading.result.executionMode, "mock");
    assert.equal(harness.executor.metrics.livePscExecutions, 0);
  });
});
