// TEST-ONLY adversarial gate fixtures. These JSON/text files are not browser evidence.
import assert from "node:assert/strict";
import { writeFileSync, symlinkSync, unlinkSync, lstatSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { APP_ROOT, REPO_ROOT, REQUIRED_BROWSER_CHECKS, externalDirectory, tapTotals, verifyBrowserEvidence, sha256 } from "../scripts/evidence.mjs";
import { temporaryDirectory } from "./helpers.mjs";

const SOURCE_FIXTURE = Object.freeze({ buildId: "TEST-ONLY-gate-build", sourceCommit: "TEST-ONLY-gate-commit" });
function browserGateFixture() {
  return {
    schemaVersion: "free-access-v2-browser-evidence/v1", phase: "PRE",
    sourceBuildId: SOURCE_FIXTURE.buildId, sourceCommit: SOURCE_FIXTURE.sourceCommit,
    syntheticOnly: true, livePscExecutions: 0, initialSuccessfulUses: 0, initialCycleStartedAt: null,
    realBrowser: true, checks: REQUIRED_BROWSER_CHECKS.map((id) => ({ id, pass: true, evidence: "TEST-ONLY gate-shape fixture; never a browser observation" })),
    consoleErrors: [], origin: "http://127.0.0.1:1", artifacts: [],
  };
}

function writeGateFixture(directory, fixture) {
  const path = resolve(directory, "TEST-ONLY-gate.json");
  writeFileSync(path, JSON.stringify(fixture));
  return path;
}

test("G01 / I01 — TAP completeness rejects duplicates, missing summaries and zero tests", () => {
  const good = "# tests 2\n# pass 2\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n";
  assert.equal(tapTotals(good).complete, true);
  const duplicate = tapTotals(`${good}# tests 2\n`);
  assert.equal(duplicate.complete, false);
  assert.equal(duplicate.duplicateSummary, true);
  assert.equal(tapTotals(good.replace("# pass 2\n", "")).complete, false);
  assert.equal(tapTotals(good.replace("# tests 2", "# tests 0").replace("# pass 2", "# pass 0")).complete, false);
});

test("G02 / I01 — failed, skipped, cancelled, todo or mismatched totals never qualify", () => {
  const good = "# tests 2\n# pass 2\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n";
  for (const key of ["fail", "cancelled", "skipped", "todo"]) {
    assert.equal(tapTotals(good.replace(`# ${key} 0`, `# ${key} 1`)).complete, false);
  }
  assert.equal(tapTotals(good.replace("# pass 2", "# pass 1")).complete, false);
});

test("G03 / I01 — evidence paths inside source reject including alternate Windows casing", () => {
  assert.throws(() => externalDirectory(REPO_ROOT), /outside the source/);
  assert.throws(() => externalDirectory(resolve(APP_ROOT, "not-yet-created", "evidence")), /outside the source/);
  const alias = process.platform === "win32" ? APP_ROOT.toLowerCase() : APP_ROOT;
  assert.throws(() => externalDirectory(resolve(alias, "not-yet-created")), /outside the source/);
});

test("G04 / I01 — a directory junction cannot disguise source as external output", (t) => {
  const directory = temporaryDirectory(t, "evidence-junction");
  const alias = resolve(directory, "source-alias");
  symlinkSync(REPO_ROOT, alias, process.platform === "win32" ? "junction" : "dir");
  try {
    assert.equal(lstatSync(alias).isSymbolicLink(), true);
    assert.throws(() => externalDirectory(resolve(alias, "not-yet-created")), /outside the source/);
  } finally { unlinkSync(alias); }
});

test("G05 / I01 — any failed extra browser observation defeats otherwise passing checks", (t) => {
  const directory = temporaryDirectory(t, "failed-browser-gate");
  const fixture = browserGateFixture();
  fixture.checks.push({ id: "extra-failed-observation", pass: false, evidence: "TEST-ONLY failure" });
  assert.throws(() => verifyBrowserEvidence(writeGateFixture(directory, fixture), SOURCE_FIXTURE, "PRE"), /Every browser observation must pass/);
});

test("G06 / I01 — duplicate browser IDs cannot mask or replace observations", (t) => {
  const directory = temporaryDirectory(t, "duplicate-browser-gate");
  const fixture = browserGateFixture();
  fixture.checks.push({ ...fixture.checks[0] });
  assert.throws(() => verifyBrowserEvidence(writeGateFixture(directory, fixture), SOURCE_FIXTURE, "PRE"), /Duplicate browser observations/);
});

test("G07 / I01 — browser evidence cannot cross phase, source or fresh-cookie boundary", (t) => {
  const directory = temporaryDirectory(t, "source-browser-gate");
  for (const override of [
    { phase: "POST" }, { sourceBuildId: "different" }, { sourceCommit: "different" },
    { realBrowser: false }, { initialSuccessfulUses: 1 }, { initialCycleStartedAt: "prior-cycle" }, { livePscExecutions: 1 },
  ]) {
    const fixture = { ...browserGateFixture(), ...override };
    assert.throws(() => verifyBrowserEvidence(writeGateFixture(directory, fixture), SOURCE_FIXTURE, "PRE"), /not bound/);
  }
});

test("G08 / I01 — repeated artifact paths cannot pretend to be independent evidence", (t) => {
  const directory = temporaryDirectory(t, "artifact-browser-gate");
  const content = Buffer.from("TEST-ONLY adversarial artifact identity fixture");
  writeFileSync(resolve(directory, "one.txt"), content);
  const fixture = browserGateFixture();
  fixture.artifacts = [
    { path: "one.txt", sha256: sha256(content) },
    { path: "./one.txt", sha256: sha256(content) },
    { path: "one.txt", sha256: sha256(content) },
  ];
  assert.throws(() => verifyBrowserEvidence(writeGateFixture(directory, fixture), SOURCE_FIXTURE, "PRE"), /Duplicate browser artifacts/);
});
