-- A fresh successor database only. Never migrate a v1 identity/history database.
CREATE TABLE aggregate_counters (
  counter TEXT NOT NULL PRIMARY KEY CHECK (counter IN (
    'psc_started',
    'psc_result_copy_succeeded',
    'psc_result_download_initiated',
    'paid_bridge_rendered',
    'paid_bridge_opened',
    'psc_result_valid_committed',
    'quota_cycle_started',
    'quota_cycle_reached_2',
    'quota_cycle_reached_3',
    'quota_cycle_reached_4',
    'quota_blocked',
    'time_to_exhaust_under_1h',
    'time_to_exhaust_1h_to_24h',
    'time_to_exhaust_24h_to_720h',
    'checkout_attempt_created',
    'payment_completed'
  )),
  value INTEGER NOT NULL CHECK (typeof(value) = 'integer' AND value >= 0 AND value <= 9007199254740991)
);
