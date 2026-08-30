import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import { CrashSignal, ExecutionError } from "../src/errors.mjs";
import { DAY_MS } from "../src/policy.mjs";
import { createHarness, testKey, testRequest } from "./helpers.mjs";

describe("12 canonical Free Access acceptance tests", () => {
  let harness;
  afterEach(() => harness?.close());

  test("C01 — unverified identity is rejected before execution", async () => {
    harness = createHarness();
    await assert.rejects(
      harness.submit(1, { identity: { userId: "u", email: "u@example.test", emailVerified: false } }),
      { code: "AUTHENTICATION_REQUIRED" },
    );
    assert.deepEqual(harness.executor.metrics, { mockExecutions: 0, livePscExecutions: 0 });
  });

  test("C02 — a fresh verified user has four slots and no cycle yet", () => {
    harness = createHarness();
    const quota = harness.service.quota(harness.identity);
    assert.equal(quota.successfulUses, 0);
    assert.equal(quota.remainingSuccessfulResults, 4);
    assert.equal(quota.cycleStartsAt, null);
    assert.equal(quota.cycleEndsAt, null);
  });

  test("C03 — first successful persisted result starts the rolling cycle", async () => {
    harness = createHarness();
    const before = harness.clock.now();
    const outcome = await harness.submit(1);
    assert.equal(outcome.quota.successfulUses, 1);
    assert.equal(Date.parse(outcome.quota.cycleStartsAt), before);
    assert.equal(Date.parse(outcome.quota.cycleEndsAt), before + 30 * DAY_MS);
    assert.equal(harness.store.countReadings(harness.identity.userId), 1);
  });

  test("C04 — second and third successful results consume exactly one use each", async () => {
    harness = createHarness();
    await harness.submit(1);
    await harness.submit(2);
    const third = await harness.submit(3);
    assert.equal(third.quota.successfulUses, 3);
    assert.equal(third.quota.remainingSuccessfulResults, 1);
    assert.equal(harness.executor.metrics.mockExecutions, 3);
  });

  test("C05 — the fourth result is delivered and persisted in full", async () => {
    harness = createHarness();
    for (let index = 1; index <= 3; index += 1) await harness.submit(index);
    const fourth = await harness.submit(4);
    assert.equal(fourth.reading.result.schemaVersion, "psc-execution-result/v1");
    assert.equal(fourth.reading.result.executionMode, "mock");
    assert.ok(fourth.reading.result.reading.summary);
    assert.equal(fourth.reading.result.reading.signals.length, 2);
    assert.equal(fourth.quota.successfulUses, 4);
    assert.equal(fourth.quota.remainingSuccessfulResults, 0);
    assert.equal(harness.store.countReadings(harness.identity.userId), 4);
  });

  test("C06 — the fifth attempt is blocked before inference", async () => {
    harness = createHarness();
    for (let index = 1; index <= 4; index += 1) await harness.submit(index);
    await assert.rejects(harness.submit(5), { code: "QUOTA_EXHAUSTED" });
    assert.equal(harness.executor.metrics.mockExecutions, 4);
    assert.equal(harness.executor.metrics.livePscExecutions, 0);
  });

  test("C07 — executor failure releases the reservation and consumes no use", async () => {
    harness = createHarness({ behavior: () => new ExecutionError("controlled failure") });
    await assert.rejects(harness.submit(1), { code: "EXECUTION_FAILED" });
    const quota = harness.service.quota(harness.identity);
    assert.equal(quota.successfulUses, 0);
    assert.equal(quota.reservedUses, 0);
    assert.equal(quota.cycleStartsAt, null);
    assert.equal(harness.store.countReadings(harness.identity.userId), 0);
  });

  test("C08 — an unusable executor result releases the reservation", async () => {
    harness = createHarness({ behavior: () => ({ schemaVersion: "wrong" }) });
    await assert.rejects(harness.submit(1), { code: "EXECUTION_FAILED" });
    assert.equal(harness.service.quota(harness.identity).remainingSuccessfulResults, 4);
    assert.equal(harness.store.countReadings(harness.identity.userId), 0);
  });

  test("C09 — retry replay returns the same reading without a second use", async () => {
    harness = createHarness();
    const first = await harness.submit(1);
    const replay = await harness.submit(1);
    assert.equal(replay.replayed, true);
    assert.equal(replay.reading.id, first.reading.id);
    assert.equal(replay.quota.successfulUses, 1);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
    assert.equal(harness.store.countReadings(harness.identity.userId), 1);
  });

  test("C10 — history contains only successfully persisted results", async () => {
    harness = createHarness();
    await harness.submit(1);
    await harness.submit(2);
    const history = harness.service.history(harness.identity);
    assert.equal(history.length, 2);
    assert.ok(history.every((reading) => reading.result.reading.summary));
  });

  test("C11 — reopen after expiry returns the saved full result and never reruns", async () => {
    harness = createHarness();
    const created = await harness.submit(1);
    harness.clock.advance(31 * DAY_MS);
    const reopened = harness.service.reopen(harness.identity, created.reading.id);
    assert.deepEqual(reopened, created.reading);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
  });

  test("C12 — first success after expiry starts a new rolling cycle", async () => {
    harness = createHarness();
    const first = await harness.submit(1);
    harness.clock.set(Date.parse(first.quota.cycleEndsAt));
    const between = harness.service.quota(harness.identity);
    assert.equal(between.successfulUses, 0);
    assert.equal(between.cycleId, null);
    const next = await harness.service.createReading({
      identity: harness.identity,
      idempotencyKey: testKey(100),
      request: testRequest(100),
    });
    assert.notEqual(next.quota.cycleId, first.quota.cycleId);
    assert.equal(Date.parse(next.quota.cycleStartsAt), harness.clock.now());
    assert.equal(next.quota.successfulUses, 1);
  });
});
