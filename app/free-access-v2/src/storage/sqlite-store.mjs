import { readdirSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { ALL_COUNTERS, assertCounterName, suppressSparseTotals } from "../analytics/counters.mjs";
import { PersistenceError } from "../errors.mjs";

const DEFAULT_MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), "../../migrations");
const SCHEMA_COLUMNS = Object.freeze({
  aggregate_counters: ["counter", "value"],
  schema_migrations: ["version", "applied_at"],
});

export class SqliteFreeAccessStore {
  #db;
  #closed = false;

  constructor({ filename = ":memory:" } = {}) {
    if (filename !== ":memory:") mkdirSync(dirname(resolve(filename)), { recursive: true });
    this.#db = new DatabaseSync(filename);
    try {
      // Reject legacy/unknown state before enabling WAL or applying any migration.
      this.#assertSchema(false);
      this.#db.exec("PRAGMA foreign_keys = ON");
      this.#db.exec("PRAGMA busy_timeout = 5000");
      if (filename !== ":memory:") this.#db.exec("PRAGMA journal_mode = WAL");
      this.#migrate();
      this.#assertSchema(true);
      this.snapshot();
    } catch {
      this.#db.close();
      this.#closed = true;
      throw new TypeError("Database is not a valid browser-bounded aggregate store");
    }
  }

  #assertSchema(complete) {
    const objects = this.#db.prepare("SELECT name, type FROM sqlite_schema WHERE NOT (type = 'index' AND name LIKE 'sqlite_autoindex_%') ORDER BY name").all();
    for (const object of objects) {
      if (object.type !== "table" || !Object.hasOwn(SCHEMA_COLUMNS, object.name)) throw new TypeError("Unexpected database object");
      const columns = this.#db.prepare("PRAGMA table_xinfo(" + object.name + ")").all();
      if (columns.map((column) => column.name).join(",") !== SCHEMA_COLUMNS[object.name].join(",")) throw new TypeError("Unexpected database columns");
      const expectedTypes = object.name === "aggregate_counters" ? ["TEXT", "INTEGER"] : ["TEXT", "TEXT"];
      if (columns.some((column, index) => column.type.toUpperCase() !== expectedTypes[index])
        || columns[0].pk !== 1 || columns[1].notnull !== 1
        || (object.name === "aggregate_counters" && columns[0].notnull !== 1)) throw new TypeError("Unexpected database column constraints");
    }
    if (complete && objects.length !== 2) throw new TypeError("Incomplete database schema");
  }

  #migrate() {
    this.#db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
    const applied = this.#db.prepare("SELECT version FROM schema_migrations").all().map((row) => row.version);
    const files = readdirSync(DEFAULT_MIGRATIONS).filter((name) => /^\d+_.+\.sql$/.test(name)).sort();
    if (files.length !== 1 || files[0] !== "001_free_access.sql" || applied.some((version) => !files.includes(version))) throw new TypeError("Unknown migration identity");
    for (const file of files) {
      if (applied.includes(file)) continue;
      const sql = readFileSync(resolve(DEFAULT_MIGRATIONS, file), "utf8");
      this.#transaction(() => {
        this.#db.exec(sql);
        this.#db.prepare("INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)").run(file, new Date().toISOString());
      });
    }
  }

  #transaction(callback) {
    this.#db.exec("BEGIN IMMEDIATE");
    try {
      const result = callback();
      this.#db.exec("COMMIT");
      return result;
    } catch (error) {
      try { this.#db.exec("ROLLBACK"); } catch { /* Preserve fixed upstream error handling. */ }
      throw error;
    }
  }

  increment(counter) { this.incrementMany([counter]); }

  incrementMany(counters) {
    if (!Array.isArray(counters) || counters.length > ALL_COUNTERS.length) throw new TypeError("Expected a bounded list of counters");
    counters.forEach(assertCounterName);
    try {
      this.#transaction(() => {
        const statement = this.#db.prepare("INSERT INTO aggregate_counters(counter, value) VALUES (?, 1) ON CONFLICT(counter) DO UPDATE SET value = value + 1");
        for (const counter of counters) statement.run(counter);
      });
    } catch { throw new PersistenceError(); }
  }

  snapshot() {
    const totals = Object.fromEntries(ALL_COUNTERS.map((counter) => [counter, 0]));
    const rows = this.#db.prepare("SELECT counter, value FROM aggregate_counters ORDER BY counter").all();
    for (const row of rows) {
      assertCounterName(row.counter);
      if (!Number.isSafeInteger(row.value) || row.value < 0) throw new TypeError("Invalid aggregate value");
      totals[row.counter] = row.value;
    }
    return Object.freeze(totals);
  }

  exportAggregates() { return suppressSparseTotals(this.snapshot()); }

  schemaInventory() {
    return this.#db.prepare("SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name").all()
      .map(({ name }) => ({ name, columns: this.#db.prepare("PRAGMA table_xinfo(" + name + ")").all().map((column) => column.name) }));
  }

  close() {
    if (this.#closed) return;
    this.#closed = true;
    this.#db.close();
  }
}
