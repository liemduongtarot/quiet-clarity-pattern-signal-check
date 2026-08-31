import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { extname, resolve, sep } from "node:path";
import { AppError, ResponseNotIssuedError, ValidationError, publicError } from "../errors.mjs";
import { quotaTokenFromRequest } from "../auth/quota-token.mjs";
import { assertClientEvent } from "../analytics/counters.mjs";

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

function securityHeaders() {
  return {
    "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    "cross-origin-opener-policy": "same-origin",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "cache-control": "no-store",
  };
}

function responseUsable(response) {
  return !response.destroyed && !response.writableEnded && !response.req?.aborted && !response.socket?.destroyed;
}

function sendJson(response, status, body, headers = {}) {
  // Serialization precedes response issuance. Never acknowledge DOM delivery.
  const payload = JSON.stringify(body);
  if (!responseUsable(response)) throw new ResponseNotIssuedError();
  response.writeHead(status, {
    ...securityHeaders(),
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    ...headers,
  });
  response.end(payload);
  return true;
}

async function readJson(request, maximumBytes) {
  if (typeof request.headers["content-type"] !== "string" || !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers["content-type"])
    || request.headers["content-encoding"] !== undefined) throw new AppError("MEDIA_TYPE_REJECTED");
  if (request.headers["content-length"] !== undefined && Number(request.headers["content-length"]) > maximumBytes) throw new ValidationError();
  const chunks = [];
  let size = 0;
  try {
    for await (const chunk of request) {
      size += chunk.length;
      if (size > maximumBytes) throw new ValidationError();
      chunks.push(chunk);
    }
    if (!chunks.length) return {};
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch { throw new ValidationError(); }
}

function exactKeys(value, required, optional = []) {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || required.some((key) => !Object.hasOwn(value, key))
    || Object.keys(value).some((key) => !required.includes(key) && !optional.includes(key))) throw new ValidationError();
}

export function isLoopbackAddress(value) {
  if (typeof value !== "string") return false;
  const host = value.toLowerCase().replace(/^\[|\]$/g, "").replace(/^::ffff:/, "");
  if (host === "::1" || host === "localhost") return true;
  const octets = host.split(".");
  return octets.length === 4 && octets[0] === "127" && octets.every((octet) => /^\d{1,3}$/.test(octet) && Number(octet) <= 255);
}

function requestOrigin(request, localSynthetic) {
  const secure = request.socket.encrypted === true;
  if (!secure && !localSynthetic) throw new AppError("TRANSPORT_REQUIRED");
  const host = request.headers.host;
  if (typeof host !== "string" || !host || /[\s,\/\\@?#]/.test(host)) throw new AppError("ORIGIN_REJECTED");
  let origin;
  try { origin = new URL((secure ? "https://" : "http://") + host); } catch { throw new AppError("ORIGIN_REJECTED"); }
  if (localSynthetic && (!isLoopbackAddress(origin.hostname) || !isLoopbackAddress(request.socket.remoteAddress))) throw new AppError("TRANSPORT_REQUIRED");
  return origin.origin;
}

function requireSameOrigin(request, origin) {
  if (request.headers.origin !== origin
    || (request.headers["sec-fetch-site"] !== undefined && !["same-origin", "none"].includes(request.headers["sec-fetch-site"]))) throw new AppError("ORIGIN_REJECTED");
}

function serveStatic(requestPath, publicDirectory, response) {
  // Only committed public assets are served; never use input/result to construct a path.
  if (!["/", "/index.html", "/styles.css", "/app.js"].includes(requestPath)) return false;
  const relative = requestPath === "/" ? "index.html" : requestPath.slice(1);
  const candidate = resolve(publicDirectory, relative);
  const root = resolve(publicDirectory);
  if (candidate !== root && !candidate.startsWith(root + sep)) return false;
  if (!existsSync(candidate) || !statSync(candidate).isFile()) return false;
  response.writeHead(200, { ...securityHeaders(), "content-type": CONTENT_TYPES[extname(candidate)] });
  const stream = createReadStream(candidate);
  stream.on("error", () => response.destroy());
  stream.pipe(response);
  return true;
}

export function createAppServer({
  service, policy, quotaTokens, publicDirectory, localSynthetic = false, tlsOptions,
}) {
  if (localSynthetic && process.env.NODE_ENV === "production") throw new TypeError("Synthetic HTTP mode is prohibited in production");
  if (typeof localSynthetic !== "boolean") throw new TypeError("Synthetic mode requires an explicit boolean");
  if (!service || !policy || !quotaTokens || !publicDirectory) throw new TypeError("Server dependencies are required");

  const handler = async (request, response) => {
    // No access logger, request logger, body logger, token logger or raw-error logger.
    response.on("error", () => {});
    try {
      const origin = requestOrigin(request, localSynthetic);
      if (typeof request.url !== "string" || !request.url.startsWith("/") || request.url.startsWith("//")
        || /[?\\#]/.test(request.url)) throw new ValidationError();
      const path = request.url;
      if (request.headers.authorization !== undefined || request.headers["idempotency-key"] !== undefined) throw new ValidationError();
      if (request.method === "POST") requireSameOrigin(request, origin);

      if (request.method === "GET" && path === "/health") {
        return sendJson(response, 200, {
          status: "ok", executor: "deterministic-mock", implementation: "free-access-v2",
          livePscExecutions: service.executorMetrics.livePscExecutions,
          mode: localSynthetic ? "local-synthetic" : "encrypted-mock",
        });
      }
      if (request.method === "GET" && path === "/api/quota") {
        const token = quotaTokenFromRequest(request, { localSynthetic });
        return sendJson(response, 200, { quota: service.quota(token) });
      }
      if (request.method === "POST" && path === "/api/executions") {
        const body = await readJson(request, policy.maxRequestBytes);
        exactKeys(body, []);
        // A malformed quota token fails closed even before capability allocation.
        service.quota(quotaTokenFromRequest(request, { localSynthetic }));
        return sendJson(response, 201, service.issueExecution());
      }
      if (request.method === "POST" && path === "/api/readings") {
        const body = await readJson(request, policy.maxRequestBytes);
        exactKeys(body, ["receipt", "request"]);
        exactKeys(body.request, ["prompt"], ["context"]);
        if (body.request.context !== undefined && (!body.request.context || typeof body.request.context !== "object" || Array.isArray(body.request.context))) throw new ValidationError();
        const currentToken = quotaTokenFromRequest(request, { localSynthetic });
        await service.createReading({
          receipt: body.receipt,
          quotaToken: currentToken,
          request: body.request,
          issueResponse(outcome, token) {
            const headers = { "idempotency-replayed": String(outcome.replayed) };
            if (token && token !== currentToken) headers["set-cookie"] = quotaTokens.cookie(token, { localSynthetic });
            return sendJson(response, outcome.replayed ? 200 : 201, outcome, headers);
          },
        });
        return;
      }
      if (request.method === "POST" && path === "/api/metrics") {
        // Credential omission is part of the boundary, not merely a browser convention.
        if (request.headers.cookie !== undefined) throw new ValidationError();
        const body = await readJson(request, policy.maxRequestBytes);
        exactKeys(body, ["event"]);
        try { assertClientEvent(body.event); } catch { throw new ValidationError(); }
        service.recordClientEvent(body.event);
        return sendJson(response, 202, { accepted: true });
      }
      if (request.method === "GET" && path === "/favicon.ico") {
        response.writeHead(204, securityHeaders());
        response.end();
        return;
      }
      if (request.method === "GET" && serveStatic(path, publicDirectory, response)) return;
      throw new AppError("NOT_FOUND");
    } catch (error) {
      if (!responseUsable(response) || response.headersSent) {
        if (!response.destroyed && !response.writableEnded) response.destroy();
        return;
      }
      const safe = publicError(error);
      try {
        sendJson(response, safe.status, { error: safe.error }, safe.retryAfterMs ? { "retry-after": String(Math.ceil(safe.retryAfterMs / 1000)) } : {});
      } catch { response.destroy(); }
    }
  };

  const server = tlsOptions ? createHttpsServer(tlsOptions, handler) : createServer(handler);
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.keepAliveTimeout = 5000;
  server.maxRequestsPerSocket = 100;
  server.on("clientError", (_error, socket) => {
    if (socket.writable) socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\nCache-Control: no-store\r\nContent-Length: 0\r\n\r\n");
  });
  return server;
}
