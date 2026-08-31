import { createHmac, timingSafeEqual } from "node:crypto";
import { QuotaExceededError, QuotaTokenError } from "../errors.mjs";
import { DEFAULT_POLICY } from "../policy.mjs";

export const PRODUCTION_COOKIE_NAME = "__Host-psc_quota";
export const LOCAL_COOKIE_NAME = "psc_quota_local_synthetic";
const FIELDS = ["version", "cycle_started_at", "successful_uses", "expires_at", "key_id"];
const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const mac = (input, key) => createHmac("sha256", key).update(input).digest("base64url");

function checkedTime(now) {
  if (!Number.isSafeInteger(now) || now < 0) throw new QuotaTokenError();
  return now;
}

export class SignedQuotaTokens {
  #keys;
  #keyId;
  #clock;

  constructor({ keys, keyId, clock = { now: () => Date.now() } }) {
    if (!keys || typeof keys !== "object" || Array.isArray(keys) || !/^[A-Za-z0-9_-]{1,32}$/.test(keyId ?? "")) throw new TypeError("Quota signing configuration is invalid");
    this.#keys = new Map();
    for (const [id, secret] of Object.entries(keys)) {
      if (!/^[A-Za-z0-9_-]{1,32}$/.test(id) || !(typeof secret === "string" || Buffer.isBuffer(secret)) || Buffer.byteLength(secret) < 32) throw new TypeError("Quota signing keys require at least 32 bytes");
      this.#keys.set(id, Buffer.from(secret));
    }
    if (!this.#keys.has(keyId)) throw new TypeError("The current quota signing key is unavailable");
    this.#keyId = keyId;
    this.#clock = clock;
  }

  parse(token, now = this.#clock.now()) {
    checkedTime(now);
    if (token === undefined || token === null) return null;
    if (typeof token !== "string" || token.length > 1024 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token)) throw new QuotaTokenError();
    const [payloadPart, signature] = token.split(".");
    let payload;
    try { payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")); } catch { throw new QuotaTokenError(); }
    if (!payload || typeof payload !== "object" || Array.isArray(payload) || Object.keys(payload).join(",") !== FIELDS.join(",") || encode(payload) !== payloadPart) throw new QuotaTokenError();
    const key = this.#keys.get(payload.key_id);
    if (!key) throw new QuotaTokenError();
    const expected = Buffer.from(mac(payloadPart, key));
    const supplied = Buffer.from(signature);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new QuotaTokenError();
    if (payload.version !== 1 || !Number.isSafeInteger(payload.cycle_started_at) || payload.cycle_started_at < 0 || payload.cycle_started_at > now
      || !Number.isSafeInteger(payload.expires_at) || payload.expires_at !== payload.cycle_started_at + DEFAULT_POLICY.cycleDurationMs
      || !Number.isSafeInteger(payload.successful_uses) || payload.successful_uses < 1 || payload.successful_uses > 4) throw new QuotaTokenError();
    return now >= payload.expires_at ? null : Object.freeze(payload);
  }

  issue({ cycleStartedAt, successfulUses }, now = this.#clock.now()) {
    checkedTime(now);
    if (!Number.isSafeInteger(cycleStartedAt) || cycleStartedAt < 0 || cycleStartedAt > now || cycleStartedAt + DEFAULT_POLICY.cycleDurationMs <= now
      || !Number.isSafeInteger(successfulUses) || successfulUses < 1 || successfulUses > 4) throw new QuotaTokenError();
    const payload = {
      version: 1,
      cycle_started_at: cycleStartedAt,
      successful_uses: successfulUses,
      expires_at: cycleStartedAt + DEFAULT_POLICY.cycleDurationMs,
      key_id: this.#keyId,
    };
    const encoded = encode(payload);
    return `${encoded}.${mac(encoded, this.#keys.get(this.#keyId))}`;
  }

  quota(token, now = this.#clock.now()) {
    const payload = this.parse(token, now);
    const successfulUses = payload?.successful_uses ?? 0;
    return Object.freeze({
      policy: Object.freeze({ maxSuccessfulResults: 4, cycleDurationMs: DEFAULT_POLICY.cycleDurationMs }),
      cycleStartsAt: payload ? new Date(payload.cycle_started_at).toISOString() : null,
      cycleEndsAt: payload ? new Date(payload.expires_at).toISOString() : null,
      successfulUses,
      remainingSuccessfulResults: 4 - successfulUses,
      eligible: successfulUses < 4,
    });
  }

  next(token, now = this.#clock.now()) {
    const previous = this.parse(token, now);
    if (previous?.successful_uses === 4) throw new QuotaExceededError(this.quota(token, now));
    const updated = this.issue({ cycleStartedAt: previous?.cycle_started_at ?? now, successfulUses: (previous?.successful_uses ?? 0) + 1 }, now);
    return { token: updated, quota: this.quota(updated, now) };
  }

  // Ephemeral recovery comparison only; this never produces an analytics key.
  newerToken(currentToken, recoveredToken, now = this.#clock.now()) {
    const current = this.parse(currentToken, now);
    const recovered = this.parse(recoveredToken, now);
    if (!recovered) return current ? currentToken : undefined;
    if (!current) return recoveredToken;
    return current.cycle_started_at > recovered.cycle_started_at
      || (current.cycle_started_at === recovered.cycle_started_at && current.successful_uses >= recovered.successful_uses)
      ? currentToken : recoveredToken;
  }

  cookie(token, { localSynthetic = false, now = this.#clock.now() } = {}) {
    const payload = this.parse(token, now);
    if (!payload) throw new QuotaTokenError();
    const remainingSeconds = Math.max(0, Math.floor((payload.expires_at - now) / 1000));
    return `${localSynthetic ? LOCAL_COOKIE_NAME : PRODUCTION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${remainingSeconds}; Expires=${new Date(payload.expires_at).toUTCString()}${localSynthetic ? "" : "; Secure"}`;
  }
}

export function quotaTokenFromRequest(request, { localSynthetic = false } = {}) {
  const name = localSynthetic ? LOCAL_COOKIE_NAME : PRODUCTION_COOKIE_NAME;
  const otherName = localSynthetic ? PRODUCTION_COOKIE_NAME : LOCAL_COOKIE_NAME;
  const header = request.headers.cookie;
  if (!header) return undefined;
  if (typeof header !== "string" || header.length > 8192) throw new QuotaTokenError();
  const values = [];
  for (const part of header.split(";")) {
    const position = part.indexOf("=");
    if (position < 0) continue;
    const key = part.slice(0, position).trim();
    if (key === otherName) throw new QuotaTokenError();
    if (key === name) values.push(part.slice(position + 1).trim());
  }
  if (values.length > 1) throw new QuotaTokenError();
  return values[0];
}
