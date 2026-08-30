import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import { CrashSignal, PersistenceError } from "../src/errors.mjs";
import { DAY_MS } from "../src/policy.mjs";
import { createHarness, testKey, testRequest } from "./helpers.mjs";

describe("adversarial concurrency, crash, and recovery suite", () => {
  let harness;
  afterEach(() => harness?.close());

  test("A01 — concurrent final-slot requests cannot exceed four successes", async () => {
    let releaseFinal;
    harness = createHarness({
      behavior: ({ sequence }) => sequence === 4
        ? new Promise((resolve) => { releaseFinal = resolve; })
        : undefined,
    });
    for (let index = 1; index <= 3; index += 1) await harness.submit(index);
    const finalSlot = harness.submit(4);
    await assert.rejects(harness.submit(5), { code: "QUOTA_EXHAUSTED" });
    releaseFinal(undefined);
    const fourth = await finalSlot;
    assert.equal(fourth.quota.successfulUses, 4);
    assert.equal(harness.store.countReadings(harness.identity.userId), 4);
    assert.equal(harness.executor.metrics.mockExecutions, 4);
  });

  test("A02 — double click shares one idempotent reservation", async () => {
    let release;
    harness = createHarness({
      behavior: ({ sequence }) => sequence === 1
        ? new Promise((resolve) => { release = resolve; })
        : undefined,
    });
    const first = harness.submit(1);
    await assert.rejects(harness.submit(1), { code: "REQUEST_IN_PROGRESS" });
    release(undefined);
    await first;
    assert.equal(harness.executor.metrics.mockExecutions, 1);
    assert.equal(harness.store.countReadings(harness.identity.userId), 1);
  });

  test("A03 — network retry after response loss replays the committed result", async () => {
    harness = createHarness();
    const created = await harness.submit(1);
    const retry = await harness.service.createReading({
      identity: harness.identity,
      idempotencyKey: testKey(1),
      request: testRequest(1),
    });
    assert.equal(retry.reading.id, created.reading.id);
    assert.equal(retry.replayed, true);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
  });

  test("A04 — persistence failure releases the slot and a same-key retry may recover", async () => {
    harness = createHarness();
    await assert.rejects(
      harness.submit(1, { faults: { beforePersist: () => { throw new PersistenceError("disk unavailable"); } } }),
      { code: "PERSISTENCE_FAILED" },
    );
    assert.equal(harness.service.quota(harness.identity).successfulUses, 0);
    const recovered = await harness.submit(1);
    assert.equal(recovered.quota.successfulUses, 1);
    assert.equal(harness.store.getReservation(harness.identity.userId, testKey(1)).attempt_count, 2);
    assert.equal(harness.executor.metrics.mockExecutions, 2);
  });

  test("A05 — crash after reserve leaves a lease that stale recovery releases", async () => {
    harness = createHarness({ policy: { reservationTtlMs: 1_000 } });
    await assert.rejects(
      harness.submit(1, { faults: { afterReserve: () => { throw new CrashSignal("after-reserve"); } } }),
      CrashSignal,
    );
    assert.equal(harness.service.quota(harness.identity).reservedUses, 1);
    harness.clock.advance(1_000);
    assert.equal(harness.service.recoverStaleReservations(), 1);
    assert.equal(harness.service.quota(harness.identity).availableReservations, 4);
    await harness.submit(1);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
  });

  test("A06 — crash after execute consumes no use and can recover after lease expiry", async () => {
    harness = createHarness({ policy: { reservationTtlMs: 1_000 } });
    await assert.rejects(
      harness.submit(1, { faults: { afterExecute: () => { throw new CrashSignal("after-execute"); } } }),
      CrashSignal,
    );
    assert.equal(harness.service.quota(harness.identity).successfulUses, 0);
    harness.clock.advance(1_000);
    harness.service.recoverStaleReservations();
    const retried = await harness.submit(1);
    assert.equal(retried.quota.successfulUses, 1);
    assert.equal(harness.executor.metrics.mockExecutions, 2);
  });

  test("A07 — crash before commit rolls the reading and cycle back atomically", async () => {
    harness = createHarness({ policy: { reservationTtlMs: 1_000 } });
    await assert.rejects(
      harness.submit(1, { faults: { beforeCommit: () => { throw new CrashSignal("before-commit"); } } }),
      CrashSignal,
    );
    assert.equal(harness.store.countReadings(harness.identity.userId), 0);
    const quota = harness.service.quota(harness.identity);
    assert.equal(quota.successfulUses, 0);
    assert.equal(quota.cycleId, null);
    assert.equal(quota.reservedUses, 1);
  });

  test("A08 — crash after commit replays the durable reading without rerun", async () => {
    harness = createHarness();
    await assert.rejects(
      harness.submit(1, { faults: { afterCommit: () => { throw new CrashSignal("after-commit"); } } }),
      CrashSignal,
    );
    assert.equal(harness.store.countReadings(harness.identity.userId), 1);
    assert.equal(harness.service.quota(harness.identity).successfulUses, 1);
    const replay = await harness.submit(1);
    assert.equal(replay.replayed, true);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
  });

  test("A09 — stale recovery is idempotent", async () => {
    harness = createHarness({ policy: { reservationTtlMs: 100 } });
    await assert.rejects(
      harness.submit(1, { faults: { afterReserve: () => { throw new CrashSignal("stale-test"); } } }),
      CrashSignal,
    );
    harness.clock.advance(100);
    assert.equal(harness.service.recoverStaleReservations(), 1);
    assert.equal(harness.service.recoverStaleReservations(), 0);
    assert.equal(harness.service.quota(harness.identity).reservedUses, 0);
  });

  test("A10 — expiry boundary is exclusive and opens a fresh cycle exactly on time", async () => {
    harness = createHarness();
    let last;
    for (let index = 1; index <= 4; index += 1) last = await harness.submit(index);
    const end = Date.parse(last.quota.cycleEndsAt);
    harness.clock.set(end - 1);
    await assert.rejects(harness.submit(50), { code: "QUOTA_EXHAUSTED" });
    harness.clock.set(end);
    const quota = harness.service.quota(harness.identity);
    assert.equal(quota.eligible, true);
    assert.equal(quota.successfulUses, 0);
    const next = await harness.submit(50);
    assert.equal(next.quota.successfulUses, 1);
    assert.equal(Date.parse(next.quota.cycleStartsAt), end);
  });

  test("A11 — first success after a long expiry starts at success time, not attempt time", async () => {
    harness = createHarness();
    const first = await harness.submit(1);
    harness.clock.set(Date.parse(first.quota.cycleEndsAt) + 3 * DAY_MS);
    const next = await harness.submit(2);
    assert.equal(Date.parse(next.quota.cycleStartsAt), harness.clock.now());
  });

  test("A12 — reopen after expiry does not reserve, execute, or create a new cycle", async () => {
    harness = createHarness();
    const first = await harness.submit(1);
    harness.clock.advance(31 * DAY_MS);
    const reopened = harness.service.reopen(harness.identity, first.reading.id);
    assert.equal(reopened.id, first.reading.id);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
    assert.equal(harness.service.quota(harness.identity).cycleId, null);
  });

  test("A13 — transaction rollback removes partial reading, cycle, and use", async () => {
    harness = createHarness();
    await assert.rejects(
      harness.submit(1, { faults: { beforeCommit: () => { throw new PersistenceError("commit fault"); } } }),
      { code: "PERSISTENCE_FAILED" },
    );
    const quota = harness.service.quota(harness.identity);
    assert.equal(harness.store.countReadings(harness.identity.userId), 0);
    assert.equal(quota.successfulUses, 0);
    assert.equal(quota.cycleId, null);
    assert.equal(quota.reservedUses, 0);
  });

  test("A14 — idempotency collision is rejected while exact replay remains stable", async () => {
    harness = createHarness();
    const created = await harness.submit(1);
    await assert.rejects(
      harness.submit(2, { idempotencyKey: testKey(1) }),
      { code: "IDEMPOTENCY_COLLISION" },
    );
    const replay = await harness.submit(1);
    assert.equal(replay.reading.id, created.reading.id);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
    assert.equal(harness.service.quota(harness.identity).successfulUses, 1);
  });

  test("A15 — persistent rate limiting blocks new inference without consuming quota", async () => {
    harness = createHarness({ policy: { maxSuccessfulResults: 10, rateLimitMax: 2 } });
    await harness.submit(1);
    await harness.submit(2);
    await assert.rejects(harness.submit(3), { code: "RATE_LIMITED" });
    assert.equal(harness.executor.metrics.mockExecutions, 2);
    assert.equal(harness.service.quota(harness.identity).successfulUses, 2);
  });
});
