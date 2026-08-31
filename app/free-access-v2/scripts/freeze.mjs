// Reuses v1's SHA-256 gate, but admits only source-bound complete PRE.
// Never commits, rewrites history, publishes, deploys, or runs POST.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { sourceSnapshot, externalDirectory, sha256, tapTotals, verifyBrowserEvidence } from "./evidence.mjs";

const args = process.argv.slice(2);
function option(name) { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; }
const preDirectory = externalDirectory(option("--pre"));
const output = externalDirectory(option("--out"));
const source = sourceSnapshot();
const preBytes = readFileSync(resolve(preDirectory, "qualification.json"));
const pre = JSON.parse(preBytes.toString("utf8"));
const tapBytes = readFileSync(resolve(preDirectory, "test-results.tap"));
const counts = tapTotals(tapBytes.toString("utf8"));
const preSource = JSON.parse(readFileSync(resolve(preDirectory, "source-manifest.json"), "utf8"));
if (pre.phase !== "PRE" || pre.verdict !== "PASS" || !counts.complete
    || !pre.sourceUnchangedDuringQualification || pre.sourceCommit !== source.sourceCommit
    || pre.sourceTree !== source.sourceTree || pre.buildId !== source.buildId
    || pre.testResultsSha256 !== sha256(tapBytes) || preSource.buildId !== source.buildId
    || JSON.stringify(preSource.files) !== JSON.stringify(source.files)
    || JSON.stringify(pre.tests) !== JSON.stringify(counts)) throw new Error("PRE does not admit these exact source bytes");
const browserPath = option("--browser-evidence");
if (!browserPath) throw new Error("Original browser evidence with observation artifacts is required");
const browser = verifyBrowserEvidence(resolve(browserPath), source, "PRE");
if (browser.sha256 !== pre.browserEvidenceSha256) throw new Error("Browser PRE identity differs");
mkdirSync(output, { recursive: true });
if (existsSync(resolve(output, "freeze-admission.json"))) throw new Error("Freeze admission is write-once");
const admission = {
  schemaVersion: "free-access-v2-freeze-admission/v1", verdict: "PASS", successorName: source.name,
  implementationVersion: source.version, architecture: source.architecture, parentCommit: source.parentCommit,
  contractFreezeCommit: source.contractFreezeCommit, candidateCommit: source.sourceCommit,
  candidateTree: source.sourceTree, buildId: source.buildId, preQualificationSha256: sha256(preBytes),
  preTestsSha256: sha256(tapBytes), browserEvidenceSha256: browser.sha256,
  nextStep: "Create immutable freeze commit without changing source tree, then independent clean detached POST before publication",
  integrationStatus: "STOPPED_BEFORE_PSC_CORE_INTEGRATION",
};
writeFileSync(resolve(output, "freeze-admission.json"), `${JSON.stringify(admission, null, 2)}\n`);
writeFileSync(resolve(output, "FROZEN-SOURCE-MANIFEST.sha256"), source.files.map((file) => `${file.sha256}  ${file.path}\n`).join(""));
console.log(JSON.stringify(admission));
