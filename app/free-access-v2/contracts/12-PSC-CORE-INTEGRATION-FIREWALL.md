# PSC-core integration firewall — NOT STARTED

The successor uses the unchanged deterministic mock executor and mock-only validator copied from frozen v1. There are no PSC-core imports, model clients, external model requests, semantic code changes, Free/Paid semantic changes, Track A files, credentials or live executions. Parent root package dependencies remain unused. Mock output hashes/IDs are transient fixture content, never analytical identity.

Future interface only: `executePSC(normalizedRequest, {signal}) -> PSCExecutionResult`. A separately authorized integration must supply governed valid-result schema, enforce request acceptance and execution/validation failure semantics, respect abort/deadline, keep idempotency at the access layer, commit the browser quota only for valid issued results, prevent raw-content retention/logging and leave Paid bridge ownership in the access/product layer. The mock validator deliberately rejects non-mock output until such authorization; this task does not loosen it.

Failure mapping: invalid request→0 uses; execution failure/timeout→0; invalid output→0; duplicate same receipt→same result and0 additional; changed request on same receipt→collision; expired/unknown receipt→reject/no rerun; quota exhausted→block before execution. Analytics has no semantic callback. Commerce has no Free-state input. User-facing mock signals must never be advertised as newly governed psychological classification.

Isolation acceptance: exact original root package and all parent tracked bytes; only successor subtree added; local main unchanged from recorded baseline; remote main unchanged from its separately recorded task-start baseline; app/psc-free-access-v1 unchanged; Track A/PSC-core/Free-Paid semantic changed files=0; live PSC=0; no deployment/canonical promotion; no workflow dispatch. A changing external ref must be reported, not rewritten to fit evidence.

Hard stop after qualified branch publication/export. Readiness is only for **separately authorized** core integration; it is not approval to integrate, deploy, execute live PSC or promote authority.
