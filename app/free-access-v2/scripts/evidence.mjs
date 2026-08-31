import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync, statSync, realpathSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const REPO_ROOT = resolve(APP_ROOT, "../..");
export const APP_PREFIX = "app/free-access-v2/";
export const PARENT_COMMIT = "f53035341a12834170be8afdd1b4ed6481085ed4";
export const CONTRACT_COMMIT = "68bc66eb14016520ac140041ee221b0d96aea424";
export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function gitBytes(...args) {
  const result = spawnSync("git", args, { cwd: REPO_ROOT, maxBuffer: 32 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`Git evidence read failed: ${args[0]}`);
  return result.stdout;
}
export const git = (...args) => gitBytes(...args).toString("utf8").trim();

function canonicalPath(path) {
  let ancestor = resolve(path);
  const suffix = [];
  while (!existsSync(ancestor)) {
    const parent = dirname(ancestor);
    if (parent === ancestor) throw new Error("Evidence path has no accessible ancestor");
    suffix.unshift(ancestor.slice(parent.length + (parent.endsWith(sep) ? 0 : 1)));
    ancestor = parent;
  }
  const canonical = resolve(realpathSync.native(ancestor), ...suffix);
  return process.platform === "win32" ? canonical.toLowerCase() : canonical;
}

export function externalDirectory(path) {
  if (!path) throw new Error("An external evidence directory is required");
  const absolute = resolve(path);
  const canonical = canonicalPath(absolute);
  const source = canonicalPath(REPO_ROOT);
  if (canonical === source || canonical.startsWith(`${source}${sep}`)) {
    throw new Error("Evidence must be outside the source worktree");
  }
  return absolute;
}

export function verifyContractManifest() {
  const directory = resolve(APP_ROOT, "contracts");
  const manifest = readFileSync(resolve(directory, "CONTRACT-MANIFEST.sha256"), "utf8");
  const listed = new Set();
  for (const line of manifest.trim().split("\n")) {
    const match = /^([a-f0-9]{64})  ([^/\\]+)$/.exec(line);
    if (!match || listed.has(match[2])) throw new Error("Invalid contract manifest");
    listed.add(match[2]);
    if (sha256(readFileSync(resolve(directory, match[2]))) !== match[1]) throw new Error("Frozen contract bytes differ");
  }
  const actual = readdirSync(directory).filter((name) => name !== "CONTRACT-MANIFEST.sha256");
  if (actual.length !== listed.size || actual.some((name) => !listed.has(name))) throw new Error("Contract file inventory differs");
  if (git("diff", "--name-only", CONTRACT_COMMIT, "HEAD", "--", `${APP_PREFIX}contracts`, `${APP_PREFIX}.gitattributes`)) {
    throw new Error("Contract changed after freeze");
  }
  return sha256(Buffer.from(manifest));
}

export function sourceSnapshot() {
  if (git("status", "--porcelain=v1", "--untracked-files=all")) throw new Error("Qualification requires a clean source worktree with all tests committed");
  git("merge-base", "--is-ancestor", PARENT_COMMIT, "HEAD");
  git("merge-base", "--is-ancestor", CONTRACT_COMMIT, "HEAD");
  const contractManifestSha256 = verifyContractManifest();
  const changed = git("diff", "--name-status", PARENT_COMMIT, "HEAD").split("\n").filter(Boolean);
  if (!changed.length || changed.some((line) => !line.startsWith(`A\t${APP_PREFIX}`))) throw new Error("Changes extend beyond separately added successor files");
  const baseline = JSON.parse(readFileSync(resolve(APP_ROOT, "contracts/LOCAL-REF-BASELINE.json"), "utf8"));
  const protectedRefs = baseline.refs.filter((item) => item.ref !== "refs/heads/codex/psc-free-access-browser-bounded-successor");
  for (const item of protectedRefs) if (git("rev-parse", item.ref) !== item.commit) throw new Error("A protected local ref changed");
  const parentInventory = JSON.parse(readFileSync(resolve(APP_ROOT, "contracts/PARENT-FILE-INVENTORY.json"), "utf8"));
  for (const file of parentInventory.files) {
    if (sha256(gitBytes("show", `HEAD:${file.path}`)) !== file.gitBlobSha256) throw new Error("Inherited parent file changed");
  }
  const preservedPaths = ["public/styles.css", "src/clock.mjs", "src/executor/contract.mjs", "src/executor/mock-psc.mjs"];
  const preserved = preservedPaths.map((path) => {
    const parent = gitBytes("show", `${PARENT_COMMIT}:app/free-access-v1/${path}`);
    const bytes = readFileSync(resolve(APP_ROOT, path));
    if (!parent.equals(bytes)) throw new Error("An exact-preserve component changed");
    return { path, sha256: sha256(bytes), byteIdenticalToParentBlob: true };
  });
  const names = gitBytes("ls-files", "-z", "--", "app/free-access-v2").toString("utf8").split("\0").filter(Boolean).sort();
  const files = names.map((path) => {
    const bytes = readFileSync(resolve(REPO_ROOT, path));
    if (!bytes.equals(gitBytes("show", `HEAD:${path}`))) throw new Error("Working bytes differ from frozen Git blobs");
    return { path: path.slice(APP_PREFIX.length), bytes: bytes.length, sha256: sha256(bytes) };
  });
  const buildManifest = files.map((file) => `${file.sha256}  ${file.path}\n`).join("");
  return {
    schemaVersion: "free-access-v2-source/v1", name: "Track B Free Access v2 — Browser-Bounded", version: "2.0.0",
    architecture: "v1.3 Browser-Bounded State Model", parentCommit: PARENT_COMMIT, contractFreezeCommit: CONTRACT_COMMIT,
    contractManifestSha256, sourceCommit: git("rev-parse", "HEAD"), sourceTree: git("rev-parse", "HEAD^{tree}"),
    branch: git("branch", "--show-current") || "DETACHED", buildId: sha256(Buffer.from(buildManifest)),
    files, preserved, parentTrackedFileCount: parentInventory.files.length,
    changedPaths: changed.map((line) => line.slice(2)), protectedRefs,
    isolation: { inheritedParentFilesChanged: 0, mainChanges: 0, trackAChangedFiles: 0, pscCoreChangedFiles: 0,
      freePaidSemanticChangedFiles: 0, livePscExecutions: 0, executorBoundary: "unchanged-deterministic-mock-only",
      integrationStatus: "STOPPED_BEFORE_PSC_CORE_INTEGRATION" },
  };
}

export const REQUIRED_BROWSER_CHECKS = Object.freeze([
  "no-account-entry", "fourth-result-and-exhaustion", "copy-success", "download-initiated", "bridge-separation",
  "refresh-clears-result", "two-tab-quota-lock", "english-and-unicode", "safe-text-rendering", "no-console-errors", "responsive-layout",
]);

export function verifyBrowserEvidence(path, source, phase) {
  const bytes = readFileSync(path);
  const evidence = JSON.parse(bytes.toString("utf8"));
  if (evidence.schemaVersion !== "free-access-v2-browser-evidence/v1" || evidence.phase !== phase
      || evidence.sourceBuildId !== source.buildId || evidence.sourceCommit !== source.sourceCommit
      || evidence.syntheticOnly !== true || evidence.livePscExecutions !== 0 || evidence.initialSuccessfulUses !== 0
      || evidence.initialCycleStartedAt !== null || evidence.realBrowser !== true) {
    throw new Error("Browser evidence is not bound to this phase and exact source");
  }
  if (!Array.isArray(evidence.checks) || evidence.checks.some((item) => !item || typeof item.id !== "string" || item.pass !== true)) {
    throw new Error("Every browser observation must pass");
  }
  const checks = new Map(evidence.checks.map((item) => [item.id, item]));
  if (checks.size !== evidence.checks.length) throw new Error("Duplicate browser observations are not accepted");
  for (const id of REQUIRED_BROWSER_CHECKS) {
    if (checks.get(id)?.pass !== true || typeof checks.get(id)?.evidence !== "string" || !checks.get(id).evidence.trim()) {
      throw new Error(`Missing passing browser observation: ${id}`);
    }
  }
  if (!Array.isArray(evidence.consoleErrors) || evidence.consoleErrors.length !== 0) throw new Error("Browser console errors remain");
  const origin = new URL(evidence.origin);
  if (!/^(localhost|127(?:\.\d{1,3}){3})$/.test(origin.hostname)) throw new Error("Browser evidence must be local synthetic only");
  const directory = dirname(resolve(path));
  if (!Array.isArray(evidence.artifacts) || evidence.artifacts.length < 3) throw new Error("Missing browser observation artifacts");
  const artifactPaths = new Set();
  for (const artifact of evidence.artifacts) {
    const file = resolve(directory, artifact.path);
    const canonical = canonicalPath(file);
    if (artifactPaths.has(canonical)) throw new Error("Duplicate browser artifacts are not accepted");
    artifactPaths.add(canonical);
    if (!canonical.startsWith(`${canonicalPath(directory)}${sep}`) || !existsSync(file) || !statSync(file).isFile()
        || sha256(readFileSync(file)) !== artifact.sha256) throw new Error("Browser artifact identity differs");
  }
  return { sha256: sha256(bytes), evidence };
}

export function tapTotals(text) {
  const counts = {};
  let duplicateSummary = false;
  for (const match of text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)) {
    if (Object.hasOwn(counts, match[1])) duplicateSummary = true;
    else counts[match[1]] = Number(match[2]);
  }
  const complete = !duplicateSummary && Object.keys(counts).length === 6
    && Number.isSafeInteger(counts.tests) && counts.tests > 0 && counts.pass === counts.tests
    && ["fail", "cancelled", "skipped", "todo"].every((key) => counts[key] === 0);
  return { ...counts, duplicateSummary, complete };
}

export function testFiles() {
  return readdirSync(resolve(APP_ROOT, "tests")).filter((name) => name.endsWith(".test.mjs")).sort().map((name) => `tests/${name}`);
}
