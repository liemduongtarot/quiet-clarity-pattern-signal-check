// Only constant counter names cross this boundary. No event properties or identity.
export const CLIENT_COUNTERS = Object.freeze([
  "psc_started",
  "psc_result_copy_succeeded",
  "psc_result_download_initiated",
  "paid_bridge_rendered",
  "paid_bridge_opened",
]);

export const PRODUCT_COUNTERS = Object.freeze([
  ...CLIENT_COUNTERS,
  "psc_result_valid_committed",
  "quota_cycle_started",
  "quota_cycle_reached_2",
  "quota_cycle_reached_3",
  "quota_cycle_reached_4",
  "quota_blocked",
  "time_to_exhaust_under_1h",
  "time_to_exhaust_1h_to_24h",
  "time_to_exhaust_24h_to_720h",
]);

export const COMMERCE_COUNTERS = Object.freeze([
  "checkout_attempt_created",
  "payment_completed",
]);

export const ALL_COUNTERS = Object.freeze([...PRODUCT_COUNTERS, ...COMMERCE_COUNTERS]);

export function assertCounterName(name) {
  if (typeof name !== "string" || !ALL_COUNTERS.includes(name)) {
    throw new TypeError("Counter name is not allowed");
  }
  return name;
}

export function assertClientEvent(name) {
  if (typeof name !== "string" || !CLIENT_COUNTERS.includes(name)) {
    throw new TypeError("Client event is not allowed");
  }
  return name;
}

// No dimensions, timestamps or public reading endpoint. Production release governance
// is still required; thresholding alone is not a universal anonymity guarantee.
export function suppressSparseTotals(totals) {
  return Object.freeze(Object.fromEntries(ALL_COUNTERS.map((counter) => {
    const value = totals[counter] ?? 0;
    if (!Number.isSafeInteger(value) || value < 0) throw new TypeError("Invalid aggregate total");
    return [counter, value < 20 ? null : Math.floor(value / 20) * 20];
  })));
}
