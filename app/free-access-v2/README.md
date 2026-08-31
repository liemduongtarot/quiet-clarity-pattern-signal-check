# PSC Free Access v2 — Browser-Bounded

Separately versioned `2.0.0` successor to exact frozen Free Access v1, conforming to the owner-selected architecture v1.3. The full v1 subtree remains unchanged. This is a synthetic pre-integration implementation; **no PSC core, real model, checkout or payment provider is connected**.

Node.js 24+, ESM, built-in HTTP/HTTPS and SQLite, vanilla frontend, no third-party runtime/test dependency. The parent CSS, clock, mock executor and validator are reused byte-for-byte from the frozen Git blobs. The [frozen contract](contracts/00-AUTHORITY-AND-ARCHITECTURE-v1.3.md) and [impact matrix](contracts/01-FROZEN-V1-IMPACT-MATRIX.md) explain every repair.

Free access requires no account/name/email. Four valid issued results start a fixed 720-hour browser cycle. A signed HttpOnly first-party cookie carries only allowance state. Token deletion/rollback/replay, different browsers/devices and deliberate concurrency are accepted leakage; this is not four-per-person enforcement. A Web Lock reduces accidental tab races.

There is no server result history or browser storage of raw text. A result can be copied/downloaded while visible. A signed random execution receipt permits memory-only recovery for 48 seconds; it expires automatically and cannot be used after process restart. Copy measures clipboard success; download measures initiation. Aggregate SQLite counters contain only a fixed name and integer total. No raw result, identity, quota token/hash or per-event journey is stored.

Run `node --test --test-reporter=spec tests/*.test.mjs` from this directory for development tests. Qualification uses `node scripts/qualify.mjs --phase PRE --out <external-directory> --browser-evidence <external-json>`; POST additionally requires `--frozen-commit <exact-commit>`. Actual browser evidence is mandatory for a complete PASS. `node scripts/freeze.mjs --pre <external-pre-directory> --out <external-freeze-directory> --browser-evidence <original-pre-browser-json>` verifies admission; it does not change Git or publish.

For local synthetic use, set `PSC_LOCAL_SYNTHETIC=1` and a fresh `PSC_QUOTA_SECRET` of at least 32 bytes, then `node src/index.mjs`. The default listener is loopback only. The HTTP cookie is separately named `psc_quota_local_synthetic`; production uses actual TLS and `__Host-psc_quota` with Secure, HttpOnly, SameSite=Lax, Path=/ and no Domain. Never enter real personal information into the local specimen. Production TLS/key configuration and provider admission are documented in the frozen contracts; deployment is not authorized.

All sensitive routes use no-store. The application has no request-body logging, analytics SDK, fingerprinting, model-provider import or experiment assignment. English UI and Unicode text transport are qualified; Vietnamese UI is not implemented. Future provider latency/retention, infrastructure logs/backups, public aggregate-release governance and payment records remain separately governed admission work.

Stop after qualified branch publication and export. No PSC-core integration, live PSC execution, Track A/main change, deployment or canonical promotion is authorized by this package.
