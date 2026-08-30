import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ManualClock } from "../src/clock.mjs";
import { ExecutionError } from "../src/errors.mjs";
import { MockPSCExecutor } from "../src/executor/mock-psc.mjs";
import { createPolicy } from "../src/policy.mjs";
import { FreeAccessService } from "../src/service/free-access-service.mjs";
import { SqliteFreeAccessStore } from "../src/storage/sqlite-store.mjs";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(appRoot, "../..");
const qualificationDirectory = resolve(appRoot, "qualification");
mkdirSync(qualificationDirectory, { recursive: true });

function git(args, { allowFailure = false } = {}) {
  const result = spawnSync("git", args, { cwd: repositoryRoot, encoding: "utf8" });
  if (!allowFailure && result.status !== 0) throw new Error(result.stderr || `git ${args.join(" ")} failed`);
  return result;
}

function resolveMainRef() {
  return git(["rev-parse", "--verify", "main"], { allowFailure: true }).status === 0 ? "main" : "origin/main";
}

function changedPaths(mainRef) {
  const committed = git(["diff", "--name-only", `${mainRef}...HEAD`]).stdout.split(/\r?\n/).filter(Boolean);
  const untracked = git(["ls-files", "--others", "--exclude-standard"]).stdout.split(/\r?\n/).filter(Boolean);
  return [...new Set([...committed, ...untracked])].sort();
}

const testFiles = readdirSync(resolve(appRoot, "tests"))
  .filter((name) => name.endsWith(".test.mjs"))
  .sort()
  .map((name) => `tests/${name}`);
const testRun = spawnSync(process.execPath, ["--test", "--test-reporter=tap", ...testFiles], {
  cwd: appRoot,
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});
const testOutput = `${testRun.stdout}${testRun.stderr}`;
writeFileSync(resolve(qualificationDirectory, "test-results.txt"), testOutput);
process.stdout.write(testOutput);
if (testRun.status !== 0) {
  console.error("Qualification tests failed; no freeze package was produced.");
  process.exit(testRun.status ?? 1);
}

const observedTests = Number(/# tests (\d+)/.exec(testOutput)?.[1] ?? 0);
if (observedTests !== 33) throw new Error(`Expected 33 qualification tests, observed ${observedTests}`);

const identity = { userId: "qualification-user", email: "qualification@example.test", emailVerified: true };
const policy = createPolicy();
const clock = new ManualClock();
const store = new SqliteFreeAccessStore();
const executor = new MockPSCExecutor({ clock });
const service = new FreeAccessService({ store, executor, policy, clock });
for (let index = 1; index <= policy.maxSuccessfulResults; index += 1) {
  await service.createReading({
    identity,
    idempotencyKey: `qualification-success-${index}`,
    request: { prompt: `Qualification success ${index}`, context: { index } },
  });
}
let fifthBlockedBeforeInference = false;
try {
  await service.createReading({
    identity,
    idempotencyKey: "qualification-fifth",
    request: { prompt: "Qualification fifth attempt", context: {} },
  });
} catch (error) {
  fifthBlockedBeforeInference = error.code === "QUOTA_EXHAUSTED";
}
const quotaProof = service.quota(identity);
const executionProof = executor.metrics;
store.close();

const failureStore = new SqliteFreeAccessStore();
const failureExecutor = new MockPSCExecutor({ clock, behavior: () => new ExecutionError("qualification failure") });
const failureService = new FreeAccessService({ store: failureStore, executor: failureExecutor, policy, clock });
try {
  await failureService.createReading({
    identity: { ...identity, userId: "qualification-failure-user" },
    idempotencyKey: "qualification-failure",
    request: { prompt: "Controlled system failure", context: {} },
  });
} catch (error) {
  if (error.code !== "EXECUTION_FAILED") throw error;
}
const failureQuota = failureService.quota({ ...identity, userId: "qualification-failure-user" });
failureStore.close();

const mainRef = resolveMainRef();
const paths = changedPaths(mainRef);
const outOfBoundary = paths.filter(
  (path) => !path.startsWith("app/free-access-v1/") && path !== ".github/workflows/free-access-v1.yml",
);
const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).stdout.trim();
const mainHash = git(["rev-parse", mainRef]).stdout.trim();
const headHash = git(["rev-parse", "HEAD"]).stdout.trim();
const rootPackageChanged = git(["diff", "--quiet", mainRef, "--", "package.json"], { allowFailure: true }).status !== 0;

const proof = {
  successfulUsesObserved: quotaProof.successfulUses,
  successfulUsesLimit: policy.maxSuccessfulResults,
  fifthBlockedBeforeInference,
  mockExecutions: executionProof.mockExecutions,
  livePscExecutions: executionProof.livePscExecutions,
  systemFailureSuccessfulUses: failureQuota.successfulUses,
  systemFailureReservedUses: failureQuota.reservedUses,
  mainChanged: rootPackageChanged ? 1 : 0,
  trackAGovernedFilesChanged: outOfBoundary.length,
};
const pass = branch === "app/psc-free-access-v1"
  && observedTests === 33
  && proof.successfulUsesObserved === policy.maxSuccessfulResults
  && proof.fifthBlockedBeforeInference
  && proof.mockExecutions === policy.maxSuccessfulResults
  && proof.livePscExecutions === 0
  && proof.systemFailureSuccessfulUses === 0
  && proof.systemFailureReservedUses === 0
  && proof.mainChanged === 0
  && proof.trackAGovernedFilesChanged === 0;

const qualification = {
  schemaVersion: "free-access-v1-qualification/v1",
  verdict: pass ? "PASS" : "FAIL",
  generatedAt: new Date().toISOString(),
  branch,
  headHash,
  mainRef,
  mainHash,
  policy: {
    maxSuccessfulResults: policy.maxSuccessfulResults,
    cycleDurationMs: policy.cycleDurationMs,
  },
  tests: {
    total: observedTests,
    canonical: 12,
    adversarial: 15,
    apiAndUi: 3,
    isolation: 3,
    passed: observedTests,
    failed: 0,
  },
  proof,
  changedPaths: paths,
  protectedPathsChanged: outOfBoundary,
  executorBoundary: "deterministic-mock-only",
  integrationStatus: "STOPPED_BEFORE_PSC_CORE_INTEGRATION",
};
writeFileSync(resolve(qualificationDirectory, "qualification.json"), `${JSON.stringify(qualification, null, 2)}\n`);

const report = `# Free Access v1 qualification report

Verdict: **${qualification.verdict}**

- Branch: \`${branch}\`
- Base: \`${mainRef}\` at \`${mainHash}\`
- Tests: ${observedTests} passed, 0 failed (12 canonical; 15 adversarial; 3 API/UI; 3 isolation)
- Maximum successful uses observed in one active cycle: ${proof.successfulUsesObserved}/${proof.successfulUsesLimit}
- Fifth attempt blocked before inference: ${proof.fifthBlockedBeforeInference}
- System-failure uses consumed: ${proof.systemFailureSuccessfulUses}
- System-failure reservations remaining: ${proof.systemFailureReservedUses}
- Mock executions in limit proof: ${proof.mockExecutions}
- Live PSC executions: ${proof.livePscExecutions}
- Track A governed files changed: ${proof.trackAGovernedFilesChanged}
- Main changed: ${proof.mainChanged}
- Integration state: **STOPPED BEFORE PSC-CORE INTEGRATION**

The qualified lifecycle is \`reserve → execute mock → validate → persist → commit\`. Reading history and reopen use the persisted result and never execute inference.
`;
writeFileSync(resolve(qualificationDirectory, "QUALIFICATION_REPORT.md"), report);

if (!pass) {
  console.error(JSON.stringify(qualification, null, 2));
  process.exit(1);
}

const freeze = spawnSync(process.execPath, ["scripts/freeze.mjs"], {
  cwd: appRoot,
  encoding: "utf8",
  stdio: "inherit",
});
if (freeze.status !== 0) process.exit(freeze.status ?? 1);
console.log(`Free Access v1 qualification PASS (${observedTests} tests).`);
