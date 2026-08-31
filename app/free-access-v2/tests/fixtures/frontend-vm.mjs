// TEST-ONLY DOM/transport seams for supporting handler checks. NOT a real browser.
// Formal PRE and POST must separately supply actual browser observation artifacts.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createContext, runInContext } from "node:vm";
import { APP_ROOT } from "../helpers.mjs";

class SyntheticElement {
  constructor(tagName, id = "") {
    this.tagName = tagName; this.id = id; this.hidden = false; this.disabled = false;
    this.value = ""; this.textContent = ""; this.children = []; this.listeners = new Map(); this.attributes = {};
  }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  async dispatch(type, event = {}) {
    const supplied = { preventDefault() {}, ...event };
    await Promise.all((this.listeners.get(type) ?? []).map((listener) => listener(supplied)));
  }
  append(...children) { this.children.push(...children); for (const child of children) child.parent = this; }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  setAttribute(key, value) { this.attributes[key] = value; }
  scrollIntoView() {}
  remove() { this.removed = true; if (this.parent) this.parent.children = this.parent.children.filter((child) => child !== this); }
  click() { this.clicked = (this.clicked ?? 0) + 1; }
}

export async function settleFrontend() { await new Promise((resolveTurn) => setImmediate(resolveTurn)); }

export async function createFrontendFixture(t, { clipboard, locks = true, readings, downloadClickError = false, executionAdmission, executionLifetimeMs = 48_000 } = {}) {
  const html = readFileSync(resolve(APP_ROOT, "public/index.html"), "utf8");
  const elements = new Map();
  for (const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*\bid="([^"]+)"[^>]*)>/gi)) {
    const element = new SyntheticElement(match[1], match[3]);
    element.hidden = /\bhidden\b/.test(match[2]);
    elements.set(match[3], element);
  }
  const body = new SyntheticElement("body");
  const anchors = [];
  const createdBlobs = [];
  const revoked = [];
  const requests = [];
  const copied = [];
  const lockCalls = [];
  const window = new SyntheticElement("window");
  let lockActive = false;
  let uses = 0;
  let executionAdmissions = 0;
  let startedAt = null;
  const quota = () => ({
    policy: { maxSuccessfulResults: 4, cycleDurationMs: 2_592_000_000 },
    successfulUses: uses, remainingSuccessfulResults: 4 - uses, eligible: uses < 4,
    cycleStartsAt: startedAt, cycleEndsAt: startedAt ? new Date(Date.parse(startedAt) + 2_592_000_000).toISOString() : null,
  });
  function successfulOutcome(prompt) {
    uses += 1;
    startedAt ??= new Date().toISOString();
    return {
      reading: { createdAt: new Date().toISOString(), result: {
        reading: { summary: `Synthetic VM result: ${prompt}`, signals: [{ label: "synthetic", strength: 2 }], nextSteps: ["Synthetic next step"], disclaimer: "Synthetic handler fixture only" },
      } }, quota: quota(), replayed: false,
    };
  }
  const response = (payload, status = 200) => ({ ok: status >= 200 && status < 300, status, async json() { return payload; } });
  const document = {
    body,
    getElementById(id) { if (!elements.has(id)) throw new Error(`Missing fixture element ${id}`); return elements.get(id); },
    createElement(tagName) {
      const element = new SyntheticElement(tagName);
      if (tagName === "a") {
        anchors.push(element);
        if (downloadClickError) element.click = () => { throw new Error("SYNTHETIC_PRIVATE_CLICK_FAILURE"); };
      }
      return element;
    },
  };
  const navigator = {
    clipboard: { async writeText(text) { copied.push(text); return clipboard?.(text); } },
    ...(locks ? { locks: { async request(name, options, operation) {
      lockCalls.push({ name, mode: options.mode }); lockActive = true;
      try { return await operation(); } finally { lockActive = false; }
    } } } : {}),
  };
  const context = createContext({
    document, window, navigator, AbortController, Blob, Date, setTimeout, clearTimeout,
    URL: {
      createObjectURL(blob) { const url = `blob:synthetic-fixture-${createdBlobs.length}`; createdBlobs.push({ url, blob }); return url; },
      revokeObjectURL(url) { revoked.push(url); },
    },
    async fetch(path, options = {}) {
      requests.push({ path, ...options, lockActive });
      if (path === "/api/quota") return response({ quota: quota() });
      if (path === "/api/executions") {
        if (executionAdmission) return executionAdmission({ response });
        executionAdmissions += 1;
        return response({ receipt: `TEST-ONLY-VM-RECEIPT-${executionAdmissions}`, expiresAt: new Date(Date.now() + executionLifetimeMs).toISOString() }, 201);
      }
      if (path === "/api/readings") {
        const request = JSON.parse(options.body);
        if (readings) return readings({ request, options, successfulOutcome, response });
        return response(successfulOutcome(request.request.prompt), 201);
      }
      if (path === "/api/metrics") return response({ accepted: true }, 202);
      throw new Error("Unadmitted synthetic transport path");
    },
  });
  runInContext(readFileSync(resolve(APP_ROOT, "public/app.js"), "utf8"), context, { filename: "actual-successor-public-app.js" });
  t.after(async () => { await window.dispatch("pagehide"); await settleFrontend(); });
  await settleFrontend();
  return {
    elements, body, anchors, createdBlobs, revoked, requests, copied, lockCalls, window,
    async submit(prompt = "Synthetic handler fixture prompt") {
      elements.get("prompt").value = prompt;
      await elements.get("reading-form").dispatch("submit");
      await settleFrontend();
    },
    metrics() { return requests.filter((request) => request.path === "/api/metrics").map((request) => JSON.parse(request.body).event); },
    get uses() { return uses; }, get executionAdmissions() { return executionAdmissions; },
  };
}
