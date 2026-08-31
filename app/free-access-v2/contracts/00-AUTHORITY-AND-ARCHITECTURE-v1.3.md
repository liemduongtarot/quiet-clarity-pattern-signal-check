# PSC Anonymous Behavioural Value & Learning Framework
## v1.3 Browser-Bounded State Model — frozen implementation contract

Status: FROZEN CONTRACT; effective when committed before application code. The Git commit containing this complete contract directory is the contract-freeze authority. No later implementation or test may silently weaken it.

Architecture parent: **PSC ANONYMOUS BEHAVIOURAL VALUE & LEARNING FRAMEWORK v1.2**. Architecture successor: **v1.3 Browser-Bounded State Model**. The owner's browser-bounded selection and the full requirements supplied for this task control this successor. A separate byte-addressed v1.2 document was not supplied or found in the implementation parent; this package does not invent its contents or a checksum. Its inheritance claims are limited to the architecture parent named by the owner and the express v1.3 decisions reproduced here.

Implementation parent: **Track B Free Access v1**, package `@psc/free-access-v1@1.0.0`, commit `f53035341a12834170be8afdd1b4ed6481085ed4`, tree `7cbc55eea7744d26b29632019487f6daabaf0e6b`. Qualification parent `2493f7605d42b2ccf757e22e8ddb0b108a5e7600`; qualification package SHA-256 `de02d1c059ba09979ec84963f7f3e03f5ded5d4cedd1e328537edf07af6dd21d` (31,841 bytes); GitHub run `33309429497` completed successfully at the exact frozen commit. The historical 33/33 PASS remains valid for that implementation's contract. It does not establish v1.3 compliance.

Implementation successor: **Track B Free Access v2 — Browser-Bounded**, package `@psc/free-access-v2@2.0.0`, under `app/free-access-v2/`. The actual Free Access lineage has only 1.0.0 and its freeze; it has no intermediate Free Access version or prescribed versioning policy. Removing the verified-bearer and history APIs and changing quota authority breaks 1.0.0 compatibility. Therefore this authoring task deliberately advances that implementation's major version to 2.0.0. Architecture version 1.3 and the unrelated root package version 1.3.1 do not determine this number. The authoring branch name is not version authority.

Every existing tracked file, including the entire `app/free-access-v1/` subtree, root package and historical workflow, remains byte-identical. The frozen worktree is read-only. All implementation additions are confined to the separately named successor subtree. No replacement Node framework, frontend framework, runtime dependency, PSC semantic implementation or deployment is authorized.

### Controlling principle

Retain only the minimum purpose-bound state needed to enforce browser-level Free access, recover valid executions safely within a bounded operational window, measure aggregate product performance, and measure isolated aggregate commercial performance. State may not be repurposed to identify a visitor, reconstruct an individual journey, match browsers/devices, join Free behavior to payment identity, profile psychology, retarget advertising, or alter PSC semantic decisions.

### Non-negotiable invariants

1. Free access requests no account, login, name, email or verified identity.
2. Track B is browser-bounded, never human-identity-bounded.
3. Token deletion, rollback, replay, incognito, other browsers/devices and deliberate concurrency are accepted bounded quota leakage.
4. No fingerprinting or device matching.
5. No cross-device quota enforcement.
6. No persistent visitor ID, including a token-derived identifier.
7. No cross-session behavioral profile.
8. No payment identity joined backward to Free history.
9. Raw PSC input or result never enters behavioral analytics.
10. Analytics never feeds PSC semantics or the Free/Paid semantic boundary. Analytics failure cannot invalidate a valid issued result.
11. Quota state is never an analytics identifier.
12. Owner preferences, developer convenience and vendor defaults cannot introduce identifiers, linkage, retention or secondary purposes without separate governance.

### Terminology

- **NO-DIRECT-IDENTITY ACCESS**: no account, name, email or contact details requested.
- **IDENTITY-MINIMISED TRANSIENT PROCESSING**: text may still constitute personal data while being processed. Minimisation is not a promise that text is anonymous.
- **ANONYMOUS AGGREGATE PRODUCT METRICS**: only sufficiently aggregated, non-linkable statistics can receive that description. Unreleased small counters are operational aggregates, not a claim of anonymous public analytics.

The interface must not promise “completely anonymous.” No legal retention period, legal-compliance certification, perfect per-human limit, delivery-to-DOM guarantee or live PSC functionality is claimed.

### Scoped implementation

Preserve Node 24 ESM, built-in HTTP/HTTPS and SQLite, vanilla frontend, CSS, controlled clocks, mock result contract and deterministic mock executor. Remove verified identity and server-side durable history from the successor. Replace linked quota/reservation/event tables with aggregate counters, and bounded execution state held only in process memory. Current result, copy and download are the utility boundary. The local application is a synthetic qualification specimen; no PSC core or payment provider is connected.

English is the only implemented parent locale. Preserve English behavior and Unicode text transport. Vietnamese UI and governed output translation are not implemented or claimed. Experiments are disabled in this MVP. No classification/status taxonomy exists in the mock contract, so no such metrics are invented.

### Contract package and acceptance

The companion impact matrix, state inventory, SQLite disposition, history decision, quota, idempotency, aggregate, commerce, infrastructure, purpose/retention, copy, integration boundary and specimen/test plan are normative. Qualification must demonstrate the promised behavior and its limits using synthetic inputs only. Runtime durations are engineering bounds for this specimen, not legal retention periods. Production provider retention, infrastructure contracts, operational recovery sizing and aggregate release governance remain explicitly OPEN and block deployment/core integration, not this bounded pre-integration qualification.

The permitted sequence is audit → complete contract freeze → bounded implementation → complete PRE PASS → immutable implementation freeze → independent clean POST PASS → exact-history publication → verified export. There is no qualification rerun after external publication. Stop before PSC-core integration, Track A changes, main changes, canonical promotion, deployment or live PSC execution.
