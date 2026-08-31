import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { SignedQuotaTokens, quotaTokenFromRequest } from "../src/auth/quota-token.mjs";
import { ManualClock } from "../src/clock.mjs";
import { createPolicy, policyFromEnvironment } from "../src/policy.mjs";
import { CYCLE_MS, TEST_QUOTA_KEY_ID, TEST_QUOTA_SECRET } from "./helpers.mjs";

function tokenFixture() {
  const clock = new ManualClock();
  const tokens = new SignedQuotaTokens({ keys: { [TEST_QUOTA_KEY_ID]: TEST_QUOTA_SECRET }, keyId: TEST_QUOTA_KEY_ID, clock });
  const valid = tokens.issue({ cycleStartedAt: clock.now(), successfulUses: 1 });
  const payload = JSON.parse(Buffer.from(valid.split(".")[0], "base64url").toString("utf8"));
  return { clock, tokens, valid, payload };
}

// Adversarial test-only signing oracle: validity of a MAC must not bypass schema.
function signTestPayload(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${createHmac("sha256", TEST_QUOTA_SECRET).update(encoded).digest("base64url")}`;
}

test("T01 / Q06 — token contains only the five purpose-bound payload fields", () => {
  const { tokens, valid, payload } = tokenFixture();
  assert.deepEqual(Object.keys(payload), ["version", "cycle_started_at", "successful_uses", "expires_at", "key_id"]);
  assert.equal(payload.expires_at - payload.cycle_started_at, CYCLE_MS);
  assert.equal(payload.successful_uses, 1);
  assert.equal(payload.version, 1);
  assert.deepEqual(tokens.parse(valid), payload);
});

test("T02 / Q06 — edited payload and edited signature fail closed", () => {
  const { tokens, valid, payload } = tokenFixture();
  const [encoded, signature] = valid.split(".");
  const changed = Buffer.from(JSON.stringify({ ...payload, successful_uses: 4 })).toString("base64url");
  assert.throws(() => tokens.parse(`${changed}.${signature}`), { code: "QUOTA_TOKEN_INVALID" });
  const alteredSignature = `${signature[0] === "A" ? "B" : "A"}${signature.slice(1)}`;
  assert.throws(() => tokens.parse(`${encoded}.${alteredSignature}`), { code: "QUOTA_TOKEN_INVALID" });
});

test("T03 / Q06 — malformed tokens reject; absence alone means no active cycle", () => {
  const { tokens, valid } = tokenFixture();
  assert.equal(tokens.parse(undefined), null);
  assert.equal(tokens.parse(null), null);
  for (const token of ["", "null", "{}", "abc.def", [], 1, `${valid}=`, `${valid}.extra`, valid.repeat(10)]) {
    assert.throws(() => tokens.parse(token), { code: "QUOTA_TOKEN_INVALID" });
  }
});

test("T04 / Q06 E01 — correctly signed extra identity/history/experiment fields reject", () => {
  const { tokens, payload } = tokenFixture();
  for (const field of ["visitor_id", "cycle_number", "question", "result", "classification", "status", "experiment", "payment_history", "browser_history", "token_hash"]) {
    assert.throws(() => tokens.parse(signTestPayload({ ...payload, [field]: "SYNTHETIC_FORBIDDEN" })), { code: "QUOTA_TOKEN_INVALID" });
  }
});

test("T05 / Q06 — unknown schema, key, missing field and noncanonical field order reject", () => {
  const { tokens, payload } = tokenFixture();
  const missing = { ...payload }; delete missing.key_id;
  const reordered = Object.fromEntries(Object.entries(payload).reverse());
  for (const candidate of [{ ...payload, version: 2 }, { ...payload, key_id: "unknown-test-key" }, missing, reordered, []]) {
    assert.throws(() => tokens.parse(signTestPayload(candidate)), { code: "QUOTA_TOKEN_INVALID" });
  }
});

test("T06 / Q06 — future, noninteger, bad-arithmetic and outside-1-to-4 claims reject", () => {
  const { tokens, payload, clock } = tokenFixture();
  const cases = [
    { ...payload, cycle_started_at: clock.now() + 1, expires_at: clock.now() + 1 + CYCLE_MS },
    { ...payload, cycle_started_at: -1, expires_at: CYCLE_MS - 1 },
    { ...payload, cycle_started_at: payload.cycle_started_at + 0.5, expires_at: payload.expires_at + 0.5 },
    { ...payload, expires_at: payload.expires_at + 1 },
    ...[0, 5, -1, 1.5, "1", null].map((successful_uses) => ({ ...payload, successful_uses })),
  ];
  for (const candidate of cases) assert.throws(() => tokens.parse(signTestPayload(candidate)), { code: "QUOTA_TOKEN_INVALID" });
});

test("T07 / Q05 — correctly signed token expires at exactly 720 hours", () => {
  const { tokens, valid, clock, payload } = tokenFixture();
  clock.set(payload.expires_at - 1);
  assert.equal(tokens.parse(valid).successful_uses, 1);
  clock.advance(1);
  assert.equal(tokens.parse(valid), null);
  assert.equal(tokens.quota(valid).successfulUses, 0);
  assert.equal(tokens.next(valid).quota.cycleStartsAt, new Date(payload.expires_at).toISOString());
});

test("T08 / Q06 — signing configuration rejects short/default or missing current key", () => {
  for (const config of [
    { keys: { test: "short" }, keyId: "test" },
    { keys: { test: TEST_QUOTA_SECRET }, keyId: "missing" },
    { keys: {}, keyId: "test" },
  ]) assert.throws(() => new SignedQuotaTokens(config), TypeError);
});

test("T09 / Q06 — key rotation verifies admitted old key without browser registry", () => {
  const { valid, clock } = tokenFixture();
  const rotated = new SignedQuotaTokens({
    keys: { [TEST_QUOTA_KEY_ID]: TEST_QUOTA_SECRET, rotation: "TEST-ONLY-second-key-for-rotation-qualification" },
    keyId: "rotation", clock,
  });
  assert.equal(rotated.parse(valid).successful_uses, 1);
  assert.equal(rotated.parse(rotated.next(valid).token).key_id, "rotation");
  const removed = new SignedQuotaTokens({ keys: { rotation: "TEST-ONLY-second-key-for-rotation-qualification" }, keyId: "rotation", clock });
  assert.throws(() => removed.parse(valid), { code: "QUOTA_TOKEN_INVALID" });
});

test("T10 / S03 — production cookie retains host-prefix security and fixed expiry", () => {
  const { tokens, valid, clock, payload } = tokenFixture();
  clock.advance(1_500);
  const cookie = tokens.cookie(valid);
  assert.match(cookie, /^__Host-psc_quota=/);
  for (const attribute of ["Secure", "HttpOnly", "SameSite=Lax", "Path=/"]) assert.ok(cookie.split("; ").includes(attribute));
  assert.doesNotMatch(cookie, /(?:^|;)\s*Domain=/i);
  const maxAge = Number(/Max-Age=(\d+)/.exec(cookie)[1]);
  assert.ok(clock.now() + maxAge * 1000 <= payload.expires_at);
});

test("T11 / S03 — local/production cookie names cannot cross modes or be duplicated", () => {
  const { tokens, valid } = tokenFixture();
  const local = tokens.cookie(valid, { localSynthetic: true });
  assert.match(local, /^psc_quota_local_synthetic=/);
  assert.doesNotMatch(local, /(?:^|;)\s*Secure(?:;|$)/);
  assert.throws(() => quotaTokenFromRequest({ headers: { cookie: `psc_quota_local_synthetic=${valid}` } }), { code: "QUOTA_TOKEN_INVALID" });
  assert.throws(() => quotaTokenFromRequest({ headers: { cookie: `__Host-psc_quota=${valid}` } }, { localSynthetic: true }), { code: "QUOTA_TOKEN_INVALID" });
  assert.throws(() => quotaTokenFromRequest({ headers: { cookie: `__Host-psc_quota=${valid}; __Host-psc_quota=${valid}` } }), { code: "QUOTA_TOKEN_INVALID" });
});

test("T12 / Q01 S02 — policy fixes 4, 720h, 10s deadline and derived 48s recovery", () => {
  const policy = createPolicy();
  assert.equal(policy.maxSuccessfulResults, 4);
  assert.equal(policy.cycleDurationMs, CYCLE_MS);
  assert.equal(policy.executionTimeoutMs, 10_000);
  assert.equal(policy.transportAttemptMs, 15_000);
  assert.deepEqual(policy.retryBackoffMs, [1_000, 2_000]);
  assert.equal(policy.receiptTtlMs, 3 * policy.transportAttemptMs + policy.retryBackoffMs.reduce((sum, value) => sum + value, 0));
  for (const override of [{ maxSuccessfulResults: 5 }, { cycleDurationMs: CYCLE_MS + 1 }, { receiptTtlMs: 49_000 }, { executionTimeoutMs: 20_000 }]) {
    assert.throws(() => createPolicy(override), TypeError);
  }
  assert.throws(() => policyFromEnvironment({ FREE_ACCESS_MAX_RESULTS: "5" }), TypeError);
  assert.throws(() => policyFromEnvironment({ FREE_ACCESS_CYCLE_DAYS: "31" }), TypeError);
});
