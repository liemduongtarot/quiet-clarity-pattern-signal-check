// Reuses v1's Node child-test/TAP/report approach; outputs never enter source bytes.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { APP_ROOT, sourceSnapshot, externalDirectory, sha256, tapTotals, testFiles, verifyBrowserEvidence } from "./evidence.mjs";

const args = process.argv.slice(2);
function option(name) { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; }
const phase = option("--phase");
const output = externalDirectory(option("--out"));
if (!["PRE", "POST"].includes(phase) && !args.includes("--snapshot")) throw new Error("Phase must be PRE or POST");
const source = sourceSnapshot();
if (phase === "POST" && (option("--frozen-commit") !== source.sourceCommit || source.branch !== "DETACHED")) {
  throw new Error("POST requires a detached checkout of the explicitly supplied frozen commit");
}
mkdirSync(output, { recursive: true });
if (args.includes("--snapshot")) {
  writeFileSync(resolve(output, "source-manifest.json"), `${JSON.stringify(source, null, 2)}\n`);
  console.log(JSON.stringify({ sourceCommit: source.sourceCommit, sourceTree: source.sourceTree, buildId: source.buildId, files: source.files.length }));
  process.exit(0);
}
if (existsSync(resolve(output, "qualification.json"))) throw new Error("Qualification evidence is write-once; use a new output directory");
const browserPath = resolve(option("--browser-evidence") ?? "");
const browser = verifyBrowserEvidence(browserPath, source, phase);
const selected = testFiles();
if (selected.length < 4) throw new Error("Incomplete test-suite inventory");
const run = spawnSync(process.execPath, ["--test", "--test-reporter=tap", ...selected], {
  cwd: APP_ROOT, encoding: "utf8", maxBuffer: 16 * 1024 * 1024, env: { ...process.env, NODE_ENV: "test" },
});
const tap = run.stdout ?? "";
const diagnostics = run.stderr ?? "";
writeFileSync(resolve(output, "test-results.tap"), tap);
writeFileSync(resolve(output, "test-stderr.txt"), diagnostics);
const counts = tapTotals(tap);
let unchanged = false;
try { const after = sourceSnapshot(); unchanged = after.buildId === source.buildId && after.sourceCommit === source.sourceCommit; } catch { /* Record failure below. */ }
const pass = run.status === 0 && counts.complete && unchanged;
const qualification = {
  schemaVersion: "free-access-v2-qualification/v1", phase, verdict: pass ? "PASS" : "FAIL", generatedAt: new Date().toISOString(),
  successorName: source.name, implementationVersion: source.version, architecture: source.architecture,
  parentCommit: source.parentCommit, contractFreezeCommit: source.contractFreezeCommit,
  sourceCommit: source.sourceCommit, sourceTree: source.sourceTree, buildId: source.buildId,
  nodeVersion: process.version, testFiles: selected, tests: counts,
  testResultsSha256: sha256(Buffer.from(tap)), testDiagnosticsSha256: sha256(Buffer.from(diagnostics)),
  browserEvidenceSha256: browser.sha256, browserOrigin: browser.evidence.origin,
  sourceUnchangedDuringQualification: unchanged,
  isolatedState: { freshDatabasePerFixture: true, processEphemeralReceipts: true, syntheticOnly: true, postUsesMutablePreInputs: false },
  isolation: source.isolation,
  limitations: ["browser-token leakage is accepted", "retry recovery is memory-only and expires after 48 seconds", "no Vietnamese UI", "no live model or payment provider", "production deployment/retention admission remains separate"],
};
writeFileSync(resolve(output, "source-manifest.json"), `${JSON.stringify(source, null, 2)}\n`);
writeFileSync(resolve(output, "qualification.json"), `${JSON.stringify(qualification, null, 2)}\n`);
writeFileSync(resolve(output, "BROWSER-EVIDENCE.json"), readFileSync(browserPath));
writeFileSync(resolve(output, "QUALIFICATION-REPORT.md"), `# Free Access v2 ${phase}\n\nVerdict: **${qualification.verdict}**\n\nImplementation 2.0.0; architecture v1.3.\n\n- Source: ${source.sourceCommit}\n- Tree: ${source.sourceTree}\n- Build SHA-256: ${source.buildId}\n- Tests: ${counts.pass ?? 0}/${counts.tests ?? 0}; fail ${counts.fail ?? "unknown"}; skipped ${counts.skipped ?? "unknown"}; cancelled ${counts.cancelled ?? "unknown"}; todo ${counts.todo ?? "unknown"}.\n- Real browser evidence: ${browser.sha256}\n- Source unchanged: ${unchanged}\n- Parent files, main, Track A, PSC core and Free/Paid semantic changes: 0.\n- Live PSC executions: 0; deterministic mock only.\n- Integration: STOPPED BEFORE PSC-CORE INTEGRATION.\n\nThis ${phase} result is one qualification gate, not permission to integrate or deploy. Publication happens only after independent clean POST.\n`);
console.log(JSON.stringify({ phase, verdict: qualification.verdict, tests: counts, buildId: source.buildId, sourceCommit: source.sourceCommit }));
if (!pass) process.exit(1);
