import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(appRoot, "../..");

function filesUnder(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    if (name === "qualification" || name === ".data") return [];
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function git(...args) {
  const result = spawnSync("git", args, { cwd: repositoryRoot, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

function mainRef() {
  const local = spawnSync("git", ["rev-parse", "--verify", "main"], { cwd: repositoryRoot });
  return local.status === 0 ? "main" : "origin/main";
}

test("I01 — application imports stay inside the isolated app and Node built-ins", () => {
  const sourceFiles = filesUnder(resolve(appRoot, "src")).filter((path) => path.endsWith(".mjs"));
  for (const path of sourceFiles) {
    const source = readFileSync(path, "utf8");
    const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);
    for (const specifier of imports) {
      assert.ok(
        specifier.startsWith("node:") || specifier.startsWith("./") || specifier.startsWith("../"),
        `${relative(appRoot, path)} imports external package ${specifier}`,
      );
      if (specifier.startsWith(".")) {
        const target = resolve(dirname(path), specifier);
        assert.ok(target.startsWith(`${appRoot}\\`) || target.startsWith(`${appRoot}/`), `${path} escapes app root`);
      }
    }
    assert.doesNotMatch(source, /PSC_V8_|QCSemanticCore|executeH2|holdout/i);
  }
});

test("I02 — main package bytes are unchanged", () => {
  const result = spawnSync("git", ["diff", "--quiet", mainRef(), "--", "package.json"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || "root package.json differs from main");
});

test("I03 — branch changes are restricted to the Track B boundary", () => {
  const committed = git("diff", "--name-only", `${mainRef()}...HEAD`).split(/\r?\n/).filter(Boolean);
  const untracked = git("ls-files", "--others", "--exclude-standard").split(/\r?\n/).filter(Boolean);
  const changed = new Set([...committed, ...untracked]);
  assert.ok(changed.size > 0);
  for (const path of changed) {
    assert.ok(
      path.startsWith("app/free-access-v1/") || path === ".github/workflows/free-access-v1.yml",
      `out-of-boundary change: ${path}`,
    );
  }
});
