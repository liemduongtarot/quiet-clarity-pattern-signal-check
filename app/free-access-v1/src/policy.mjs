const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_POLICY = Object.freeze({
  maxSuccessfulResults: 4,
  cycleDurationMs: 30 * DAY_MS,
  reservationTtlMs: 10 * 60 * 1000,
  rateLimitMax: 30,
  rateLimitWindowMs: 60 * 1000,
  maxRequestBytes: 16 * 1024,
});

function positiveInteger(value, name) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) {
    throw new TypeError(`${name} must be a positive integer`);
  }
  return number;
}

export function createPolicy(overrides = {}) {
  const policy = {
    ...DEFAULT_POLICY,
    ...overrides,
  };

  for (const key of Object.keys(DEFAULT_POLICY)) {
    policy[key] = positiveInteger(policy[key], key);
  }

  return Object.freeze(policy);
}

export function policyFromEnvironment(environment = process.env) {
  return createPolicy({
    maxSuccessfulResults: environment.FREE_ACCESS_MAX_RESULTS ?? DEFAULT_POLICY.maxSuccessfulResults,
    cycleDurationMs: environment.FREE_ACCESS_CYCLE_DAYS
      ? positiveInteger(environment.FREE_ACCESS_CYCLE_DAYS, "FREE_ACCESS_CYCLE_DAYS") * DAY_MS
      : DEFAULT_POLICY.cycleDurationMs,
    reservationTtlMs: environment.FREE_ACCESS_RESERVATION_TTL_SECONDS
      ? positiveInteger(environment.FREE_ACCESS_RESERVATION_TTL_SECONDS, "FREE_ACCESS_RESERVATION_TTL_SECONDS") * 1000
      : DEFAULT_POLICY.reservationTtlMs,
    rateLimitMax: environment.FREE_ACCESS_RATE_LIMIT_MAX ?? DEFAULT_POLICY.rateLimitMax,
    rateLimitWindowMs: environment.FREE_ACCESS_RATE_LIMIT_WINDOW_SECONDS
      ? positiveInteger(environment.FREE_ACCESS_RATE_LIMIT_WINDOW_SECONDS, "FREE_ACCESS_RATE_LIMIT_WINDOW_SECONDS") * 1000
      : DEFAULT_POLICY.rateLimitWindowMs,
    maxRequestBytes: environment.FREE_ACCESS_MAX_REQUEST_BYTES ?? DEFAULT_POLICY.maxRequestBytes,
  });
}

export { DAY_MS };
