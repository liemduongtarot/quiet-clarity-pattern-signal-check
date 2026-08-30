# Implementation plan

1. **Identity and policy** — verify signed bearer identities with `email_verified=true`; centralize quota, cycle, reservation TTL, request size, and rate-limit values.
2. **Atomic data path** — migrate an isolated SQLite database; atomically reserve against committed plus pending slots; bind idempotency keys to canonical request hashes.
3. **Execution lifecycle** — run only `MockPSCExecutor`; validate its explicit result contract; persist the full reading and increment the cycle in one transaction; release failures and recover stale reservations.
4. **Access surfaces** — expose quota, create, history, and reopen APIs plus authenticated UI states for eligible, running, success, exhausted, error, and history/reopen.
5. **Qualification** — run 12 canonical tests and adversarial concurrency/crash/expiry/rollback/replay cases; prove isolation and zero live PSC executions; freeze a manifest and qualification package only on PASS.
