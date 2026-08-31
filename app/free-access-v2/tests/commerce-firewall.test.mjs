import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { validateCheckoutAttempt, validatePaymentCompletion } from "../src/commerce/contract.mjs";
import { SqliteFreeAccessStore } from "../src/storage/sqlite-store.mjs";
import { ManualClock } from "../src/clock.mjs";
import { PRODUCT_COUNTERS, COMMERCE_COUNTERS } from "../src/analytics/counters.mjs";
import { SyntheticCommerceFixture } from "./fixtures/synthetic-commerce.mjs";

test("M01 / C01 — unconnected commerce interface admits only empty or finite variant shape", () => {
  assert.deepEqual(validateCheckoutAttempt({}), {});
  assert.deepEqual(validateCheckoutAttempt({ variant: "A" }), { variant: "A" });
  assert.deepEqual(validateCheckoutAttempt({ variant: "B" }), { variant: "B" });
  for (const input of [null, [], "A", { variant: "C" }, { variant: "" }, { variant: undefined }, new Date()]) {
    assert.throws(() => validateCheckoutAttempt(input), TypeError);
  }
});

test("M02 / C01 — every Free activity and payment identity linkage field is rejected", () => {
  const fields = [
    "quota_token", "token_hash", "successful_uses", "classification", "status", "question", "result",
    "receipt", "execution_id", "free_history", "email", "name", "payment_identity", "browser_id", "visitor_id",
  ];
  const checkout_attempt_id = randomUUID();
  for (const key of fields) {
    assert.throws(() => validateCheckoutAttempt({ [key]: "SYNTHETIC_FORBIDDEN" }), TypeError);
    assert.throws(() => validateCheckoutAttempt({ variant: "A", [key]: "SYNTHETIC_FORBIDDEN" }), TypeError);
    assert.throws(() => validatePaymentCompletion({ checkout_attempt_id, [key]: "SYNTHETIC_FORBIDDEN" }), TypeError);
  }
});

test("M03 / C01 — prototype/symbol payloads cannot smuggle linkage properties", () => {
  const inherited = Object.create({ email: "synthetic@example.test" });
  const symbolic = { [Symbol("visitor")]: "SYNTHETIC_FORBIDDEN" };
  assert.throws(() => validateCheckoutAttempt(inherited), TypeError);
  assert.throws(() => validateCheckoutAttempt(symbolic), TypeError);
  assert.throws(() => validatePaymentCompletion(Object.assign(Object.create({ history: true }), { checkout_attempt_id: randomUUID() })), TypeError);
});

test("M04 / C01 — completion accepts exactly a lowercase isolated UUIDv4", () => {
  const checkout_attempt_id = randomUUID();
  assert.deepEqual(validatePaymentCompletion({ checkout_attempt_id }), { checkout_attempt_id });
  for (const input of [{}, null, [], { checkout_attempt_id: "unknown" }, { checkout_attempt_id: checkout_attempt_id.toUpperCase() }, { checkout_attempt_id, variant: "A" }]) {
    assert.throws(() => validatePaymentCompletion(input), TypeError);
  }
});

test("M05 / C01 — TEST-ONLY attempt/completion correlation counts completion once", () => {
  const store = new SqliteFreeAccessStore();
  const fixture = new SyntheticCommerceFixture({ clock: new ManualClock(), counters: store });
  try {
    const first = fixture.create({});
    const second = fixture.create({ variant: "A" });
    assert.notEqual(first.checkout_attempt_id, second.checkout_attempt_id);
    assert.equal(fixture.complete(first), true);
    assert.equal(fixture.complete(first), false);
    assert.equal(fixture.complete(second), true);
    const counts = store.snapshot();
    assert.equal(counts.checkout_attempt_created, 2);
    assert.equal(counts.payment_completed, 2);
    assert.ok(PRODUCT_COUNTERS.every((name) => (counts[name] ?? 0) === 0));
    assert.equal(JSON.stringify(counts).includes(first.checkout_attempt_id), false);
    assert.equal(JSON.stringify(counts).includes(second.checkout_attempt_id), false);
    assert.equal(COMMERCE_COUNTERS.some((name) => PRODUCT_COUNTERS.includes(name)), false);
  } finally { fixture.close(); store.close(); }
});

test("M06 / C01 — rejected TEST-ONLY commerce payloads create neither state nor counters", () => {
  const store = new SqliteFreeAccessStore();
  const fixture = new SyntheticCommerceFixture({ clock: new ManualClock(), counters: store });
  try {
    assert.throws(() => fixture.create({ quota_token: "SYNTHETIC_TOKEN" }));
    assert.throws(() => fixture.complete({ checkout_attempt_id: randomUUID(), result: "SYNTHETIC_RESULT" }));
    assert.equal(fixture.size, 0);
    assert.equal(store.snapshot().checkout_attempt_created ?? 0, 0);
    assert.equal(store.snapshot().payment_completed ?? 0, 0);
  } finally { fixture.close(); store.close(); }
});

test("M07 / C01 — TEST-ONLY attempt state expires and close clears it", () => {
  const clock = new ManualClock();
  const store = new SqliteFreeAccessStore();
  const fixture = new SyntheticCommerceFixture({ clock, counters: store });
  try {
    const expired = fixture.create({});
    clock.advance(1_000);
    assert.throws(() => fixture.complete(expired), /unavailable/);
    assert.equal(fixture.size, 0);
    assert.equal(store.snapshot().payment_completed ?? 0, 0);
    fixture.create({});
    fixture.close();
    assert.equal(fixture.size, 0);
  } finally { fixture.close(); store.close(); }
});

test("M08 / C01 — accessor changes cannot bypass commerce field validation", () => {
  let reads = 0;
  const attempt = Object.defineProperty({}, "variant", { enumerable: true, get() { reads += 1; return reads === 1 ? "A" : "SYNTHETIC_PRIVATE_DATA"; } });
  const completion = Object.defineProperty({}, "checkout_attempt_id", { enumerable: true, get() { reads += 1; return randomUUID(); } });
  assert.throws(() => validateCheckoutAttempt(attempt), TypeError);
  assert.throws(() => validatePaymentCompletion(completion), TypeError);
  assert.equal(reads, 0);
  const source = { variant: "A" };
  const admitted = validateCheckoutAttempt(source);
  source.variant = "SYNTHETIC_PRIVATE_DATA";
  assert.deepEqual(admitted, { variant: "A" });
  assert.equal(Object.isFrozen(admitted), true);
});
