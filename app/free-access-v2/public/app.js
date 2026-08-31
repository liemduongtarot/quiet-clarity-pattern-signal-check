const elements = Object.fromEntries(
  [
    "character-count", "copy-result", "download-result", "error-state", "exhausted-copy",
    "exhausted-state", "lock-notice", "paid-bridge", "paid-bridge-details", "paid-bridge-toggle",
    "prompt", "quota-detail", "quota-status", "reading-form", "result-action-status", "result-date",
    "result-disclaimer", "result-next-steps", "result-panel", "result-signals", "result-summary",
    "submit-reading", "working-copy", "working-state",
  ].map((id) => [id, document.getElementById(id)]),
);

const ERROR_COPY = Object.freeze({
  VALIDATION_ERROR: "Please enter a synthetic situation of no more than 4,000 characters.",
  QUOTA_TOKEN_INVALID: "This browser's allowance token could not be verified. No result was created.",
  EXECUTION_RECEIPT_INVALID: "This recovery window is no longer available. You may start a new request with your remaining allowance.",
  EXECUTION_RECEIPT_EXPIRED: "This recovery window has ended. We cannot reopen that result. You may start a new request with your remaining allowance.",
  IDEMPOTENCY_COLLISION: "The recovery request did not match the original request. No additional use was consumed.",
  REQUEST_IN_PROGRESS: "The same request is still being processed. Recovery does not spend another use.",
  QUOTA_EXHAUSTED: "This browser cycle has no Free results remaining. New results become available after the cycle ends.",
  CAPACITY_EXCEEDED: "The specimen is busy. Please try again shortly.",
  EXECUTION_FAILED: "The mock execution failed. No use was consumed.",
  EXECUTION_TIMEOUT: "The mock execution timed out. No use was consumed.",
  RESPONSE_NOT_ISSUED: "The result response could not be issued. Recovery will use the same request.",
  INTERNAL_ERROR: "The request could not be completed safely.",
  NETWORK_ERROR: "The connection was interrupted. Recovery will use the same request.",
  TRANSPORT_TIMEOUT: "The response took too long. Recovery will use the same request.",
  INVALID_RESPONSE: "A valid response was not received. Recovery will use the same request.",
  RECOVERY_PENDING: "The automatic recovery attempts have stopped. Wait for this recovery window to end before starting a new request.",
  REQUEST_CANCELLED: "The request was cancelled.",
  REQUEST_FAILED: "The request could not be completed. Please try again.",
});
const RETRYABLE_CODES = new Set([
  "NETWORK_ERROR", "TRANSPORT_TIMEOUT", "INVALID_RESPONSE", "REQUEST_IN_PROGRESS",
  "CAPACITY_EXCEEDED", "EXECUTION_FAILED", "EXECUTION_TIMEOUT", "RESPONSE_NOT_ISSUED", "INTERNAL_ERROR",
]);
const AMBIGUOUS_CODES = new Set([
  "NETWORK_ERROR", "TRANSPORT_TIMEOUT", "INVALID_RESPONSE", "REQUEST_IN_PROGRESS",
  "RESPONSE_NOT_ISSUED", "INTERNAL_ERROR",
]);
const CLIENT_EVENTS = new Set([
  "psc_started", "psc_result_copy_succeeded", "psc_result_download_initiated",
  "paid_bridge_rendered", "paid_bridge_opened",
]);
const browserLockAvailable = typeof navigator.locks?.request === "function";
let activeRequest = null;
let currentReading = null;
let currentQuota = null;
let flowController = null;
let recoveryTimer = null;
let busy = false;
let pageHidden = false;
let pageEpoch = 0;
let questionnaireStarted = false;

elements["lock-notice"].hidden = browserLockAvailable;

function fixedError(code) {
  const safeCode = typeof code === "string" && Object.hasOwn(ERROR_COPY, code) ? code : "REQUEST_FAILED";
  const error = new Error(ERROR_COPY[safeCode]);
  error.code = safeCode;
  return error;
}

async function api(path, { method = "GET", body, signal, timeoutMs = 15_000 } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, Math.max(1, timeoutMs));
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) controller.abort();
  try {
    const response = await fetch(path, {
      method,
      body,
      signal: controller.signal,
      credentials: "same-origin",
      cache: "no-store",
      mode: "same-origin",
      referrerPolicy: "no-referrer",
      headers: body === undefined ? {} : { "content-type": "application/json" },
    });
    const payload = await response.json().catch(() => { throw fixedError("INVALID_RESPONSE"); });
    if (!response.ok) throw fixedError(payload.error?.code);
    return payload;
  } catch (error) {
    if (signal?.aborted) throw fixedError("REQUEST_CANCELLED");
    if (timedOut) throw fixedError("TRANSPORT_TIMEOUT");
    if (typeof error?.code === "string" && Object.hasOwn(ERROR_COPY, error.code)) throw error;
    throw fixedError("NETWORK_ERROR");
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
}

function metric(event) {
  if (pageHidden || !CLIENT_EVENTS.has(event)) return;
  void fetch("/api/metrics", {
    method: "POST",
    credentials: "omit",
    cache: "no-store",
    mode: "same-origin",
    referrerPolicy: "no-referrer",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event }),
  }).catch(() => { /* Measurement failure cannot change access or result behavior. */ });
}

function showError(error) {
  elements["error-state"].textContent = fixedError(error?.code).message;
  elements["error-state"].hidden = false;
}

function clearError() {
  elements["error-state"].hidden = true;
  elements["error-state"].textContent = "";
}

function updateControls() {
  elements.prompt.disabled = busy || Boolean(activeRequest);
  elements["submit-reading"].disabled = busy || Boolean(activeRequest) || !currentQuota?.eligible;
  elements["working-state"].hidden = !busy;
}

function renderQuota(quota) {
  currentQuota = quota;
  const remaining = quota.remainingSuccessfulResults;
  elements["quota-status"].textContent = remaining === 1 ? "1 Free result remaining" : `${remaining} Free results remaining`;
  elements["quota-detail"].textContent = quota.cycleEndsAt
    ? `Cycle ends ${new Date(quota.cycleEndsAt).toLocaleString()}`
    : "Your 720-hour cycle starts with your first successful result.";
  const exhausted = !quota.eligible && quota.successfulUses >= quota.policy.maxSuccessfulResults;
  elements["exhausted-state"].hidden = !exhausted;
  elements["reading-form"].hidden = exhausted;
  if (exhausted && quota.cycleEndsAt) {
    const currentResultCopy = currentReading
      ? "Your current result remains available to copy or download."
      : "There is no saved result history to reopen on this page.";
    elements["exhausted-copy"].textContent = `${currentResultCopy} New results are available after ${new Date(quota.cycleEndsAt).toLocaleString()}.`;
  }
  updateControls();
}

function renderReading(reading) {
  elements["result-summary"].textContent = reading.result.reading.summary;
  elements["result-date"].textContent = new Date(reading.createdAt).toLocaleString();
  elements["result-signals"].replaceChildren(...reading.result.reading.signals.map((signal) => {
    const item = document.createElement("div");
    item.className = "signal";
    const label = document.createElement("span");
    label.textContent = signal.label;
    const strength = document.createElement("strong");
    strength.textContent = `${signal.strength} / 5`;
    item.append(label, strength);
    return item;
  }));
  elements["result-next-steps"].replaceChildren(...reading.result.reading.nextSteps.map((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    return item;
  }));
  elements["result-disclaimer"].textContent = reading.result.reading.disclaimer ?? "";
  elements["result-panel"].hidden = false;
  elements["result-panel"].scrollIntoView({ behavior: "smooth", block: "start" });
}

async function refreshQuota(signal, expectedEpoch = pageEpoch) {
  const { quota } = await api("/api/quota", { signal });
  if (!pageHidden && pageEpoch === expectedEpoch) renderQuota(quota);
  return quota;
}

function clearActiveRequest() {
  clearTimeout(recoveryTimer);
  recoveryTimer = null;
  if (activeRequest) {
    activeRequest.body = "";
    activeRequest.receipt = "";
  }
  activeRequest = null;
}

function expireRecovery(request, expectedEpoch) {
  if (activeRequest !== request) return;
  clearActiveRequest();
  flowController?.abort();
  if (pageHidden || pageEpoch !== expectedEpoch) return;
  showError(fixedError("EXECUTION_RECEIPT_EXPIRED"));
  updateControls();
  void refreshQuota(undefined, expectedEpoch).catch(() => { /* Keep the fixed expiry notice. */ });
}

function backoff(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    const cancel = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      reject(fixedError("REQUEST_CANCELLED"));
    };
    const timer = setTimeout(() => { signal.removeEventListener("abort", cancel); resolve(); }, milliseconds);
    signal.addEventListener("abort", cancel, { once: true });
    if (signal.aborted) cancel();
  });
}

async function createWithRetries(request, signal) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const remaining = request.expiresAt - Date.now();
    if (remaining <= 0) throw fixedError("EXECUTION_RECEIPT_EXPIRED");
    if (signal.aborted) throw fixedError("REQUEST_CANCELLED");
    try {
      return await api("/api/readings", {
        method: "POST",
        body: request.body,
        signal,
        timeoutMs: Math.min(15_000, remaining),
      });
    } catch (error) {
      if (signal.aborted || !RETRYABLE_CODES.has(error.code) || attempt === 3) throw error;
      const delay = attempt * 1_000;
      if (Date.now() + delay >= request.expiresAt) throw fixedError("EXECUTION_RECEIPT_EXPIRED");
      elements["working-copy"].textContent = `Recovering the same request, attempt ${attempt + 1} of 3. No additional use is spent for a recovered result.`;
      await backoff(delay, signal);
    }
  }
}

async function createReading(signal, expectedEpoch) {
  const quota = await refreshQuota(signal, expectedEpoch);
  if (signal.aborted || pageEpoch !== expectedEpoch) throw fixedError("REQUEST_CANCELLED");
  if (!quota.eligible) throw fixedError("QUOTA_EXHAUSTED");
  elements["working-copy"].textContent = "Only a valid, committed result issued with updated allowance counts.";
  const execution = await api("/api/executions", { method: "POST", body: "{}", signal });
  if (signal.aborted || pageEpoch !== expectedEpoch) throw fixedError("REQUEST_CANCELLED");
  const expiresAt = new Date(execution.expiresAt).getTime();
  if (typeof execution.receipt !== "string" || !Number.isFinite(expiresAt)) throw fixedError("INVALID_RESPONSE");
  if (expiresAt <= Date.now()) throw fixedError("EXECUTION_RECEIPT_EXPIRED");
  activeRequest = {
    receipt: execution.receipt,
    expiresAt,
    body: JSON.stringify({ receipt: execution.receipt, request: { prompt: elements.prompt.value, context: {} } }),
  };
  elements.prompt.value = "";
  elements["character-count"].textContent = "0 / 4,000";
  recoveryTimer = setTimeout(expireRecovery, expiresAt - Date.now(), activeRequest, expectedEpoch);
  let outcome;
  try {
    outcome = await createWithRetries(activeRequest, signal);
  } catch (error) {
    if (!signal.aborted && activeRequest && AMBIGUOUS_CODES.has(error.code) && activeRequest.expiresAt > Date.now()) {
      showError(fixedError("RECOVERY_PENDING"));
      elements["working-copy"].textContent = "Keeping this browser's request lock until the recovery window ends. No new execution will start automatically.";
      await backoff(activeRequest.expiresAt - Date.now(), signal);
      throw fixedError("EXECUTION_RECEIPT_EXPIRED");
    }
    throw error;
  }
  if (signal.aborted || pageEpoch !== expectedEpoch) throw fixedError("REQUEST_CANCELLED");
  clearActiveRequest();
  currentReading = outcome.reading;
  elements.prompt.value = "";
  elements["character-count"].textContent = "0 / 4,000";
  elements["result-action-status"].textContent = "";
  elements["paid-bridge-details"].hidden = true;
  elements["paid-bridge-toggle"].setAttribute("aria-expanded", "false");
  renderReading(outcome.reading);
  renderQuota(outcome.quota);
  elements["paid-bridge"].hidden = false;
  metric("paid_bridge_rendered");
}

function noteQuestionnaireStarted() {
  if (questionnaireStarted) return;
  questionnaireStarted = true;
  metric("psc_started");
}

elements.prompt.addEventListener("focus", noteQuestionnaireStarted);
elements.prompt.addEventListener("input", () => {
  noteQuestionnaireStarted();
  elements["character-count"].textContent = `${elements.prompt.value.length.toLocaleString()} / 4,000`;
});

elements["reading-form"].addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy || activeRequest || pageHidden) return;
  noteQuestionnaireStarted();
  clearError();
  busy = true;
  const expectedEpoch = pageEpoch;
  const controller = new AbortController();
  flowController = controller;
  elements["working-copy"].textContent = browserLockAvailable
    ? "Waiting for this browser's current request, then checking its latest allowance."
    : "Checking this page's allowance. Please use one tab at a time.";
  updateControls();
  try {
    if (browserLockAvailable) {
      await navigator.locks.request("psc-free-quota", { mode: "exclusive", signal: controller.signal }, () => createReading(controller.signal, expectedEpoch));
    } else {
      await createReading(controller.signal, expectedEpoch);
    }
  } catch (error) {
    if (pageHidden || pageEpoch !== expectedEpoch || controller.signal.aborted) return;
    const recoveryPending = activeRequest && AMBIGUOUS_CODES.has(error.code) && activeRequest.expiresAt > Date.now();
    if (!recoveryPending) clearActiveRequest();
    showError(recoveryPending ? fixedError("RECOVERY_PENDING") : error);
    try { await refreshQuota(controller.signal, expectedEpoch); } catch { /* Keep the fixed request error. */ }
  } finally {
    if (pageEpoch === expectedEpoch) {
      flowController = null;
      busy = false;
      updateControls();
    }
  }
});

function resultText() {
  const reading = currentReading.result.reading;
  return [
    "Pattern Signal Check — current mock result",
    reading.summary,
    ...reading.signals.map((signal) => `${signal.label}: ${signal.strength} / 5`),
    "Next steps",
    ...reading.nextSteps.map((step, index) => `${index + 1}. ${step}`),
    reading.disclaimer ?? "",
  ].join("\n\n");
}

elements["copy-result"].addEventListener("click", async () => {
  if (!currentReading || pageHidden) return;
  const expectedEpoch = pageEpoch;
  try {
    await navigator.clipboard.writeText(resultText());
    if (pageHidden || pageEpoch !== expectedEpoch) return;
    elements["result-action-status"].textContent = "Copied.";
    metric("psc_result_copy_succeeded");
  } catch {
    if (pageHidden || pageEpoch !== expectedEpoch) return;
    elements["result-action-status"].textContent = "Copy was not available. You can select the text or download it.";
  }
});

elements["download-result"].addEventListener("click", () => {
  if (!currentReading || pageHidden) return;
  let url;
  const link = document.createElement("a");
  try {
    url = URL.createObjectURL(new Blob([resultText()], { type: "text/plain;charset=utf-8" }));
    link.href = url;
    link.download = "psc-free-result.txt";
    link.hidden = true;
    document.body.append(link);
    link.click();
    elements["result-action-status"].textContent = "Download initiated.";
    metric("psc_result_download_initiated");
  } catch {
    elements["result-action-status"].textContent = "Download could not be initiated. You can copy or select the result text.";
  } finally {
    link.remove();
    if (url) URL.revokeObjectURL(url);
  }
});

elements["paid-bridge-toggle"].addEventListener("click", () => {
  if (!currentReading || pageHidden) return;
  const opening = elements["paid-bridge-details"].hidden;
  elements["paid-bridge-details"].hidden = !opening;
  elements["paid-bridge-toggle"].setAttribute("aria-expanded", String(opening));
  if (opening) metric("paid_bridge_opened");
});

function clearRawState() {
  flowController?.abort();
  flowController = null;
  clearActiveRequest();
  currentReading = null;
  currentQuota = null;
  busy = false;
  elements.prompt.value = "";
  elements["character-count"].textContent = "0 / 4,000";
  for (const id of ["result-summary", "result-date", "result-disclaimer", "result-action-status"]) elements[id].textContent = "";
  elements["result-signals"].replaceChildren();
  elements["result-next-steps"].replaceChildren();
  elements["result-panel"].hidden = true;
  elements["paid-bridge"].hidden = true;
  elements["paid-bridge-details"].hidden = true;
  elements["paid-bridge-toggle"].setAttribute("aria-expanded", "false");
  elements["quota-status"].textContent = "Checking access…";
  elements["quota-detail"].textContent = "";
  elements["exhausted-state"].hidden = true;
  elements["reading-form"].hidden = false;
  clearError();
  updateControls();
}

window.addEventListener("pagehide", () => {
  pageHidden = true;
  pageEpoch += 1;
  clearRawState();
});
window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  pageHidden = false;
  questionnaireStarted = false;
  clearRawState();
  loadPageQuota();
});

function loadPageQuota() {
  const expectedEpoch = pageEpoch;
  void refreshQuota(undefined, expectedEpoch).catch((error) => {
    if (!pageHidden && pageEpoch === expectedEpoch) showError(error);
  });
}

loadPageQuota();
