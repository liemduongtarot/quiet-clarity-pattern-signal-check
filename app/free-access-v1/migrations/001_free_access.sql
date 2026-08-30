CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  email_verified INTEGER NOT NULL CHECK (email_verified = 1),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE quota_cycles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  starts_at INTEGER NOT NULL,
  ends_at INTEGER NOT NULL,
  successful_uses INTEGER NOT NULL DEFAULT 0 CHECK (successful_uses >= 0),
  created_at INTEGER NOT NULL,
  CHECK (ends_at > starts_at)
);

CREATE INDEX quota_cycles_user_window_idx
  ON quota_cycles(user_id, starts_at DESC, ends_at DESC);

CREATE TABLE reservations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  request_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('RESERVED', 'COMMITTED', 'RELEASED')),
  attempt_count INTEGER NOT NULL DEFAULT 1 CHECK (attempt_count > 0),
  expires_at INTEGER NOT NULL,
  reading_id TEXT,
  failure_code TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(user_id, idempotency_key)
);

CREATE INDEX reservations_user_status_expiry_idx
  ON reservations(user_id, status, expires_at);

CREATE TABLE readings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reservation_id TEXT NOT NULL UNIQUE REFERENCES reservations(id),
  cycle_id TEXT NOT NULL REFERENCES quota_cycles(id),
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  request_json TEXT NOT NULL,
  result_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, idempotency_key)
);

CREATE INDEX readings_user_created_idx
  ON readings(user_id, created_at DESC, id DESC);

CREATE TABLE rate_limit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_at INTEGER NOT NULL
);

CREATE INDEX rate_limit_events_user_time_idx
  ON rate_limit_events(user_id, event_at);

CREATE TABLE analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  event_name TEXT NOT NULL,
  properties_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX analytics_events_user_time_idx
  ON analytics_events(user_id, created_at);
