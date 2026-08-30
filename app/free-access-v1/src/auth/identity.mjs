import { createHmac, timingSafeEqual } from "node:crypto";
import { AuthenticationError } from "../errors.mjs";

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decode(value) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    throw new AuthenticationError("The identity token is malformed");
  }
}

function signature(input, secret) {
  return createHmac("sha256", secret).update(input).digest("base64url");
}

export function assertAuthSecret(secret) {
  if (typeof secret !== "string" || Buffer.byteLength(secret) < 32) {
    throw new TypeError("FREE_ACCESS_AUTH_SECRET must contain at least 32 bytes");
  }
}

export function issueIdentityToken(
  { subject, email, emailVerified = true },
  { secret, now = Date.now(), expiresInMs = 60 * 60 * 1000 },
) {
  assertAuthSecret(secret);
  if (!subject || !email) throw new TypeError("subject and email are required");
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    sub: String(subject),
    email: String(email),
    email_verified: emailVerified === true,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + expiresInMs) / 1000),
  });
  const input = `${header}.${payload}`;
  return `${input}.${signature(input, secret)}`;
}

export function verifyIdentityToken(token, { secret, now = Date.now() }) {
  assertAuthSecret(secret);
  if (typeof token !== "string") throw new AuthenticationError();
  const parts = token.split(".");
  if (parts.length !== 3) throw new AuthenticationError("The identity token is malformed");

  const [headerPart, payloadPart, suppliedSignature] = parts;
  const header = decode(headerPart);
  if (header.alg !== "HS256" || header.typ !== "JWT") {
    throw new AuthenticationError("The identity token algorithm is not accepted");
  }

  const expectedSignature = signature(`${headerPart}.${payloadPart}`, secret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    throw new AuthenticationError("The identity token signature is invalid");
  }

  const payload = decode(payloadPart);
  const nowSeconds = Math.floor(now / 1000);
  if (!payload.sub || !payload.email || payload.email_verified !== true) {
    throw new AuthenticationError("The account email must be verified");
  }
  if (!Number.isFinite(payload.exp) || payload.exp <= nowSeconds) {
    throw new AuthenticationError("The identity token has expired");
  }
  if (payload.nbf && payload.nbf > nowSeconds) {
    throw new AuthenticationError("The identity token is not active yet");
  }

  return Object.freeze({
    userId: String(payload.sub),
    email: String(payload.email).toLowerCase(),
    emailVerified: true,
  });
}

export function bearerTokenFromRequest(request) {
  const value = request.headers.authorization;
  const match = typeof value === "string" ? /^Bearer\s+(.+)$/i.exec(value) : null;
  if (!match) throw new AuthenticationError();
  return match[1];
}
