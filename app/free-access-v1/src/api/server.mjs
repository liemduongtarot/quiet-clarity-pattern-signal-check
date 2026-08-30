import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { AppError, AuthenticationError, ValidationError } from "../errors.mjs";
import { bearerTokenFromRequest, issueIdentityToken, verifyIdentityToken } from "../auth/identity.mjs";

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function sendJson(response, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    "cache-control": "no-store",
    ...headers,
  });
  response.end(payload);
}

async function readJson(request, maximumBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maximumBytes) throw new ValidationError("Request body is too large");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ValidationError("Request body must be valid JSON");
  }
}

function securityHeaders() {
  return {
    "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    "cross-origin-opener-policy": "same-origin",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
  };
}

function serveStatic(requestPath, publicDirectory, response) {
  const relative = requestPath === "/" ? "index.html" : decodeURIComponent(requestPath.slice(1));
  const candidate = resolve(publicDirectory, relative);
  const root = resolve(publicDirectory);
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) return false;
  if (!existsSync(candidate) || !statSync(candidate).isFile()) return false;
  const headers = {
    ...securityHeaders(),
    "content-type": CONTENT_TYPES[extname(candidate)] ?? "application/octet-stream",
    "cache-control": extname(candidate) === ".html" ? "no-store" : "public, max-age=300",
  };
  response.writeHead(200, headers);
  createReadStream(candidate).pipe(response);
  return true;
}

export function createAppServer({
  service,
  policy,
  authSecret,
  publicDirectory,
  developmentIdentityIssuer = false,
  clock = { now: () => Date.now() },
}) {
  function identity(request) {
    return verifyIdentityToken(bearerTokenFromRequest(request), {
      secret: authSecret,
      now: clock.now(),
    });
  }

  return createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    try {
      if (request.method === "GET" && url.pathname === "/health") {
        return sendJson(response, 200, {
          status: "ok",
          executor: "deterministic-mock",
          livePscExecutions: service.executorMetrics.livePscExecutions,
        }, securityHeaders());
      }

      if (request.method === "POST" && url.pathname === "/api/dev/session") {
        if (!developmentIdentityIssuer) throw new AuthenticationError("Development identity issuing is disabled");
        const body = await readJson(request, policy.maxRequestBytes);
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError("A valid email is required");
        const token = issueIdentityToken(
          { subject: `dev:${email}`, email, emailVerified: true },
          { secret: authSecret, now: clock.now() },
        );
        return sendJson(response, 200, { token, verified: true }, securityHeaders());
      }

      if (request.method === "GET" && url.pathname === "/api/quota") {
        return sendJson(response, 200, { quota: service.quota(identity(request)) }, securityHeaders());
      }

      if (request.method === "GET" && url.pathname === "/api/readings") {
        return sendJson(response, 200, { readings: service.history(identity(request)) }, securityHeaders());
      }

      const readingMatch = /^\/api\/readings\/([A-Za-z0-9-]+)$/.exec(url.pathname);
      if (request.method === "GET" && readingMatch) {
        return sendJson(response, 200, { reading: service.reopen(identity(request), readingMatch[1]) }, securityHeaders());
      }

      if (request.method === "POST" && url.pathname === "/api/readings") {
        const currentIdentity = identity(request);
        const body = await readJson(request, policy.maxRequestBytes);
        const idempotencyKey = request.headers["idempotency-key"];
        const outcome = await service.createReading({
          identity: currentIdentity,
          idempotencyKey,
          request: body.request,
        });
        return sendJson(
          response,
          outcome.replayed ? 200 : 201,
          outcome,
          { ...securityHeaders(), "idempotency-replayed": String(Boolean(outcome.replayed)) },
        );
      }

      if (request.method === "GET" && !url.pathname.startsWith("/api/")) {
        if (serveStatic(url.pathname, publicDirectory, response)) return;
      }
      return sendJson(response, 404, { error: { code: "NOT_FOUND", message: "Route not found" } }, securityHeaders());
    } catch (error) {
      const appError = error instanceof AppError
        ? error
        : new AppError("INTERNAL_ERROR", "An internal error occurred", 500);
      const headers = {
        ...securityHeaders(),
        ...(appError.retryAfterMs ? { "retry-after": String(Math.ceil(appError.retryAfterMs / 1000)) } : {}),
      };
      return sendJson(response, appError.status, {
        error: {
          code: appError.code,
          message: appError.message,
          ...(appError.details ? { details: appError.details } : {}),
        },
      }, headers);
    }
  });
}
