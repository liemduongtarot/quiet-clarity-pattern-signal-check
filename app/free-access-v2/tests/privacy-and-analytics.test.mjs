import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { ALL_COUNTERS, CLIENT_COUNTERS, COMMERCE_COUNTERS, PRODUCT_COUNTERS, assertClientEvent } from "../src/analytics/counters.mjs";
import { SqliteFreeAccessStore } from "../src/storage/sqlite-store.mjs";
import { AppError, publicError } from "../src/errors.mjs";
import { createHarness, temporaryDirectory } from "./helpers.mjs";

test("P01 / S01 — exact SQLite tables/columns cannot reconstruct a browser journey", () => {
  const store = new SqliteFreeAccessStore();
  try {
    const inventory = store.schemaInventory().map(({ name, columns }) => ({ name, columns: [...columns].sort() })).sort((a, b) => a.name.localeCompare(b.name));
    assert.deepEqual(inventory, [
      { name: "aggregate_counters", columns: ["counter", "value"] },
      { name: "schema_migrations", columns: ["applied_at", "version"] },
    ]);
  } finally { store.close(); }
});

test("P02 / S01 — a real legacy database is refused without migrating history", (t) => {
  const directory = temporaryDirectory(t, "legacy-refusal");
  const filename = resolve(directory, "legacy.sqlite");
  const legacy = new DatabaseSync(filename);
  legacy.exec("CREATE TABLE readings (id TEXT PRIMARY KEY, request_json TEXT, result_json TEXT)");
  legacy.prepare("INSERT INTO readings VALUES (?, ?, ?)").run("synthetic", "SYNTHETIC_LEGACY_INPUT", "SYNTHETIC_LEGACY_RESULT");
  legacy.close();
  assert.throws(() => new SqliteFreeAccessStore({ filename }));
  const after = new DatabaseSync(filename, { readOnly: true });
  try {
    assert.deepEqual(after.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map((row) => row.name), ["readings"]);
    assert.equal(after.prepare("SELECT request_json FROM readings").get().request_json, "SYNTHETIC_LEGACY_INPUT");
  } finally { after.close(); }
});

test("P03 / S01 — an extra linkage column in otherwise allowed database is refused", (t) => {
  const directory = temporaryDirectory(t, "column-refusal");
  const filename = resolve(directory, "extra-column.sqlite");
  const initialized = new SqliteFreeAccessStore({ filename });
  initialized.close();
  const altered = new DatabaseSync(filename);
  altered.exec("ALTER TABLE aggregate_counters ADD COLUMN browser_id TEXT");
  altered.close();
  assert.throws(() => new SqliteFreeAccessStore({ filename }));
});

test("P04 / S01 S04 — real SQLite and WAL never contain raw content, receipt or quota derivatives", async (t) => {
  const directory = temporaryDirectory(t, "database-canary");
  const filename = resolve(directory, "aggregate.sqlite");
  const store = new SqliteFreeAccessStore({ filename });
  const harness = createHarness({ store });
  const canary = "SYNTHETIC_RAW_CONTENT_CANARY_81de35a9";
  try {
    const receipt = harness.execution(1).receipt;
    const outcome = await harness.submit(1, { request: { prompt: canary, context: { note: canary } } });
    const token = harness.browser.token;
    const forbidden = [
      canary, receipt, token,
      JSON.parse(Buffer.from(receipt.split(".")[0], "base64url").toString("utf8")).execution_id,
      outcome.reading.result.executionId, outcome.reading.result.inputHash,
      createHash("sha256").update(token).digest("hex"),
    ];
    const files = readdirSync(directory).filter((name) => name.startsWith("aggregate.sqlite"));
    assert.ok(files.includes("aggregate.sqlite"));
    assert.ok(files.some((name) => name.endsWith("-wal")), "real WAL must be inspected while the database is open");
    for (const name of files) {
      const bytes = readFileSync(resolve(directory, name));
      for (const marker of forbidden) assert.equal(bytes.includes(Buffer.from(marker)), false, `Prohibited data in ${name}`);
    }
    const rows = store.snapshot();
    assert.equal(rows.psc_result_valid_committed, 1);
    assert.ok(Object.entries(rows).every(([name, value]) => ALL_COUNTERS.includes(name) && Number.isSafeInteger(value)));
  } finally { harness.close(); }
  for (const name of readdirSync(directory)) assert.equal(readFileSync(resolve(directory, name)).includes(Buffer.from(canary)), false);
});

test("P05 / A01 — aggregate writes are direct finite counters and invalid batch rolls back", () => {
  const store = new SqliteFreeAccessStore();
  try {
    store.increment("psc_started");
    assert.equal(store.snapshot().psc_started, 1);
    for (const value of ["visitor_123", "cycle_number", "time_between_results", "downloaded", { event: "psc_started", raw: "SYNTHETIC_CANARY" }]) {
      assert.throws(() => store.increment(value));
    }
    assert.throws(() => store.incrementMany(["psc_started", "arbitrary_private_dimension"]));
    assert.equal(store.snapshot().psc_started, 1);
    assert.ok(Object.keys(store.snapshot()).every((name) => ALL_COUNTERS.includes(name)));
  } finally { store.close(); }
});

test("P06 / A01 — quota reaches counters once each and no replay event row is retained", async () => {
  const harness = createHarness();
  try {
    for (let index = 1; index <= 4; index += 1) await harness.submit(index);
    await harness.submit(4);
    const counts = harness.store.snapshot();
    assert.equal(counts.psc_result_valid_committed, 4);
    for (const name of ["quota_cycle_started", "quota_cycle_reached_2", "quota_cycle_reached_3", "quota_cycle_reached_4"]) assert.equal(counts[name], 1);
    assert.equal(counts.time_to_exhaust_under_1h, 1);
    assert.equal(counts.time_to_exhaust_1h_to_24h ?? 0, 0);
    assert.equal(counts.time_to_exhaust_24h_to_720h ?? 0, 0);
    assert.equal(harness.store.schemaInventory().length, 2);
  } finally { harness.close(); }
});

test("P07 / A01 — exhaustion emits only one coarse bucket across its boundaries", async () => {
  for (const [elapsed, bucket] of [
    [60 * 60 * 1000, "time_to_exhaust_1h_to_24h"],
    [24 * 60 * 60 * 1000, "time_to_exhaust_24h_to_720h"],
  ]) {
    const harness = createHarness();
    try {
      await harness.submit(1);
      harness.clock.advance(elapsed);
      for (let index = 2; index <= 4; index += 1) await harness.submit(index);
      const counts = harness.store.snapshot();
      assert.equal(counts[bucket], 1);
      const totals = Object.entries(counts).filter(([name]) => name.startsWith("time_to_exhaust_")).reduce((sum, [, value]) => sum + value, 0);
      assert.equal(totals, 1);
    } finally { harness.close(); }
  }
});

test("P08 / A01 — low aggregate counts are suppressed and released counts coarsened", () => {
  const store = new SqliteFreeAccessStore();
  try {
    for (let index = 0; index < 19; index += 1) store.increment("psc_started");
    assert.equal(store.exportAggregates().psc_started, null);
    store.increment("psc_started");
    assert.equal(store.exportAggregates().psc_started, 20);
    for (let index = 0; index < 19; index += 1) store.increment("psc_started");
    assert.equal(store.exportAggregates().psc_started, 20);
    store.increment("psc_started");
    assert.equal(store.exportAggregates().psc_started, 40);
    assert.ok(Object.values(store.exportAggregates()).every((value) => value === null || (value >= 20 && value % 20 === 0)));
  } finally { store.close(); }
});

test("P09 / A01 — authoritative quota and commerce events cannot be client-minted", () => {
  for (const name of [...PRODUCT_COUNTERS.filter((name) => !CLIENT_COUNTERS.includes(name)), ...COMMERCE_COUNTERS]) {
    assert.throws(() => assertClientEvent(name), TypeError);
  }
  assert.equal(new Set(ALL_COUNTERS).size, ALL_COUNTERS.length);
  assert.equal(PRODUCT_COUNTERS.some((name) => COMMERCE_COUNTERS.includes(name)), false);
  assert.equal(ALL_COUNTERS.some((name) => /classification|status|variant|cycle_number|time_between/.test(name)), false);
});

test("P10 / A01 S04 — analytics receives fixed names only and cannot change issued semantics", async () => {
  const seen = [];
  const failedStore = {
    incrementMany(names) { seen.push(names); throw new Error("SYNTHETIC_AGGREGATE_PRIVATE_ERROR"); },
    increment(name) { seen.push([name]); throw new Error("SYNTHETIC_AGGREGATE_PRIVATE_ERROR"); },
    close() {},
  };
  const harness = createHarness({ store: failedStore });
  try {
    const result = await harness.submit(1);
    const replay = await harness.submit(1);
    assert.equal(result.quota.successfulUses, 1);
    assert.equal(replay.quota.successfulUses, 1);
    assert.equal(replay.replayed, true);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
    assert.ok(seen.length > 0);
    assert.ok(seen.every((names) => Array.isArray(names) && names.every((name) => typeof name === "string" && ALL_COUNTERS.includes(name))));
    assert.equal(JSON.stringify(seen).includes(harness.browser.token), false);
    assert.equal(JSON.stringify(seen).includes(result.reading.result.executionId), false);
  } finally { harness.close(); }
});

test("P11 / S04 — fixed public errors discard raw dependency messages, details and stacks", () => {
  const canary = "SYNTHETIC_RAW_ERROR_CANARY_b6f8";
  const forged = Object.assign(new Error(canary), { code: "VALIDATION_ERROR", details: { raw: canary }, stack: canary });
  const typed = new AppError("VALIDATION_ERROR");
  typed.message = canary; typed.stack = canary; typed.details = { raw: canary };
  for (const error of [forged, typed, new Error(canary)]) {
    const safe = publicError(error);
    assert.equal(JSON.stringify(safe).includes(canary), false);
    assert.deepEqual(Object.keys(safe.error).sort(), ["code", "message"]);
  }
  assert.equal(publicError(forged).error.code, "INTERNAL_ERROR");
});

test("P12 / S04 — execution/validation adversaries produce no raw console log", async (t) => {
  const output = [];
  for (const method of ["log", "warn", "error", "info", "debug", "trace"]) t.mock.method(console, method, (...values) => output.push(values.join(" ")));
  const canary = "SYNTHETIC_PROCESSING_PRIVATE_CANARY_c9c1";
  for (const behavior of [() => new Error(canary), () => ({ schemaVersion: canary })]) {
    const harness = createHarness({ behavior });
    try {
      await assert.rejects(harness.submit(1, { request: { prompt: canary, context: { note: canary } } }), (error) => {
        assert.equal(error.code, "EXECUTION_FAILED");
        assert.equal(error.message.includes(canary), false);
        return true;
      });
    } finally { harness.close(); }
  }
  assert.equal(output.join("\n").includes(canary), false);
  assert.equal(output.length, 0);
});

test("P13 / A01 — valid issuance survives a real aggregate-storage failure without retry double-count", async () => {
  const closedDatabase = new SqliteFreeAccessStore();
  closedDatabase.close();
  const store = {
    incrementMany: closedDatabase.incrementMany.bind(closedDatabase),
    increment: closedDatabase.increment.bind(closedDatabase),
    close() {},
  };
  const harness = createHarness({ store });
  try {
    const result = await harness.submit(1);
    const replay = await harness.submit(1);
    assert.equal(result.quota.successfulUses, 1);
    assert.equal(replay.quota.successfulUses, 1);
    assert.equal(harness.executor.metrics.mockExecutions, 1);
  } finally { harness.close(); }
});

test("P14 / S01 — hidden generated columns cannot hide a prohibited storage dimension", (t) => {
  const directory = temporaryDirectory(t, "generated-column");
  const filename = resolve(directory, "generated.sqlite");
  const initialized = new SqliteFreeAccessStore({ filename });
  initialized.close();
  const altered = new DatabaseSync(filename);
  altered.exec("ALTER TABLE aggregate_counters ADD COLUMN browser_journey TEXT GENERATED ALWAYS AS (counter || ':identity') VIRTUAL");
  altered.close();
  assert.throws(() => new SqliteFreeAccessStore({ filename }));
});

test("P15 / S01 — triggers or views cannot turn aggregate writes into event rows", (t) => {
  const directory = temporaryDirectory(t, "object-refusal");
  const filename = resolve(directory, "view.sqlite");
  const initialized = new SqliteFreeAccessStore({ filename });
  initialized.close();
  const altered = new DatabaseSync(filename);
  altered.exec("CREATE VIEW event_journey AS SELECT counter, value FROM aggregate_counters");
  altered.close();
  assert.throws(() => new SqliteFreeAccessStore({ filename }));
});
