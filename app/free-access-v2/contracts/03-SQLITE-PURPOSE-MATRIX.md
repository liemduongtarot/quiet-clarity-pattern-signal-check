# SQLite purpose and every-column disposition

The parent migration and `sqlite-store.mjs` were fully inspected. Parent tables remain only in unchanged historical v1 source and its qualification package, never in the successor runtime schema.

| Parent table | Every column | Purpose / necessity | Exposure, linkage, retention and deletion | Disposition |
| --- | --- | --- | --- | --- |
| users | id, email, email_verified, created_at, updated_at | Verified identity, unnecessary for browser quota | Direct identity; persistent linkage; no runtime user deletion | REMOVE FROM ANONYMOUS MVP |
| quota_cycles | id, user_id, starts_at, ends_at, successful_uses, created_at | Per-user quota history | Stable user + precise cycles; retained after expiry; reconstructs cycles | REMOVE; browser quota replaces |
| reservations | id, user_id, idempotency_key, request_hash, request_json, status, attempt_count, expires_at, reading_id, failure_code, created_at, updated_at | Durable execution reservation | Raw input and stable user/digest/reading link; expiry only releases status, never deletes raw | REMOVE; expiring memory mechanism replaces |
| readings | id, user_id, reservation_id, cycle_id, idempotency_key, request_hash, request_json, result_json, created_at | Persistent result history | Raw input/result and exact user/cycle journey; no retention/deletion | REMOVE; optional history deferred |
| rate_limit_events | id, user_id, event_at | Identity rate limit | User + precise event; cleanup only on future reserve | REMOVE; no identity enforcement |
| analytics_events | id, user_id, event_name, properties_json, created_at | Linked event log | User, cycle/reservation/reading IDs and precise time can join raw history; no deletion | REMOVE; direct aggregation replaces |
| schema_migrations | version, applied_at | Deployment schema metadata, necessary | No visitor/raw fields; retained with database; deleted with DB | PRESERVE WITH DOCUMENTATION |
| sqlite_sequence (implicit) | name, seq | AUTOINCREMENT bookkeeping | Technical metadata, no independent visitor purpose | Omit; successor needs no AUTOINCREMENT |

Successor schema permits only:

| Table | Every column | Necessity and allowed access | Retention/deletion | Journey potential |
| --- | --- | --- | --- | --- |
| schema_migrations | version, applied_at | Migration compatibility; operator technical access only | With aggregate DB; delete when DB retired | None; applied_at is schema-install time, never event time |
| aggregate_counters | counter, value | Atomic one-way increments of allowlisted product/commercial totals; service and restricted operator | No event detail; production aggregate retention OPEN; database retirement/manual governed deletion | No IDs, raw data, timestamp, dimensions, relations or rows per visitor/event |

Product and commerce namespaces are disjoint finite names. They share no join keys or attempt rows. A counter key is a governed constant, never a user-supplied label. Database schema and allowed counter values are checked, including unknown legacy tables/columns. No plaintext input/result, request hash, quota token/hash, execution ID, receipt or checkout identifier may enter SQLite/WAL/backups. No runtime SQL path can store arbitrary JSON. Qualified fixtures inspect a real file-backed database and its bytes, not only an in-memory mock. No live database or parent v1 file is migrated/deleted in this task.
