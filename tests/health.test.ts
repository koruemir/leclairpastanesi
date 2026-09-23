import assert from "node:assert/strict";
import { test, after } from "node:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GET } from "../src/app/api/health/route";
import { getDatabase } from "../src/lib/server/database";

const directory = mkdtempSync(join(tmpdir(), "lecalir-health-test-"));
after(() => {
  const db = getDatabase();
  if (db.open) db.close();
  rmSync(directory, { recursive: true, force: true });
});

test("readiness rejects an unusable data mount without exposing error details", async (context) => {
  context.mock.method(console, "error", () => {});
  const blocked = join(directory, "not-a-directory");
  writeFileSync(blocked, "not a writable data directory");
  process.env.DATA_DIR = blocked;
  const response = GET();
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: "unavailable" });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("readiness checks the SQLite schema and fails when its connection is unusable", async (context) => {
  context.mock.method(console, "error", () => {});
  process.env.DATA_DIR = join(directory, "data");
  const response = GET();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  getDatabase().close();
  assert.equal(GET().status, 503);
});
