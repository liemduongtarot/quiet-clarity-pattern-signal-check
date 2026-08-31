# Frozen qualification scenario coverage

The tests use synthetic content, public TEST-ONLY keys/certificates, controlled clocks and the unchanged mock executor. They never invoke PSC core, a model provider, checkout or payment service. Temporary file databases and process fixtures are outside the source checkout and are removed after use. Tests do not consume PRE output or parent qualification PASS files as expectations.

This is the automated portion of the frozen specimen plan. Formal PRE/POST also require actual browser observation artifacts, clean source/build identities, protected-ref evidence and the independently recorded publication/export gates. `frontend-handlers.test.mjs` is explicitly a supporting Node VM fixture; it is not real-browser or console evidence.

| Frozen group | Principal automated observations |
| --- | --- |
| Q01 first success | C01–C03, C15, H02, T12: no identity, no cycle on visits/admission; synchronous validated issuance starts exact720h; operational bounds fixed |
| Q02 count/limit | C04–C06, H03: four full results, fourth delivered, fifth blocked before mock execution |
| Q03 failures | C07/C08/C14, A04–A09/A21, H18–H20: invalid input/output, dependency error, real10s timeout, validation crossing deadline, writer rejection/serialization and actual TCP disconnect consume0 |
| Q04 duplicate/retry | C09, A02/A03/A11/A14, H04: in-flight duplicate rejection, exact recovery, normalized collision binding, one transition, no accidental token rollback |
| Q05 expiry | C12/C13, A10, T07: exact exclusive720h boundary, first next success starts new cycle, visits/late success never extend old cycle |
| Q06 token adversaries and accepted leakage | T01–T11, H05, A01/A18/A19: strict schema/MAC/key/time/arithmetic; deliberate concurrent receipts, old-token rollback, deletion and other browsers explicitly demonstrate accepted leakage |
| Q07 accidental concurrency | F06/F07 supporting handler checks: latest quota and execution under Web Lock; page busy guard; lock absence disclosed. Actual two-tab proof is a separate browser gate |
| S01 privacy/schema | C10, P01–P05/P14/P15, H06/H07/H11, I08: exact tables/every column, generated columns/views/legacy DB refused; no durable history, account, raw content or persistent browser identity |
| S02 bounded recovery | C11, A12–A17/A20/A22/A23, L01, F11–F13:48s logical expiry, automatic reaper, capacity, shutdown abort, normalization crossing expiry, separate real-process restart invalidates receipt without rerun; submitted textarea cleared on error/expiry, still-unsubmitted text retained on admission failure |
| S03 transport/cache | H01/H08–H10/H13–H17/H19, T10/T11, F03–F05/F09, L02: actual trusted HTTPS host-cookie flags, spoofed transport rejected, explicit loopback exception, origin/media/size/path limits, no-store/cache validators, Blob cleanup and pagehide guards |
| S04 no-body logging/sanitization | P04/P11/P12, H09/H11/H18, L01/L02, F02/F10: canaries absent from real SQLite/WAL, public errors, console and actual process stdout/stderr; fixed startup fields only |
| A01 one-way aggregates | P05–P10/P13, H12, F08: finite direct counters, exact transitions, no event rows/properties/credentials, atomic invalid-batch rejection, sparse suppression/coarsening, telemetry failure cannot change issued semantics |
| A02 result actions/pathway | F01–F04/F08: clipboard fulfillment versus denial, download initiation versus failure, released Blob URL, bridge totals without commerce linkage; actual actions also need browser evidence |
| C01 commerce firewall | M01–M08, H06, F08: pure exact-shape validators, accessor/prototype/linkage rejection, TEST-ONLY isolated attempt correlation and duplicate completion; no live provider |
| E01 experiments/status | T04, P09, I08: no experiment/classification/status identifiers or invented taxonomy; experiments disabled |
| I01 isolation/evidence gates | I01–I10, G01–G08: exact ancestry/parent blobs/protected local refs, audited EOL conversion plus separate exact original-parent disk hashes, immutable contract and preserved components, no core/provider imports/new workflow, output path/junction protection and incomplete/duplicate evidence rejection |
| R01 preserved utility | C05/C16, H01/H03, F01–F13: current result, four-use behavior, Unicode transport, safe text and actions. Actual rendering, responsive layout, two-tab behavior and zero console errors require separate real browser PRE/POST evidence. Vietnamese UI remains explicitly not implemented |

## Independent reproduction

Run the committed `scripts/qualify.mjs` in PRE or POST with a separate external output directory and matching actual-browser evidence. The qualifier discovers every committed `tests/*.test.mjs`, runs the built-in Node test runner, rejects failed/skipped/cancelled/todo or ambiguous TAP totals, binds the source manifest and requires source cleanliness. POST uses a clean detached worktree at the exact frozen commit, fresh process/database/keys/browser cookie context and no mutable PRE inputs.

For development only, `node --test --test-reporter=spec tests/*.test.mjs` exercises the automated suite without asserting a release verdict. Passing these tests alone is not full qualification or publication authorization. No test rerun is permitted after the release is externally published.
