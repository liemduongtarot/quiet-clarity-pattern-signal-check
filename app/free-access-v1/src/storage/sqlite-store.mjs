import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import {
  IdempotencyCollisionError,
  NotFoundError,
  PersistenceError,
  QuotaExceededError,
} from "../errors.mjs";

const DEFAULT_MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), "../../migrations");

function asReading(row) {
  if (!row) return null;
  return Object.freeze({
    id: row.id,
    userId: row.user_id,
    cycleId: row.cycle_id,
    idempotencyKey: row.idempotency_key,
    requestHash: row.request_hash,
    request: JSON.parse(row.request_json),
    result: JSON.parse(row.result_json),
    createdAt: new Date(row.created_at).toISOString(),
  });
}

export class SqliteFreeAccessStore {
  #db;
  #id;

  constructor({ filename = ":memory:", migrationsDirectory = DEFAULT_MIGRATIONS, idFactory = randomUUID } = {}) {
    if (filename !== ":memory:") mkdirSync(dirname(resolve(filename)), { recursive: true });
    this.#db = new DatabaseSync(filename);
    this.#id = idFactory;
    this.#db.exec("PRAGMA foreign_keys = ON");
    this.#db.exec("PRAGMA busy_timeout = 5000");
    if (filename !== ":memory:") this.#db.exec("PRAGMA journal_mode = WAL");
    this.#migrate(migrationsDirectory);
  }

  close() {
    this.#db.close();
  }

  #migrate(directory) {
    this.#db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL
      )
    `);
    const applied = this.#db.prepare("SELECT version FROM schema_migrations").all().map((row) => row.version);
    const appliedSet = new Set(applied);
    const files = readdirSync(directory).filter((name) => /^\d+_.+\.sql$/.test(name)).sort();
    for (const file of files) {
      if (appliedSet.has(file)) continue;
      const sql = readFileSync(resolve(directory, file), "utf8");
      this.#transaction(() => {
        this.#db.exec(sql);
        this.#db.prepare("INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)")
          .run(file, new Date().toISOString());
      });
    }
  }

  #transaction(callback) {
    this.#db.exec("BEGIN IMMEDIATE");
    try {
      const result = callback();
      this.#db.exec("COMMIT");
      return result;
    } catch (error) {
      try {
        this.#db.exec("ROLLBACK");
      } catch {
        // Preserve the original transaction error.
      }
      throw error;
    }
  }

  #event(userId, eventName, properties, now) {
    this.#db.prepare(`
      INSERT INTO analytics_events(user_id, event_name, properties_json, created_at)
      VALUES (?, ?, ?, ?)
    `).run(userId ?? null, eventName, JSON.stringify(properties ?? {}), now);
  }

  #upsertUser(identity, now) {
    this.#db.prepare(`
      INSERT INTO users(id, email, email_verified, created_at, updated_at)
      VALUES (?, ?, 1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        email_verified = 1,
        updated_at = excluded.updated_at
    `).run(identity.userId, identity.email, now, now);
  }

  #activeCycle(userId, now) {
    return this.#db.prepare(`
      SELECT * FROM quota_cycles
      WHERE user_id = ? AND starts_at <= ? AND ends_at > ?
      ORDER BY starts_at DESC
      LIMIT 1
    `).get(userId, now, now);
  }

  #quota(userId, now, policy) {
    const cycle = this.#activeCycle(userId, now);
    const pending = this.#db.prepare(`
      SELECT COUNT(*) AS count FROM reservations
      WHERE user_id = ? AND status = 'RESERVED' AND expires_at > ?
    `).get(userId, now).count;
    const successful = cycle?.successful_uses ?? 0;
    const availableReservations = Math.max(0, policy.maxSuccessfulResults - successful - pending);
    return Object.freeze({
      policy: {
        maxSuccessfulResults: policy.maxSuccessfulResults,
        cycleDurationMs: policy.cycleDurationMs,
      },
      cycleId: cycle?.id ?? null,
      cycleStartsAt: cycle ? new Date(cycle.starts_at).toISOString() : null,
      cycleEndsAt: cycle ? new Date(cycle.ends_at).toISOString() : null,
      successfulUses: successful,
      reservedUses: pending,
      remainingSuccessfulResults: Math.max(0, policy.maxSuccessfulResults - successful),
      availableReservations,
      eligible: availableReservations > 0,
    });
  }

  #releaseExpired(now) {
    const expired = this.#db.prepare(`
      SELECT id, user_id FROM reservations
      WHERE status = 'RESERVED' AND expires_at <= ?
    `).all(now);
    if (!expired.length) return 0;
    this.#db.prepare(`
      UPDATE reservations
      SET status = 'RELEASED', failure_code = 'STALE_RESERVATION', updated_at = ?
      WHERE status = 'RESERVED' AND expires_at <= ?
    `).run(now, now);
    for (const row of expired) this.#event(row.user_id, "reservation_recovered", { reservationId: row.id }, now);
    return expired.length;
  }

  recoverStaleReservations(now) {
    return this.#transaction(() => this.#releaseExpired(now));
  }

  reserve({ identity, idempotencyKey, requestHash, requestJson, now, policy }) {
    return this.#transaction(() => {
      this.#upsertUser(identity, now);
      this.#releaseExpired(now);

      const existing = this.#db.prepare(`
        SELECT * FROM reservations WHERE user_id = ? AND idempotency_key = ?
      `).get(identity.userId, idempotencyKey);

      if (existing && existing.request_hash !== requestHash) {
        throw new IdempotencyCollisionError();
      }
      if (existing?.status === "COMMITTED") {
        const reading = asReading(this.#db.prepare("SELECT * FROM readings WHERE id = ?").get(existing.reading_id));
        return { kind: "replay", reading, quota: this.#quota(identity.userId, now, policy) };
      }
      if (existing?.status === "RESERVED") {
        return { kind: "in_progress", reservationId: existing.id };
      }

      const quota = this.#quota(identity.userId, now, policy);
      if (!quota.eligible) {
        this.#event(identity.userId, "quota_blocked", { idempotencyKey }, now);
        return { kind: "quota_exhausted", quota };
      }

      const threshold = now - policy.rateLimitWindowMs;
      this.#db.prepare("DELETE FROM rate_limit_events WHERE event_at <= ?").run(threshold);
      const rateRows = this.#db.prepare(`
        SELECT event_at FROM rate_limit_events
        WHERE user_id = ? AND event_at > ?
        ORDER BY event_at ASC
      `).all(identity.userId, threshold);
      if (rateRows.length >= policy.rateLimitMax) {
        const retryAfterMs = Math.max(1, rateRows[0].event_at + policy.rateLimitWindowMs - now);
        this.#event(identity.userId, "rate_limited", { retryAfterMs }, now);
        return { kind: "rate_limited", retryAfterMs };
      }

      this.#db.prepare("INSERT INTO rate_limit_events(user_id, event_at) VALUES (?, ?)")
        .run(identity.userId, now);
      const expiresAt = now + policy.reservationTtlMs;
      const reservationId = existing?.id ?? this.#id();
      if (existing) {
        this.#db.prepare(`
          UPDATE reservations SET
            status = 'RESERVED', attempt_count = attempt_count + 1,
            expires_at = ?, reading_id = NULL, failure_code = NULL, updated_at = ?
          WHERE id = ?
        `).run(expiresAt, now, reservationId);
      } else {
        this.#db.prepare(`
          INSERT INTO reservations(
            id, user_id, idempotency_key, request_hash, request_json,
            status, attempt_count, expires_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'RESERVED', 1, ?, ?, ?)
        `).run(
          reservationId,
          identity.userId,
          idempotencyKey,
          requestHash,
          requestJson,
          expiresAt,
          now,
          now,
        );
      }
      this.#event(identity.userId, "reservation_created", { reservationId, idempotencyKey }, now);
      return { kind: "reserved", reservationId, expiresAt };
    });
  }

  releaseReservation({ reservationId, failureCode, now }) {
    return this.#transaction(() => {
      const row = this.#db.prepare("SELECT user_id FROM reservations WHERE id = ?").get(reservationId);
      if (!row) return false;
      const result = this.#db.prepare(`
        UPDATE reservations
        SET status = 'RELEASED', failure_code = ?, updated_at = ?
        WHERE id = ? AND status = 'RESERVED'
      `).run(failureCode, now, reservationId);
      if (result.changes) this.#event(row.user_id, "reservation_released", { reservationId, failureCode }, now);
      return result.changes === 1;
    });
  }

  persistAndCommit({ reservationId, result, now, policy, beforeCommit }) {
    return this.#transaction(() => {
      const reservation = this.#db.prepare("SELECT * FROM reservations WHERE id = ?").get(reservationId);
      if (!reservation) throw new PersistenceError("The reservation does not exist");
      if (reservation.status === "COMMITTED") {
        const reading = asReading(this.#db.prepare("SELECT * FROM readings WHERE id = ?").get(reservation.reading_id));
        return { reading, quota: this.#quota(reservation.user_id, now, policy), replayed: true };
      }
      if (reservation.status !== "RESERVED") {
        throw new PersistenceError("The reservation is no longer active");
      }

      let cycle = this.#activeCycle(reservation.user_id, now);
      if (!cycle) {
        const cycleId = this.#id();
        this.#db.prepare(`
          INSERT INTO quota_cycles(id, user_id, starts_at, ends_at, successful_uses, created_at)
          VALUES (?, ?, ?, ?, 0, ?)
        `).run(cycleId, reservation.user_id, now, now + policy.cycleDurationMs, now);
        cycle = this.#db.prepare("SELECT * FROM quota_cycles WHERE id = ?").get(cycleId);
      }

      if (cycle.successful_uses >= policy.maxSuccessfulResults) {
        throw new QuotaExceededError(this.#quota(reservation.user_id, now, policy));
      }

      const readingId = this.#id();
      this.#db.prepare(`
        INSERT INTO readings(
          id, user_id, reservation_id, cycle_id, idempotency_key,
          request_hash, request_json, result_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        readingId,
        reservation.user_id,
        reservation.id,
        cycle.id,
        reservation.idempotency_key,
        reservation.request_hash,
        reservation.request_json,
        JSON.stringify(result),
        now,
      );

      const increment = this.#db.prepare(`
        UPDATE quota_cycles
        SET successful_uses = successful_uses + 1
        WHERE id = ? AND successful_uses < ?
      `).run(cycle.id, policy.maxSuccessfulResults);
      if (increment.changes !== 1) throw new PersistenceError("The quota commit lost its atomic slot");

      this.#db.prepare(`
        UPDATE reservations
        SET status = 'COMMITTED', reading_id = ?, failure_code = NULL, updated_at = ?
        WHERE id = ? AND status = 'RESERVED'
      `).run(readingId, now, reservation.id);
      this.#event(reservation.user_id, "reading_committed", { readingId, cycleId: cycle.id }, now);

      beforeCommit?.({ readingId, cycleId: cycle.id });

      const reading = asReading(this.#db.prepare("SELECT * FROM readings WHERE id = ?").get(readingId));
      return { reading, quota: this.#quota(reservation.user_id, now, policy), replayed: false };
    });
  }

  getQuota({ userId, now, policy }) {
    return this.#transaction(() => {
      this.#releaseExpired(now);
      return this.#quota(userId, now, policy);
    });
  }

  listReadings(userId) {
    return this.#db.prepare(`
      SELECT * FROM readings WHERE user_id = ? ORDER BY created_at DESC, id DESC
    `).all(userId).map(asReading);
  }

  getReading(userId, readingId) {
    const row = this.#db.prepare("SELECT * FROM readings WHERE user_id = ? AND id = ?").get(userId, readingId);
    if (!row) throw new NotFoundError();
    return asReading(row);
  }

  getReservation(userId, idempotencyKey) {
    const row = this.#db.prepare(`
      SELECT * FROM reservations WHERE user_id = ? AND idempotency_key = ?
    `).get(userId, idempotencyKey);
    return row ? { ...row } : null;
  }

  countReadings(userId) {
    return this.#db.prepare("SELECT COUNT(*) AS count FROM readings WHERE user_id = ?").get(userId).count;
  }

  listAnalytics(userId) {
    return this.#db.prepare(`
      SELECT event_name, properties_json, created_at
      FROM analytics_events WHERE user_id = ? ORDER BY id
    `).all(userId).map((row) => ({
      name: row.event_name,
      properties: JSON.parse(row.properties_json),
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }
}
