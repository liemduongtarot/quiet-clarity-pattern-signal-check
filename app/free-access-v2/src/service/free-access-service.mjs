import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import {
  CapacityError, ExecutionError, ExecutionTimeoutError, IdempotencyCollisionError,
  QuotaExceededError, ReceiptError, RequestInProgressError, ResponseNotIssuedError, ValidationError,
} from "../errors.mjs";
import { canonicalRequestJson, normalizePSCRequest, validatePSCExecutionResult } from "../executor/contract.mjs";
import { assertClientEvent } from "../analytics/counters.mjs";
import { createPolicy } from "../policy.mjs";

const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const hmac = (value, key) => createHmac("sha256", key).update(value).digest("base64url");

export class FreeAccessService {
  #store;
  #executor;
  #policy;
  #clock;
  #quotaTokens;
  #receiptKey = randomBytes(32);
  #requestDigestKey = randomBytes(32);
  #receipts = new Map();
  #reaper;
  #closed = false;

  constructor({ store, executor, policy = createPolicy(), clock = { now: () => Date.now() }, quotaTokens }) {
    if (!store || typeof executor?.executePSC !== "function" || !quotaTokens) throw new TypeError("Service dependencies are required");
    this.#store = store;
    this.#executor = executor;
    this.#policy = createPolicy(policy);
    this.#clock = clock;
    this.#quotaTokens = quotaTokens;
    this.#reaper = setInterval(() => this.sweepExpired(), this.#policy.receiptReaperMs);
    this.#reaper.unref();
  }

  get executorMetrics() { return this.#executor.metrics; }
  get receiptCount() { return this.#receipts.size; }

  #assertOpen() {
    if (this.#closed) throw new ReceiptError();
  }

  issueExecution() {
    this.#assertOpen();
    this.sweepExpired();
    if (this.#receipts.size >= this.#policy.maxReceipts) throw new CapacityError();
    const now = this.#clock.now();
    let id;
    do { id = randomUUID(); } while (this.#receipts.has(id));
    const payload = { execution_id: id, issued_at: now, expires_at: now + this.#policy.receiptTtlMs };
    const encoded = encode(payload);
    const receipt = encoded + "." + hmac(encoded, this.#receiptKey);
    this.#receipts.set(id, {
      id, issuedAt: payload.issued_at, expiresAt: payload.expires_at, state: "ready",
      digest: undefined, result: undefined, outcome: undefined, quotaToken: undefined, abort: undefined, issuing: false,
    });
    return Object.freeze({ receipt, expiresAt: new Date(payload.expires_at).toISOString() });
  }

  #receipt(receipt) {
    this.#assertOpen();
    if (typeof receipt !== "string" || receipt.length > 768 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(receipt)) throw new ReceiptError();
    const [encoded, signature] = receipt.split(".");
    const expected = Buffer.from(hmac(encoded, this.#receiptKey));
    const supplied = Buffer.from(signature);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) throw new ReceiptError();
    let payload;
    try { payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")); } catch { throw new ReceiptError(); }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)
      || Object.keys(payload).join(",") !== "execution_id,issued_at,expires_at" || encode(payload) !== encoded
      || typeof payload.execution_id !== "string" || !/^[a-f0-9-]{36}$/.test(payload.execution_id)
      || !Number.isSafeInteger(payload.issued_at) || !Number.isSafeInteger(payload.expires_at)
      || payload.expires_at !== payload.issued_at + this.#policy.receiptTtlMs || payload.issued_at > this.#clock.now()) throw new ReceiptError();
    if (this.#clock.now() >= payload.expires_at) {
      this.#dispose(payload.execution_id);
      throw new ReceiptError(true);
    }
    const entry = this.#receipts.get(payload.execution_id);
    if (!entry || entry.issuedAt !== payload.issued_at || entry.expiresAt !== payload.expires_at) throw new ReceiptError();
    return entry;
  }

  #dispose(id) {
    const entry = this.#receipts.get(id);
    if (!entry) return;
    entry.abort?.();
    entry.result = undefined;
    entry.outcome = undefined;
    entry.quotaToken = undefined;
    entry.digest = undefined;
    entry.abort = undefined;
    this.#receipts.delete(id);
  }

  sweepExpired() {
    let removed = 0;
    const now = this.#clock.now();
    for (const [id, entry] of this.#receipts) {
      if (now >= entry.expiresAt) { this.#dispose(id); removed += 1; }
    }
    return removed;
  }

  close() {
    if (this.#closed) return;
    this.#closed = true;
    clearInterval(this.#reaper);
    for (const id of this.#receipts.keys()) this.#dispose(id);
    this.#receiptKey.fill(0);
    this.#requestDigestKey.fill(0);
  }

  quota(token) { return this.#quotaTokens.quota(token, this.#clock.now()); }

  recordClientEvent(event) {
    assertClientEvent(event);
    this.#store.increment(event);
  }

  #aggregate(names) {
    // Telemetry cannot reverse an issued result or cause a duplicate increment on retry.
    // A failed write is intentionally not repaired from a retained event log.
    try { this.#store.incrementMany(names); } catch { /* Possible undercount; no body/error logging. */ }
  }

  async #executeBounded(request, entry) {
    const controller = new AbortController();
    const deadline = Math.min(this.#clock.now() + this.#policy.executionTimeoutMs, entry.expiresAt);
    entry.abort = () => controller.abort();
    let timer;
    const timeout = new Promise((_, reject) => {
      controller.signal.addEventListener("abort", () => reject(new ExecutionTimeoutError()), { once: true });
      timer = setTimeout(() => controller.abort(), Math.max(1, deadline - this.#clock.now()));
    });
    try {
      const execution = Promise.resolve().then(() => {
        if (controller.signal.aborted || this.#closed || this.#clock.now() >= deadline) throw new ExecutionTimeoutError();
        return this.#executor.executePSC(request, { signal: controller.signal, deadline });
      });
      const rawResult = await Promise.race([execution, timeout]);
      if (controller.signal.aborted || this.#closed || this.#clock.now() >= deadline || !this.#receipts.has(entry.id)) throw new ExecutionTimeoutError();
      const result = validatePSCExecutionResult(rawResult);
      if (controller.signal.aborted || this.#closed || this.#clock.now() >= deadline || !this.#receipts.has(entry.id)) throw new ExecutionTimeoutError();
      return result;
    } catch (error) {
      throw error instanceof ExecutionTimeoutError ? error : new ExecutionError();
    } finally {
      clearTimeout(timer);
      entry.abort = undefined;
      request = undefined;
    }
  }

  #issue(entry, outcome, token, issueResponse) {
    // Commit the quota transition/recovery state before issuing. A synchronous
    // pre-issuance failure compensates this memory-only transition; no DOM ack.
    entry.state = "committed";
    entry.issuing = true;
    entry.outcome = outcome;
    entry.quotaToken = token;
    try {
      const accepted = issueResponse(outcome, token);
      if (accepted === false || (accepted && typeof accepted.then === "function")) {
        if (accepted && typeof accepted.catch === "function") accepted.catch(() => {});
        throw new ResponseNotIssuedError();
      }
    } catch {
      entry.outcome = undefined;
      entry.quotaToken = undefined;
      entry.state = "completed";
      throw new ResponseNotIssuedError();
    } finally { entry.issuing = false; }
  }

  async createReading({ receipt, quotaToken, request, issueResponse }) {
    if (typeof issueResponse !== "function" || issueResponse.constructor?.name === "AsyncFunction") throw new ValidationError();
    const entry = this.#receipt(receipt);
    // This is enforcement-only parsing. No token or derivative reaches storage/analytics.
    this.#quotaTokens.parse(quotaToken, this.#clock.now());
    let normalizedRequest = normalizePSCRequest(request);
    const digest = hmac(canonicalRequestJson(normalizedRequest), this.#requestDigestKey);
    // Normalization can cross the capability boundary; never read cached raw
    // results merely because the receipt was valid before that work began.
    this.#receipt(receipt);
    if (entry.digest && entry.digest !== digest) throw new IdempotencyCollisionError();
    if (!entry.digest) entry.digest = digest;
    if (entry.state === "in_progress" || entry.issuing) throw new RequestInProgressError();

    if (entry.state === "committed") {
      normalizedRequest = undefined;
      const token = this.#quotaTokens.newerToken(quotaToken, entry.quotaToken, this.#clock.now());
      const outcome = { reading: entry.outcome.reading, quota: this.quota(token), replayed: true };
      try {
        const accepted = issueResponse(outcome, token);
        if (accepted === false || (accepted && typeof accepted.then === "function")) {
          if (accepted && typeof accepted.catch === "function") accepted.catch(() => {});
          throw new ResponseNotIssuedError();
        }
      } catch { throw new ResponseNotIssuedError(); }
      return outcome;
    }

    if (!this.quota(quotaToken).eligible) {
      normalizedRequest = undefined;
      this.#aggregate(["quota_blocked"]);
      throw new QuotaExceededError(this.quota(quotaToken));
    }

    if (!entry.result) {
      entry.state = "in_progress";
      try {
        entry.result = await this.#executeBounded(normalizedRequest, entry);
        entry.state = "completed";
      } catch (error) {
        entry.state = "ready";
        throw error;
      } finally { normalizedRequest = undefined; }
    } else { normalizedRequest = undefined; }

    this.#receipt(receipt);
    const now = this.#clock.now();
    const transition = this.#quotaTokens.next(quotaToken, now);
    const outcome = {
      reading: Object.freeze({ result: entry.result, createdAt: new Date(now).toISOString() }),
      quota: transition.quota,
      replayed: false,
    };
    this.#issue(entry, outcome, transition.token, issueResponse);

    const uses = transition.quota.successfulUses;
    const names = ["psc_result_valid_committed", uses === 1 ? "quota_cycle_started" : "quota_cycle_reached_" + uses];
    if (uses === 4) {
      const elapsed = now - Date.parse(transition.quota.cycleStartsAt);
      names.push(elapsed < 3600000 ? "time_to_exhaust_under_1h" : elapsed < 86400000 ? "time_to_exhaust_1h_to_24h" : "time_to_exhaust_24h_to_720h");
    }
    this.#aggregate(names);
    return outcome;
  }
}
