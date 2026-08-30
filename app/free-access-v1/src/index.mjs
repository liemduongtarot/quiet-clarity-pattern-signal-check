import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createAppServer } from "./api/server.mjs";
import { assertAuthSecret } from "./auth/identity.mjs";
import { SystemClock } from "./clock.mjs";
import { MockPSCExecutor } from "./executor/mock-psc.mjs";
import { policyFromEnvironment } from "./policy.mjs";
import { FreeAccessService } from "./service/free-access-service.mjs";
import { SqliteFreeAccessStore } from "./storage/sqlite-store.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clock = new SystemClock();
const policy = policyFromEnvironment();
const developmentIdentityIssuer = process.env.FREE_ACCESS_DEV_AUTH === "1";
const authSecret = process.env.FREE_ACCESS_AUTH_SECRET
  ?? (developmentIdentityIssuer ? "free-access-local-development-secret-change-me" : "");
assertAuthSecret(authSecret);

const store = new SqliteFreeAccessStore({
  filename: process.env.FREE_ACCESS_DATABASE ?? resolve(root, ".data/free-access.sqlite"),
});
const executor = new MockPSCExecutor({ clock });
const service = new FreeAccessService({ store, executor, policy, clock });
const recovered = service.recoverStaleReservations();

const server = createAppServer({
  service,
  policy,
  authSecret,
  publicDirectory: resolve(root, "public"),
  developmentIdentityIssuer,
  clock,
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, "127.0.0.1", () => {
  console.log(JSON.stringify({
    event: "free_access_started",
    url: `http://127.0.0.1:${port}`,
    executor: "deterministic-mock",
    recoveredStaleReservations: recovered,
    livePscExecutions: executor.metrics.livePscExecutions,
  }));
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(() => {
    store.close();
    process.exit(0);
  });
  server.closeAllConnections?.();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
