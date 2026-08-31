import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { APP_ROOT, REPOSITORY_ROOT, PARENT_COMMIT, CONTRACT_COMMIT } from "./helpers.mjs";
import { verifyContractManifest } from "../scripts/evidence.mjs";

function gitBytes(...args) {
  const result = spawnSync("git", args, { cwd: REPOSITORY_ROOT, maxBuffer: 16 * 1024 * 1024 });
  assert.equal(result.status, 0, `Git read failed: ${args[0]}`);
  return result.stdout;
}
function git(...args) { return gitBytes(...args).toString("utf8").trim(); }
function hash(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
function filesUnder(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

test("I01 — runtime imports remain inside the successor and Node built-ins, with no live provider", () => {
  for (const path of filesUnder(resolve(APP_ROOT, "src")).filter((name) => name.endsWith(".mjs"))) {
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(source, /\b(?:import\s*\(|require\s*\()/, "Runtime imports must remain statically inspectable");
    const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);
    for (const specifier of imports) {
      assert.ok(specifier.startsWith("node:") || specifier.startsWith("./") || specifier.startsWith("../"), `External import in ${relative(APP_ROOT, path)}`);
      if (specifier.startsWith(".")) {
        const target = resolve(dirname(path), specifier);
        assert.ok(target.startsWith(`${APP_ROOT}${sep}`), "Runtime import escapes successor");
        assert.equal(target.startsWith(`${resolve(APP_ROOT, "tests")}${sep}`), false, "Runtime imports qualification fixtures");
      }
    }
    assert.doesNotMatch(source, /PSC_V8_|QCSemanticCore|executeH2|holdout|\bfetch\s*\(|\bWebSocket\s*\(|child_process/);
    assert.doesNotMatch(source, /OPENAI_API_KEY|ANTHROPIC_API_KEY|STRIPE_SECRET_KEY|api\.openai\.com/);
  }
});

test("I02 — exact frozen parent and contract commits remain ancestors", () => {
  assert.equal(git("remote", "get-url", "origin"), "https://github.com/liemduongtarot/quiet-clarity-pattern-signal-check");
  git("merge-base", "--is-ancestor", PARENT_COMMIT, "HEAD");
  git("merge-base", "--is-ancestor", CONTRACT_COMMIT, "HEAD");
  assert.equal(git("rev-parse", `${PARENT_COMMIT}^{tree}`), "7cbc55eea7744d26b29632019487f6daabaf0e6b");
  assert.equal(git("rev-parse", `${PARENT_COMMIT}^`), "2493f7605d42b2ccf757e22e8ddb0b108a5e7600");
});

test("I03 — main, Track A and other protected local refs equal frozen baseline", () => {
  const baseline = JSON.parse(readFileSync(resolve(APP_ROOT, "contracts/LOCAL-REF-BASELINE.json"), "utf8"));
  for (const { ref, commit } of baseline.refs) {
    if (ref === "refs/heads/codex/psc-free-access-browser-bounded-successor") continue;
    assert.equal(git("rev-parse", ref), commit, `Protected ref changed: ${ref}`);
  }
  assert.equal(git("rev-parse", "refs/heads/main"), "9282f815e130736cd867449071c190147cd99a3a");
});

test("I04 — inherited blobs and working content preserve parent identity across checkout EOL conversion", () => {
  const inventory = JSON.parse(readFileSync(resolve(APP_ROOT, "contracts/PARENT-FILE-INVENTORY.json"), "utf8"));
  assert.equal(inventory.parentCommit, PARENT_COMMIT);
  assert.equal(inventory.files.length, 31);
  for (const file of inventory.files) {
    const parentBlob = gitBytes("show", `${PARENT_COMMIT}:${file.path}`);
    assert.equal(hash(parentBlob), file.gitBlobSha256, `Parent inventory mismatch: ${file.path}`);
    assert.equal(hash(gitBytes("show", `HEAD:${file.path}`)), file.gitBlobSha256, `Inherited parent changed: ${file.path}`);
    // Git's configured LF/CRLF checkout conversion can differ between worktrees.
    // The frozen parent worktree's raw-byte check is recorded separately by the release.
    const expectedGitBlob = git("rev-parse", `${PARENT_COMMIT}:${file.path}`);
    assert.equal(git("hash-object", `--path=${file.path}`, file.path), expectedGitBlob, `Inherited working content changed: ${file.path}`);
  }
});

test("I05 — committed and pending edits are confined to the separately added successor", () => {
  const committed = git("diff", "--name-status", PARENT_COMMIT, "HEAD").split(/\r?\n/).filter(Boolean);
  assert.ok(committed.length > 0);
  for (const line of committed) assert.ok(line.startsWith("A\tapp/free-access-v2/"), "An inherited/protected source was changed");
  const pending = [
    git("diff", "--name-only"), git("diff", "--cached", "--name-only"),
    git("ls-files", "--others", "--exclude-standard"),
  ].join("\n").split(/\r?\n/).filter(Boolean);
  for (const path of pending) assert.ok(path.startsWith("app/free-access-v2/"), `Out-of-boundary working change: ${path}`);
  // Formal PRE/POST additionally require sourceSnapshot()'s fully clean byte-bound gate.
});

test("I06 — CSS, clocks, mock executor and validator reuse exact frozen parent bytes", () => {
  for (const path of ["public/styles.css", "src/clock.mjs", "src/executor/mock-psc.mjs", "src/executor/contract.mjs"]) {
    assert.deepEqual(readFileSync(resolve(APP_ROOT, path)), gitBytes("show", `${PARENT_COMMIT}:app/free-access-v1/${path}`), `Exact-preserve component changed: ${path}`);
  }
});

test("I07 — contract manifest is intact and architecture and implementation versions remain distinct", () => {
  assert.match(verifyContractManifest(), /^[a-f0-9]{64}$/);
  const pkg = JSON.parse(readFileSync(resolve(APP_ROOT, "package.json"), "utf8"));
  assert.equal(pkg.name, "@psc/free-access-v2");
  assert.equal(pkg.version, "2.0.0");
  assert.equal(pkg.type, "module");
  assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0);
  const architecture = readFileSync(resolve(APP_ROOT, "contracts/00-AUTHORITY-AND-ARCHITECTURE-v1.3.md"), "utf8");
  assert.match(architecture, /v1\.3 Browser-Bounded State Model/);
  assert.match(architecture, /does not establish v1\.3 compliance/);
});

test("I08 — browser source introduces no persistent storage, fingerprint, replay SDK or raw URLs", () => {
  const app = readFileSync(resolve(APP_ROOT, "public/app.js"), "utf8");
  const html = readFileSync(resolve(APP_ROOT, "public/index.html"), "utf8");
  assert.doesNotMatch(app, /localStorage|sessionStorage|indexedDB|serviceWorker|caches\.|document\.cookie|navigator\.userAgent|hardwareConcurrency|deviceMemory|\.getContext\(|sendBeacon|history\.(?:pushState|replaceState)|location\.(?:search|hash)\s*=/);
  assert.doesNotMatch(app, /innerHTML|insertAdjacentHTML|console\.(?:log|warn|error)|https?:\/\//);
  assert.doesNotMatch(html, /<script[^>]+src="https?:|<iframe|type="(?:email|password)"/i);
  assert.doesNotMatch(app, /cycle_number|time_between_results|experiment_id|visitor_id/);
});

test("I09 — no new workflow or deployment surface is added by successor", () => {
  const changed = git("diff", "--name-only", PARENT_COMMIT, "HEAD").split(/\r?\n/).filter(Boolean);
  assert.equal(changed.some((path) => path.startsWith(".github/") || path.startsWith("validation/") || path.startsWith(".vercel/") || path.startsWith(".openai/")), false);
  const workflow = readFileSync(resolve(REPOSITORY_ROOT, ".github/workflows/free-access-v1.yml"), "utf8");
  assert.match(workflow, /branches: \[app\/psc-free-access-v1\]/);
  assert.doesNotMatch(workflow, /browser-bounded-successor|free-access-v2/);
});

test("I10 — original frozen-v1 worktree and qualification package retain exact audited disk bytes", () => {
  const worktreeBlock = git("worktree", "list", "--porcelain").split(/\r?\n\r?\n/)
    .find((block) => block.split(/\r?\n/).includes("branch refs/heads/app/psc-free-access-v1"));
  assert.ok(worktreeBlock, "Required original frozen worktree is unavailable");
  assert.ok(worktreeBlock.split(/\r?\n/).includes(`HEAD ${PARENT_COMMIT}`));
  const parentDirectory = worktreeBlock.split(/\r?\n/).find((line) => line.startsWith("worktree ")).slice("worktree ".length);
  const inventory = JSON.parse(readFileSync(resolve(APP_ROOT, "contracts/PARENT-FILE-INVENTORY.json"), "utf8"));
  for (const file of inventory.files) {
    const bytes = readFileSync(resolve(parentDirectory, file.path));
    assert.equal(bytes.length, file.frozenWorktreeBytes, `Frozen disk length changed: ${file.path}`);
    assert.equal(hash(bytes), file.frozenWorktreeSha256, `Frozen disk bytes changed: ${file.path}`);
  }
  const identity = JSON.parse(readFileSync(resolve(APP_ROOT, "contracts/PARENT-IDENTITY.json"), "utf8"));
  const packagePath = resolve(parentDirectory, "app/free-access-v1/qualification/free-access-v1-qualification.tgz");
  const bytes = readFileSync(packagePath);
  assert.equal(bytes.length, identity.qualificationBytes);
  assert.equal(hash(bytes), identity.qualificationSha256);
  assert.equal(readFileSync(`${packagePath}.sha256`, "utf8").trim().split(/\s+/)[0], identity.qualificationSha256);
});
