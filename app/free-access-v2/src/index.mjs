import { readFileSync } from "node:fs";
import { isIP } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createAppServer, isLoopbackAddress } from "./api/server.mjs";
import { SignedQuotaTokens } from "./auth/quota-token.mjs";
import { SystemClock } from "./clock.mjs";
import { MockPSCExecutor } from "./executor/mock-psc.mjs";
import { policyFromEnvironment } from "./policy.mjs";
import { FreeAccessService } from "./service/free-access-service.mjs";
import { SqliteFreeAccessStore } from "./storage/sqlite-store.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let store;
let service;
let server;
let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  service?.close();
  if (!server?.listening) {
    store?.close();
    process.exitCode = exitCode;
    return;
  }
  server.close(() => {
    store?.close();
    process.exitCode = exitCode;
  });
  server.closeAllConnections?.();
}

try {
  const clock = new SystemClock();
  const policy = policyFromEnvironment();
  if (process.env.PSC_LOCAL_SYNTHETIC !== undefined && !["0", "1"].includes(process.env.PSC_LOCAL_SYNTHETIC)) throw new TypeError("Invalid synthetic-mode configuration");
  const localSynthetic = process.env.PSC_LOCAL_SYNTHETIC === "1";
  if (localSynthetic && process.env.NODE_ENV === "production") throw new TypeError("Synthetic mode is prohibited in production");
  const bindHost = process.env.BIND_HOST ?? "127.0.0.1";
  if (!isIP(bindHost) || !isLoopbackAddress(bindHost)) throw new TypeError("Only a loopback bind address is admitted");
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isSafeInteger(port) || port < 0 || port > 65535) throw new TypeError("Invalid port configuration");
  const keyId = process.env.PSC_QUOTA_KEY_ID ?? "primary";
  let verificationKeys = {};
  if (process.env.PSC_QUOTA_VERIFY_KEYS_JSON) {
    verificationKeys = JSON.parse(process.env.PSC_QUOTA_VERIFY_KEYS_JSON);
    if (!verificationKeys || typeof verificationKeys !== "object" || Array.isArray(verificationKeys)) throw new TypeError("Invalid verification-key configuration");
  }
  const quotaTokens = new SignedQuotaTokens({
    keys: { ...verificationKeys, [keyId]: process.env.PSC_QUOTA_SECRET },
    keyId,
    clock,
  });
  let tlsOptions;
  if (process.env.PSC_TLS_KEY_FILE || process.env.PSC_TLS_CERT_FILE) {
    if (!process.env.PSC_TLS_KEY_FILE || !process.env.PSC_TLS_CERT_FILE) throw new TypeError("Both TLS fixtures are required");
    tlsOptions = {
      key: readFileSync(process.env.PSC_TLS_KEY_FILE),
      cert: readFileSync(process.env.PSC_TLS_CERT_FILE),
      minVersion: "TLSv1.2",
    };
  }
  if (!localSynthetic && !tlsOptions) throw new TypeError("Actual TLS is required outside explicit local synthetic mode");
  store = new SqliteFreeAccessStore({
    filename: process.env.PSC_DATABASE ?? resolve(root, ".data/free-access-v2.sqlite"),
  });
  const executor = new MockPSCExecutor({ clock });
  service = new FreeAccessService({ store, executor, policy, clock, quotaTokens });
  server = createAppServer({
    service, policy, quotaTokens, publicDirectory: resolve(root, "public"), localSynthetic, tlsOptions,
  });
  server.on("error", () => {
    process.stderr.write(JSON.stringify({ event: "free_access_start_failed", code: "LISTENER_FAILURE" }) + "\n");
    shutdown(1);
  });
  server.listen(port, bindHost, () => {
    process.stdout.write(JSON.stringify({
      event: "free_access_started",
      implementation: "free-access-v2",
      executor: "deterministic-mock",
      mode: localSynthetic ? "local-synthetic" : "encrypted-mock",
      port: server.address().port,
      livePscExecutions: executor.metrics.livePscExecutions,
    }) + "\n");
  });
  process.once("SIGINT", () => shutdown());
  process.once("SIGTERM", () => shutdown());
} catch {
  process.stderr.write(JSON.stringify({ event: "free_access_start_failed", code: "CONFIGURATION_REJECTED" }) + "\n");
  shutdown(1);
}
