# State and linkage inventory

| State/surface | Frozen v1 | Successor boundary |
| --- | --- | --- |
| Account/login/email | Required, server JWT + users | Absent, including development identity issuer. Reject unexpected identity fields. |
| Client identifier | Verified user subject + bearer | No visitor ID. Execution capability is random, single-purpose, short-lived, never cross-session identity. |
| Cookie | None | One first-party signed quota cookie after first success; no identifier or behavioral content. |
| localStorage | None | None. |
| sessionStorage | Bearer identity token | None. Receipt and UI state stay in page memory. |
| IndexedDB/cache API/service worker | None | None. No raw persistence or replay SDK. |
| Browser history | UI fetches durable server history | No raw URL/path/query; no history API; pagehide clears questionnaire/result/receipt and pageshow reinitializes quota. |
| Raw input | DOM, request, SQLite reservations/readings | Active request/processing heap only; no persistent writes. Discard references on completion/failure. JS GC is not secure memory erasure. |
| Raw result | SQLite readings, durable retrieval, DOM | Current view and memory-only recovery capability until deadline; no server GET retrieval. |
| Retry | Stable-user idempotency rows indefinitely | Signed expiring random receipt, keyed request digest, transient state/result. Process restart invalidates all receipts; no automatic rerun of unknown receipts. |
| Quota | Persistent users + cycles + reservations | Browser token only; transient parsed state during one request/recovery. Never a database key or analytics input. |
| SQL analytics | User/event/properties/time rows | Finite counter name + integer total only. No dimensions, event rows or time field. |
| Logs/errors | Fixed startup log but unsafe error passthrough | No body/access logs; fixed public codes/messages. No token, request URL or raw error details. |
| Traces/APM/crash/support/replay | Absent | Disabled; production infrastructure must certify the same prohibition. |
| Experiment assignment | Absent | Disabled. Future session-scoped A/B only with separate admission; never quota content. |
| Checkout/payment | Absent | Unconnected strict interface; synthetic isolated attempt only, no live processor or payment identity. |
| Qualification fixtures | Synthetic accounts/content | Synthetic requests/keys/certificates only, marked TEST-ONLY; never import real PSC or visitor data. |

Linkage firewall: HTTP ingress may technically encounter request headers. It must never log, hash for analytics, pass onward or persist quota/cookie/receipt values. Metrics ingress accepts only one fixed event name and discards all other request detail; browser sends it with `credentials: omit`. Commerce accepts only explicitly allowed attempt fields and has no reference to Free service, quota, receipt or raw input/result. No event-level analytics state is retained. Counters can describe total attempts/transitions but cannot reconstruct an individual journey or unique people. No database migration opens or converts the v1 database; successor uses its own aggregate-only file and refuses unexpected tables.
