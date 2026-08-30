import { createPolicy } from "../src/policy.mjs";
import { ManualClock } from "../src/clock.mjs";
import { MockPSCExecutor } from "../src/executor/mock-psc.mjs";
import { FreeAccessService } from "../src/service/free-access-service.mjs";
import { SqliteFreeAccessStore } from "../src/storage/sqlite-store.mjs";

export const TEST_IDENTITY = Object.freeze({
  userId: "user-verified-1",
  email: "verified@example.test",
  emailVerified: true,
});

export function testRequest(index = 1) {
  return { prompt: `Situation ${index}: I keep seeing the same decision pattern.`, context: { index } };
}

export function testKey(index = 1) {
  return `test-key-${String(index).padStart(4, "0")}`;
}

export function createHarness({ policy: policyOverrides, behavior, clock: suppliedClock } = {}) {
  const clock = suppliedClock ?? new ManualClock();
  const policy = createPolicy(policyOverrides);
  const store = new SqliteFreeAccessStore();
  const executor = new MockPSCExecutor({ clock, behavior });
  const service = new FreeAccessService({ store, executor, policy, clock });
  return {
    clock,
    executor,
    identity: TEST_IDENTITY,
    policy,
    service,
    store,
    submit(index, options = {}) {
      return service.createReading({
        identity: options.identity ?? TEST_IDENTITY,
        idempotencyKey: options.idempotencyKey ?? testKey(index),
        request: options.request ?? testRequest(index),
        faults: options.faults,
      });
    },
    close() {
      store.close();
    },
  };
}
