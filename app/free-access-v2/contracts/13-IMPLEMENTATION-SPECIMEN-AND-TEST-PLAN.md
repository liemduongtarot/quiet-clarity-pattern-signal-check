# Implementation specimen and qualification plan

Application code must not be created/copied/edited until this entire contract and audit matrix is committed. Bounded copy into `app/free-access-v2/`, retain exact CSS/clock/mock/validator bytes, and repair only audited incompatible mechanisms. Preserve all inherited v1 and root files. No optional history, Vietnamese UI, experiment or processor integration.

Specimen API: GET `/health`, GET `/api/quota`, POST `/api/executions` (empty object), POST `/api/readings` (receipt + request), POST `/api/metrics` (one event name). All unknown identity/history/commerce/raw-query interfaces fail closed. Product/commerce aggregation has no public raw-count API. Runtime is Node built-ins only. HTTP is explicit synthetic-only loopback; real HTTPS fixture verifies production cookies. No external model/payment network.

### Frozen scenario inventory

| Group | Required independent observations |
| --- | --- |
| Q01 first success | Visits/start/receipt/failure do not start cycle; success starts at commit/issue time; expiry exactly720h |
| Q02 count/limit | Four sequential valid issued results; fourth content visible; fifth rejected before executor |
| Q03 failures | Invalid request, thrown execution, timeout, invalid result and pre-issuance disconnect/serialization consume0 |
| Q04 duplicate/retry | Same receipt duplicate/inflight/recovery adds0; changed request collides; delayed output cannot commit; no quota regression on replay |
| Q05 expiry | At expiry resets; before expiry does not; repeated visits do not extend; no rolling lookback |
| Q06 adversarial token | Tampered/malformed/extra-field/unknown-key/future/bad-arithmetic tokens reject; missing/deleted/old-valid rollback and deliberate distinct-receipt races explicitly demonstrate accepted leakage |
| Q07 browser concurrency | Web Lock covers latest quota+execution; page busy guard; no persistent ID; actual two-tab sequential behavior where browser supports locks |
| S01 privacy schema | No account/fingerprint/browser-ID; no raw SQLite/history/logs/URL/storage; all table/column names checked; unknown legacy DB rejected |
| S02 receipt retention | Logical48s, automatic reaper, shutdown and restart invalidation; no reuse after expired signed receipt and no durable recovery claim |
| S03 transport/cache | HTTPS-only production and host cookie, local mode isolation, no-store all sensitive routes, strict origin/media/payload/size, GET history absent, query rejection, pagehide/BFCache clearing |
| S04 sanitization | Raw canary in input/executor/validation/storage errors cannot enter messages/logs/analytics; no token/hash to analytics |
| A01 product aggregate | Direct finite counters, exact transition totals, no event rows, no public metrics read, no arbitrary dimensions; low counts suppressed/coarsened |
| A02 copy/download/bridge | Clipboard success only; denial0; download initiated terminology; bridge rendered/opened totals only; no Free→commerce link |
| C01 commerce | Exact attempt/completion interface; unexpected field/linkage rejected; duplicate completion0 additional; no payment identity or live integration |
| E01 experiments/status | No persistent/session experiment when disabled; variant absent from quota; classification/status codes not invented |
| I01 isolation | Exact parent ancestry/files, source manifest, actual protected refs; no imported PSC semantic files, no live/Track A/core/main changes; no external dispatch/deployment |
| R01 UI regression | Real browser loads with no account; form/counter/safe text/current result; 4th/exhaustion/copy/download/refresh; no console errors; English and Unicode input preserved; Vietnamese UI explicitly N/A |

### PRE → freeze → independent POST

Development checks and repairs occur before the one complete final PRE. PRE runs all frozen tests in fresh state and records separate observed pass/fail/skip/cancel/todo totals; any skipped/todo/cancelled tests fail completeness. It also requires real browser evidence, not HTML-string tests or fabricated console status. Source inventory contains exact bytes and SHA-256 for all successor files and parent byte comparisons; build ID hashes sorted inventory. PRE outputs live outside the source checkout.

Only complete PRE PASS admits a final freeze commit. Application/test/contract bytes cannot change after PRE; the final commit may add no source changes (an explicit empty freeze marker is acceptable). Capture parent, contract-freeze, candidate and frozen commit/tree, build ID, full Git diff and parent→successor reuse diff. Do not amend/rebase/reconstruct this history.

POST starts in a separately created detached clean worktree at the exact frozen commit, with fresh keys, database, process, browser page/origin and output directory. An independent agent/process runs the same committed tests and browser scenario plan. Expectations come exclusively from frozen contract/tests; mutable PRE output is never a test input. Only after POST completes may its build/test identities be compared to PRE. Source/worktree cleanliness is verified before/after.

Cookie isolation requires a clean cookie context or different explicit loopback hostname/address; a different port or new tab alone is insufficient because cookies are host-scoped. Record initial POST quota eligibility/no cycle, use a distinct host from PRE and fresh keys/state. Neither a PRE cookie nor a PRE result/fixture file may control POST.

Publication is an exact Git push of the already qualified history to the dedicated authoring/successor branch, without force or API reconstruction. Main and frozen v1 are not pushed. Existing v1 workflow does not match the successor push; no new automatic workflow or deployment hook is added. After publication only read-only identity/isolation verification, no qualification rerun. If host policy denies publication, do not circumvent it; report exact frozen identity and FAIL.

Export all contracts, matrices, source manifest/diff, parent evidence, PRE, clean POST, immutable Git bundle/source, final identities, publication proof and zero-integration proof in a deterministic PASS ZIP plus SHA-256 sidecar. Verify ZIP contents, hash, size and byte identity after copying to the authorized Downloads destination. No overwrite of earlier artifacts. Final verdict uses the owner's exact PASS wording only when every gate, including publication/export, is complete; otherwise the exact FAIL wording.
