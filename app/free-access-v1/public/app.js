const elements = Object.fromEntries(
  [
    "account-label", "app-shell", "auth-error", "auth-form", "auth-panel", "character-count", "email",
    "error-state", "exhausted-copy", "exhausted-state", "history-empty", "history-list",
    "prompt", "quota-detail", "quota-status", "reading-form", "refresh-history", "result-date",
    "result-disclaimer", "result-next-steps", "result-panel", "result-signals", "result-summary",
    "sign-out", "submit-reading", "token", "use-token", "working-state",
  ].map((id) => [id, document.getElementById(id)]),
);

let accessToken = sessionStorage.getItem("free-access-token") ?? "";
let activeRequest = null;

function randomIdempotencyKey() {
  return `ui-${crypto.randomUUID()}`;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error?.message ?? "Request failed");
    error.code = body.error?.code;
    error.details = body.error?.details;
    throw error;
  }
  return body;
}

function showError(error) {
  const target = elements["auth-panel"].hidden ? elements["error-state"] : elements["auth-error"];
  target.textContent = error.message;
  target.hidden = false;
}

function clearError() {
  for (const target of [elements["auth-error"], elements["error-state"]]) {
    target.hidden = true;
    target.textContent = "";
  }
}

function renderQuota(quota) {
  const remaining = quota.remainingSuccessfulResults;
  elements["quota-status"].textContent = remaining === 1 ? "1 saved result remaining" : `${remaining} saved results remaining`;
  elements["quota-detail"].textContent = quota.cycleEndsAt
    ? `Cycle ends ${new Date(quota.cycleEndsAt).toLocaleDateString(undefined, { dateStyle: "medium" })}`
    : "Your 30-day cycle starts with your first successfully saved result.";
  const exhausted = !quota.eligible && quota.successfulUses >= quota.policy.maxSuccessfulResults;
  elements["submit-reading"].disabled = !quota.eligible;
  elements["exhausted-state"].hidden = !exhausted;
  elements["reading-form"].hidden = exhausted;
  if (exhausted && quota.cycleEndsAt) {
    elements["exhausted-copy"].textContent = `New readings open after ${new Date(quota.cycleEndsAt).toLocaleString()}. Every saved result remains available below.`;
  }
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

async function loadHistory() {
  const { readings } = await api("/api/readings");
  elements["history-empty"].hidden = readings.length > 0;
  elements["history-list"].replaceChildren(...readings.map((reading) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-card";
    const date = document.createElement("time");
    date.textContent = new Date(reading.createdAt).toLocaleString();
    const summary = document.createElement("strong");
    summary.textContent = reading.result.reading.summary;
    button.append(date, summary);
    button.addEventListener("click", async () => {
      clearError();
      try {
        const reopened = await api(`/api/readings/${reading.id}`);
        renderReading(reopened.reading);
      } catch (error) {
        showError(error);
      }
    });
    return button;
  }));
}

async function loadAccount() {
  clearError();
  try {
    const { quota } = await api("/api/quota");
    elements["auth-panel"].hidden = true;
    elements["app-shell"].hidden = false;
    elements["sign-out"].hidden = false;
    elements["account-label"].textContent = "Verified account";
    renderQuota(quota);
    await loadHistory();
  } catch (error) {
    accessToken = "";
    sessionStorage.removeItem("free-access-token");
    elements["auth-panel"].hidden = false;
    elements["app-shell"].hidden = true;
    elements["sign-out"].hidden = true;
    elements["account-label"].textContent = "";
    if (error.code && error.code !== "AUTHENTICATION_REQUIRED") showError(error);
  }
}

elements["auth-form"].addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();
  try {
    const session = await api("/api/dev/session", {
      method: "POST",
      body: JSON.stringify({ email: elements.email.value }),
    });
    accessToken = session.token;
    sessionStorage.setItem("free-access-token", accessToken);
    await loadAccount();
  } catch (error) {
    showError(error);
  }
});

elements["use-token"].addEventListener("click", async () => {
  accessToken = elements.token.value.trim();
  sessionStorage.setItem("free-access-token", accessToken);
  await loadAccount();
});

elements["sign-out"].addEventListener("click", () => {
  accessToken = "";
  sessionStorage.removeItem("free-access-token");
  elements["result-panel"].hidden = true;
  loadAccount();
});

elements.prompt.addEventListener("input", () => {
  elements["character-count"].textContent = `${elements.prompt.value.length.toLocaleString()} / 4,000`;
});

elements["reading-form"].addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();
  elements["working-state"].hidden = false;
  elements["submit-reading"].disabled = true;
  activeRequest ??= randomIdempotencyKey();
  try {
    const outcome = await api("/api/readings", {
      method: "POST",
      headers: { "idempotency-key": activeRequest },
      body: JSON.stringify({ request: { prompt: elements.prompt.value, context: {} } }),
    });
    activeRequest = null;
    elements.prompt.value = "";
    elements["character-count"].textContent = "0 / 4,000";
    renderReading(outcome.reading);
    renderQuota(outcome.quota);
    await loadHistory();
  } catch (error) {
    if (error.code !== "REQUEST_IN_PROGRESS") activeRequest = null;
    showError(error);
    try {
      const { quota } = await api("/api/quota");
      renderQuota(quota);
    } catch { /* Authentication state is handled on the next refresh. */ }
  } finally {
    elements["working-state"].hidden = true;
    if (!elements["exhausted-state"].hidden) elements["submit-reading"].disabled = true;
  }
});

elements["refresh-history"].addEventListener("click", async () => {
  clearError();
  try { await loadHistory(); } catch (error) { showError(error); }
});

loadAccount();
