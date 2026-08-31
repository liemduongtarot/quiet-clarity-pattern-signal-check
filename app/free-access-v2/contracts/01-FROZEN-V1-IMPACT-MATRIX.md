# Frozen v1 → Free Access v2 impact matrix

Audit source: exact frozen v1 commit and its verified qualification package. All parent files remain unchanged; dispositions describe their reuse or replacement in the new subtree. This matrix is sealed before copying or modifying any successor application code. Complete source coverage is also recorded in `PARENT-FILE-INVENTORY.json`.

Byte authority is the frozen Git tree. This Windows checkout uses CRLF for parent text files while Git blobs use LF; both hashes are recorded and the parent worktree is not normalized or touched. Exact preserved successor copies use parent Git blob bytes. A successor-scoped `.gitattributes` disables newline conversion so PRE and clean POST hash identical bytes; it cannot affect parent files.

| Existing component / file | Classification | Evidence and bounded action |
| --- | --- | --- |
| Root `package.json` | PRESERVE EXACTLY | Repository metadata; version 1.3.1 is unrelated. No new imports of its dependencies. |
| `.github/workflows/free-access-v1.yml` | PRESERVE EXACTLY | Historical qualification only. Its push branch excludes this successor. Do not copy its push trigger or dispatch it. |
| `package.json` in v1 | REPAIR FOR v1.3 | Keep Node >=24, ESM, zero runtime dependencies, node:test. New package/name 2.0.0; repair qualification commands. |
| `.gitignore` | PRESERVE WITH DOCUMENTATION | Continue excluding runtime data/generated evidence; use successor names. |
| `README.md` | REPAIR FOR v1.3 | Replace verified identity/history and misleading “rolling” wording with fixed 720h first-success cycle and bounded limitations. |
| `docs/IMPLEMENTATION_PLAN.md` | PRESERVE WITH DOCUMENTATION | Original plan remains historical in v1. This contract supplies the successor plan. |
| `docs/REPOSITORY_INSPECTION.md` | PRESERVE WITH DOCUMENTATION | Original main/base inspection remains historical; current isolated parent and protected refs recorded separately. |
| `src/clock.mjs` SystemClock | PRESERVE EXACTLY | Pure clock access. Whole source copied byte-identically. |
| `src/clock.mjs` ManualClock | TEST-ONLY | Controlled time fixture; no HTTP clock override. |
| `src/executor/contract.mjs` | PRESERVE WITH DOCUMENTATION | Preserve bytes: normalization, canonical JSON and mock-only schema. Request digest/content-derived result fields are transient execution data only. |
| `src/executor/mock-psc.mjs` | TEST-ONLY | Preserve bytes. Synthetic deterministic executor, never production semantic authority or live model. |
| `src/auth/identity.mjs` | REMOVE FROM ANONYMOUS MVP | Lines 26–41 include sub/email/verified identity; lines 63–87 require identity bearer. Reuse HMAC/timing-safe construction in separately named quota module, not identity payloads. |
| `src/policy.mjs` | REPAIR FOR v1.3 | Preserve exact 4 and 2,592,000,000ms; remove allowance/cycle environment overrides and identity rate limiter. Add qualified deadline/receipt bounds. |
| `src/errors.mjs` | REPAIR FOR v1.3 | Keep typed fixed errors; remove auth/history errors and raw message/details propagation. Fault objects stay test-only. |
| `src/service/free-access-service.mjs` | REPAIR FOR v1.3 | Retain normalize → execute → validate → quota transition → issued result; replace user/store binding with signed browser quota and expiring capability. Delete history/reopen. |
| `src/storage/sqlite-store.mjs` | REPAIR FOR v1.3 | Keep built-in DatabaseSync/migration/transaction/close mechanics; replace all identity-linked tables with finite direct counters. No raw-content rows or durable receipt rows. |
| `migrations/001_free_access.sql` | REPAIR FOR v1.3 | Original six purpose-incompatible tables excluded; successor aggregate-only schema documented in SQLite matrix. No in-place upgrade of v1 database. |
| `src/api/server.mjs` | REPAIR FOR v1.3 | Preserve server/static/security/size-limit/no-store patterns. Remove dev identity and GET result history. Add strict capability POST, quota cookie, minimal metrics ingress, TLS/local distinction and fixed error sanitizer. |
| `src/index.mjs` | REPAIR FOR v1.3 | Preserve composition, loopback listener, lifecycle/shutdown. New quota keys, ephemeral receipt reaper, synthetic-only HTTP and TLS option. Startup logging has fixed fields only. |
| `public/styles.css` | PRESERVE EXACTLY | Entire existing design and responsive CSS copied byte-identically. Unused historical selectors carry no state. |
| `public/index.html` | REPAIR FOR v1.3 | Preserve shell/layout/result/principles; remove email/account/token/history controls and false saved-history copy. Add short privacy copy/current-result actions and isolated bridge explanation. |
| `public/app.js` | REPAIR FOR v1.3 | Retain DOM/textContent rendering and request helpers. Remove bearer/sessionStorage/history; add Web Lock, bounded same-receipt retries, copy/download counters, pagehide clearing. |
| `scripts/qualify.mjs` | REPAIR FOR v1.3 | Reuse child node:test/TAP/report approach; no hardcoded v1 branch or 33 count. Bind source bytes; fail on skipped/cancelled/todo; output outside source. |
| `scripts/freeze.mjs` | REPAIR FOR v1.3 | Reuse manifest/hash/archive principles; require exact source-bound complete PRE including browser evidence; immutable successor commit and independent POST, not mutable PASS alone. |
| `tests/helpers.mjs` | TEST-ONLY | Adapt clock/executor/HTTP fixture patterns, remove user credentials/history fixtures. |
| `tests/canonical.test.mjs` | TEST-ONLY | Preserve count/failure/expiry value; replace auth/history expectations with browser-bound controls. |
| `tests/adversarial.test.mjs` | TEST-ONLY | Preserve duplicate/collision/crash/rollback techniques; qualify accepted leakage rather than claim perfect identity enforcement. |
| `tests/api-and-ui.test.mjs` | TEST-ONLY | Reuse real HTTP/static tests, add privacy/transport/error boundaries. Existing string checks are not real browser evidence. |
| `tests/isolation.test.mjs` | TEST-ONLY | Reuse import/protected-path reasoning; strengthen actual main-ref, entire parent-file and tracked-dirty proof. |
| `qualification/qualification.json`, `QUALIFICATION_REPORT.md`, `FREEZE_MANIFEST.sha256` | PRESERVE EXACTLY | Historical 33/33 evidence only. Never relabel it v1.3 PASS. |
| Ignored `.tgz`, `.tgz.sha256`, `test-results.txt` | PRESERVE EXACTLY | Verified historical artifact and TAP retained in export as parent evidence. Not successor controlling inputs. |

### Complete mechanism disposition

| Mechanism | Classification | Finding |
| --- | --- | --- |
| Email/user identity, bearer token, sessionStorage token | REMOVE FROM ANONYMOUS MVP | API requires verified account; frontend stores stable bearer. |
| Raw request_json/result_json and user-linked result rows | REMOVE FROM ANONYMOUS MVP | Long-lived SQLite/WAL; no deletion routine. |
| History/reopen/cross-session retrieval capability | DEFER TO SEPARATELY GOVERNED OPTIONAL MODE | Independent utility, but identity and raw retention are incompatible here. Optional mode is not built. |
| Quota count and exact fixed-cycle arithmetic | PRESERVE WITH DOCUMENTATION | Actual v1 commit logic starts at first success; README incorrectly says rolling. |
| Retry collision/duplicate protection | REPAIR FOR v1.3 | Replace persistent user/idempotency rows with expiring random capability and memory-only keyed digest/result. |
| Per-user precise event/rate-limit rows | REMOVE FROM ANONYMOUS MVP | Persistent user linkage not needed for browser quota. Resource caps may be process-wide with no identity. |
| Static CSS/JS caching | PRESERVE WITH DOCUMENTATION | No raw content in assets; successor may strengthen all routes to no-store. |
| Client/server raw error messages | REPAIR FOR v1.3 | service lines 89,98,133 can pass executor/storage messages through server lines 148–153. Fixed-code mapping required. |
| Startup log | PRESERVE WITH DOCUMENTATION | Fixed event/executor/live-count fields only; no body/token/URL from user. |
| Cookies/localStorage/IndexedDB/fingerprint/service worker/traces/APM/replay | PRESERVE WITH DOCUMENTATION | Absent in v1. Only the specified quota cookie may be newly introduced. |
| Copy/download/product counters/bridge/commerce firewall | REPAIR FOR v1.3 | Absent in v1; bounded additions explicitly required, without processor integration. |
| Experiments/classification/status metrics | PRESERVE WITH DOCUMENTATION | Absent; remain disabled rather than create new classification or assignment identifiers. |
| PSC-core/Track A/Free-Paid semantic implementation | PRESERVE EXACTLY | Not present in this Track B source; imports/edits/live execution remain prohibited. |

### Audit evidence and qualification value

History GET routes at server lines 110–117 call service lines 146–155 and user selectors at store lines 312–322; serializer lines 15–26 returns identity, cycle, idempotency key, hash, raw request and result. Reservation expiry changes status, not raw-data deletion (store lines 135–147). All six SQL tables were inspected column-by-column. No request logger, external provider, analytics SDK, experiment or payment integration exists. Parent tests are 12 canonical, 15 adversarial, 3 HTTP/static UI and 3 isolation tests. They do not include an actual browser, console capture, copy/download or Vietnamese UI. The successor preserves those tests' valid scenarios, not incompatible account/history requirements or their unproven claims.
