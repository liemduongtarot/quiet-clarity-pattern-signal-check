# History / reopen disposition

V1 history is server-side and persistent, not browser-local: GET `/api/readings` lists rows selected by stable verified user; GET `/api/readings/:id` reopens a row after ownership check. SQLite stores full raw request and result, quota cycle and idempotency linkage, with no deletion on expiry. The same bearer identity can retrieve prior cycles and browser sessions. Passing the v1 tests does not make this suitable for the anonymous v1.3 MVP.

Disposition: **DEFER TO SEPARATELY GOVERNED OPTIONAL MODE**. Remove both GET routes, history UI, stored-reading promises, auth token and database rows from the successor runtime. Do not implement the optional mode or silently substitute a persistent browser ID.

Anonymous utility is current result, copy result, client-initiated text-file download, and short-lived same-execution retry recovery. Page refresh/navigation loses current result and receipt; the interface explains this. Downloads/clipboard are explicit user-directed copies beyond server retention control; no telemetry claims permanent file retention. Copy counts only after successful clipboard completion; download counts initiation only.

Recovery is not history: it requires possession of an unguessable signed expiring capability, uses POST body only, has no list/search/reopen endpoint, and is automatically forgotten. Process restart invalidates capabilities without re-executing them. That is safe failure, not durable history or a promise of crash-proof recovery. This limitation must remain visible in the technical contract and qualification.
