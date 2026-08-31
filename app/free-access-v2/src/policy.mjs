const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_POLICY = Object.freeze({
  maxSuccessfulResults: 4,
  cycleDurationMs: 720 * 60 * 60 * 1000,
  executionTimeoutMs: 10000,
  transportAttemptMs: 15000,
  retryBackoffMs: Object.freeze([1000, 2000]),
  receiptTtlMs: 3 * 15000 + 1000 + 2000,
  receiptReaperMs: 1000,
  maxRequestBytes: 16 * 1024,
  maxReceipts: 1000,
});

export function createPolicy(overrides = {}) {
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) throw new TypeError("Invalid policy configuration");
  const policy = { ...DEFAULT_POLICY };
  for (const [key, value] of Object.entries(overrides)) {
    if (!Object.hasOwn(DEFAULT_POLICY, key)) throw new TypeError("Unknown policy configuration");
    if (key === "maxRequestBytes" || key === "maxReceipts") {
      if (!Number.isSafeInteger(value) || value <= 0 || value > DEFAULT_POLICY[key]) throw new TypeError("Resource limits may only be reduced");
      policy[key] = value;
    } else if (JSON.stringify(value) !== JSON.stringify(DEFAULT_POLICY[key])) {
      throw new TypeError("The qualified allowance and operational envelope are fixed");
    }
  }

  return Object.freeze(policy);
}

export function policyFromEnvironment(environment = process.env) {
  for (const name of ["FREE_ACCESS_MAX_RESULTS", "FREE_ACCESS_CYCLE_DAYS", "FREE_ACCESS_RESERVATION_TTL_SECONDS", "FREE_ACCESS_RATE_LIMIT_MAX", "FREE_ACCESS_RATE_LIMIT_WINDOW_SECONDS"]) {
    if (environment[name] !== undefined) throw new TypeError("Legacy identity-policy overrides are not accepted");
  }
  return createPolicy({
    ...(environment.FREE_ACCESS_MAX_RECEIPTS !== undefined ? { maxReceipts: Number(environment.FREE_ACCESS_MAX_RECEIPTS) } : {}),
    ...(environment.FREE_ACCESS_MAX_REQUEST_BYTES !== undefined ? { maxRequestBytes: Number(environment.FREE_ACCESS_MAX_REQUEST_BYTES) } : {}),
  });
}

export { DAY_MS };
