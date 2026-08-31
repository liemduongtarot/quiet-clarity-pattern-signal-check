import assert from "node:assert/strict";
import { test } from "node:test";
import { deferred } from "./helpers.mjs";
import { createFrontendFixture, settleFrontend } from "./fixtures/frontend-vm.mjs";

test("F01 / A02 — supporting VM: copy success is counted only after clipboard fulfillment", async (t) => {
  const clipboard = deferred();
  const ui = await createFrontendFixture(t, { clipboard: () => clipboard.promise });
  await ui.submit("Synthetic <img src=x onerror=alert(1)> text");
  assert.match(ui.elements.get("result-summary").textContent, /<img src=x onerror=alert\(1\)>/);
  assert.equal(ui.elements.get("prompt").value, "");
  const copy = ui.elements.get("copy-result").dispatch("click");
  await settleFrontend();
  assert.equal(ui.metrics().filter((name) => name === "psc_result_copy_succeeded").length, 0);
  clipboard.resolve();
  await copy;
  assert.equal(ui.metrics().filter((name) => name === "psc_result_copy_succeeded").length, 1);
  assert.equal(ui.elements.get("result-action-status").textContent, "Copied.");
  assert.match(ui.copied[0], /Synthetic <img/);
  assert.equal(ui.uses, 1);
});

test("F02 / A02 S04 — supporting VM: denied clipboard emits no success and fixed copy notice", async (t) => {
  const ui = await createFrontendFixture(t, { clipboard: () => { throw new Error("SYNTHETIC_PRIVATE_CLIPBOARD_ERROR"); } });
  await ui.submit();
  await ui.elements.get("copy-result").dispatch("click");
  assert.equal(ui.metrics().includes("psc_result_copy_succeeded"), false);
  assert.match(ui.elements.get("result-action-status").textContent, /Copy was not available/);
  assert.doesNotMatch(ui.elements.get("result-action-status").textContent, /SYNTHETIC_PRIVATE/);
  assert.equal(ui.elements.get("result-panel").hidden, false);
  assert.equal(ui.uses, 1);
});

test("F03 / A02 S03 — supporting VM: download counts initiation, removes link and revokes Blob URL", async (t) => {
  const ui = await createFrontendFixture(t);
  await ui.submit();
  await ui.elements.get("download-result").dispatch("click");
  assert.equal(ui.anchors.length, 1);
  assert.equal(ui.anchors[0].clicked, 1);
  assert.equal(ui.anchors[0].removed, true);
  assert.equal(ui.anchors[0].download, "psc-free-result.txt");
  assert.equal(ui.metrics().filter((name) => name === "psc_result_download_initiated").length, 1);
  assert.equal(ui.metrics().includes("downloaded"), false);
  assert.equal(ui.elements.get("result-action-status").textContent, "Download initiated.");
  assert.deepEqual(ui.revoked, [ui.createdBlobs[0].url]);
  assert.match(await ui.createdBlobs[0].blob.text(), /Synthetic VM result/);
  assert.equal(ui.uses, 1);
});

test("F04 / A02 — supporting VM: failed download initiation records no success and releases URL", async (t) => {
  const ui = await createFrontendFixture(t, { downloadClickError: true });
  await ui.submit();
  await ui.elements.get("download-result").dispatch("click");
  assert.equal(ui.metrics().includes("psc_result_download_initiated"), false);
  assert.match(ui.elements.get("result-action-status").textContent, /Download could not be initiated/);
  assert.equal(ui.anchors[0].removed, true);
  assert.deepEqual(ui.revoked, [ui.createdBlobs[0].url]);
});

test("F05 / S03 — supporting VM: pagehide/BFCache clears raw DOM and suppresses late clipboard", async (t) => {
  const clipboard = deferred();
  const ui = await createFrontendFixture(t, { clipboard: () => clipboard.promise });
  await ui.submit("SYNTHETIC_PAGEHIDE_CANARY");
  const copy = ui.elements.get("copy-result").dispatch("click");
  await ui.window.dispatch("pagehide");
  clipboard.resolve();
  await copy;
  assert.equal(ui.elements.get("prompt").value, "");
  assert.equal(ui.elements.get("result-summary").textContent, "");
  assert.equal(ui.elements.get("result-signals").children.length, 0);
  assert.equal(ui.elements.get("result-next-steps").children.length, 0);
  assert.equal(ui.elements.get("result-panel").hidden, true);
  assert.equal(ui.elements.get("paid-bridge").hidden, true);
  assert.equal(ui.metrics().includes("psc_result_copy_succeeded"), false);
  await ui.window.dispatch("pageshow", { persisted: true });
  await settleFrontend();
  assert.equal(ui.elements.get("result-panel").hidden, true);
  assert.equal(ui.elements.get("result-summary").textContent, "");
  assert.equal(ui.executionAdmissions, 1);
});

test("F06 / Q07 — supporting VM: page busy guard prevents duplicates while Web Lock covers fresh quota and execution", async (t) => {
  const gate = deferred();
  const ui = await createFrontendFixture(t, { readings: async ({ request, successfulOutcome, response }) => { await gate.promise; return response(successfulOutcome(request.request.prompt), 201); } });
  const first = ui.submit();
  await settleFrontend();
  await ui.elements.get("reading-form").dispatch("submit");
  assert.equal(ui.executionAdmissions, 1);
  assert.equal(ui.elements.get("submit-reading").disabled, true);
  gate.resolve();
  await first;
  assert.deepEqual(ui.lockCalls, [{ name: "psc-free-quota", mode: "exclusive" }]);
  const protectedRequests = ui.requests.filter((request) => ["/api/quota", "/api/executions", "/api/readings"].includes(request.path)).slice(1);
  assert.deepEqual(protectedRequests.map((request) => request.path), ["/api/quota", "/api/executions", "/api/readings"]);
  assert.ok(protectedRequests.every((request) => request.lockActive));
  assert.equal(ui.uses, 1);
});

test("F07 / Q07 — supporting VM: missing Web Locks shows limitation and uses page guard", async (t) => {
  const ui = await createFrontendFixture(t, { locks: false });
  assert.equal(ui.elements.get("lock-notice").hidden, false);
  await ui.submit();
  assert.equal(ui.uses, 1);
  assert.equal(ui.lockCalls.length, 0);
});

test("F08 / A01 C01 — supporting VM: metrics omit credentials and bridge cannot create commerce linkage", async (t) => {
  const ui = await createFrontendFixture(t);
  await ui.submit("SYNTHETIC_METRICS_RAW_CANARY");
  await ui.elements.get("prompt").dispatch("focus");
  await ui.elements.get("copy-result").dispatch("click");
  await ui.elements.get("download-result").dispatch("click");
  await ui.elements.get("paid-bridge-toggle").dispatch("click");
  assert.equal(ui.elements.get("paid-bridge-details").hidden, false);
  assert.equal(ui.metrics().filter((name) => name === "psc_started").length, 1);
  assert.equal(ui.metrics().filter((name) => name === "paid_bridge_rendered").length, 1);
  assert.equal(ui.metrics().filter((name) => name === "paid_bridge_opened").length, 1);
  for (const request of ui.requests.filter((item) => item.path === "/api/metrics")) {
    assert.equal(request.credentials, "omit");
    assert.equal(request.method, "POST");
    assert.equal(request.cache, "no-store");
    assert.deepEqual(Object.keys(JSON.parse(request.body)), ["event"]);
    assert.doesNotMatch(request.body, /SYNTHETIC_METRICS_RAW_CANARY|VM-RECEIPT/);
  }
  assert.ok(ui.requests.every((request) => ["/api/quota", "/api/executions", "/api/readings", "/api/metrics"].includes(request.path)));
});

test("F09 / S03 — supporting VM: a late reading after navigation cannot repopulate raw content", async (t) => {
  const gate = deferred();
  const ui = await createFrontendFixture(t, { readings: async ({ request, successfulOutcome, response }) => { await gate.promise; return response(successfulOutcome(request.request.prompt), 201); } });
  const first = ui.submit("SYNTHETIC_LATE_RESPONSE_CANARY");
  await settleFrontend();
  await ui.window.dispatch("pagehide");
  gate.resolve();
  await first;
  assert.equal(ui.elements.get("result-panel").hidden, true);
  assert.equal(ui.elements.get("result-summary").textContent, "");
  assert.equal(ui.elements.get("prompt").value, "");
  assert.equal(ui.metrics().includes("paid_bridge_rendered"), false);
});

test("F10 / S04 — supporting VM: backend private error messages are never shown", async (t) => {
  const ui = await createFrontendFixture(t, { readings: ({ response }) => response({ error: { code: "VALIDATION_ERROR", message: "SYNTHETIC_PRIVATE_BACKEND_ERROR" } }, 400) });
  await ui.submit();
  assert.equal(ui.elements.get("error-state").hidden, false);
  assert.match(ui.elements.get("error-state").textContent, /Please enter a synthetic situation/);
  assert.doesNotMatch(ui.elements.get("error-state").textContent, /SYNTHETIC_PRIVATE_BACKEND_ERROR/);
  assert.equal(ui.elements.get("result-panel").hidden, true);
  assert.equal(ui.uses, 0);
});

test("F11 / S02 — supporting VM: terminal execution failure leaves no submitted textarea copy", async (t) => {
  const ui = await createFrontendFixture(t, { readings: ({ response }) => response({ error: { code: "EXECUTION_FAILED" } }, 503) });
  await ui.submit("SYNTHETIC_FAILED_SUBMISSION_CANARY");
  assert.equal(ui.elements.get("prompt").value, "");
  assert.equal(ui.elements.get("character-count").textContent, "0 / 4,000");
  assert.equal(ui.elements.get("result-panel").hidden, true);
  assert.match(ui.elements.get("error-state").textContent, /No use was consumed/);
  const attempts = ui.requests.filter((request) => request.path === "/api/readings");
  assert.equal(attempts.length, 3);
  assert.equal(new Set(attempts.map((request) => request.body)).size, 1, "internal retries use the same frozen request body");
  assert.equal(ui.executionAdmissions, 1);
  assert.equal(ui.uses, 0);
});

test("F12 / S02 — supporting VM: receipt expiry clears submitted text while a transport response is pending", async (t) => {
  const gate = deferred();
  const ui = await createFrontendFixture(t, {
    // A near-expired receipt tests the UI deadline seam; backend48s lifetime is qualified separately.
    executionLifetimeMs: 250,
    readings: async ({ request, successfulOutcome, response }) => { await gate.promise; return response(successfulOutcome(request.request.prompt), 201); },
  });
  const pending = ui.submit("SYNTHETIC_EXPIRED_SUBMISSION_CANARY");
  await settleFrontend();
  assert.equal(ui.elements.get("prompt").value, "", "submitted text is removed before waiting on transport");
  await new Promise((resolveExpiry) => setTimeout(resolveExpiry, 350));
  assert.equal(ui.elements.get("prompt").value, "");
  assert.equal(ui.elements.get("result-panel").hidden, true);
  assert.match(ui.elements.get("error-state").textContent, /recovery window has ended/);
  gate.resolve();
  await pending;
  assert.equal(ui.elements.get("result-panel").hidden, true);
  assert.equal(ui.elements.get("result-summary").textContent, "");
  assert.equal(ui.executionAdmissions, 1);
});

test("F13 / S02 — supporting VM: admission failure preserves still-unsubmitted text", async (t) => {
  const ui = await createFrontendFixture(t, { executionAdmission: ({ response }) => response({ error: { code: "CAPACITY_EXCEEDED" } }, 503) });
  const prompt = "SYNTHETIC_NOT_SUBMITTED_CANARY";
  await ui.submit(prompt);
  assert.equal(ui.elements.get("prompt").value, prompt);
  assert.equal(ui.requests.filter((request) => request.path === "/api/readings").length, 0);
  assert.equal(ui.executionAdmissions, 0);
  assert.equal(ui.uses, 0);
});
