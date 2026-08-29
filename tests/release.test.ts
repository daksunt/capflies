import assert from "node:assert/strict";
import test from "node:test";
import { cellsCsv, currentJson, inputsCsv, manifestJson } from "../lib/artifacts.ts";
import { brief, cellFor, cells, fixtureInputs, release } from "../lib/fixture-release.ts";
import { assetClasses, regions, sources } from "../lib/radar.ts";

test("the release is marked as fixture data everywhere it can be read", () => {
  assert.equal(release.provenance, "fixture");
  assert.equal(release.reconstructed, true);
  assert.equal(release.liveSince, null);
  assert.ok(fixtureInputs.every((input) => input.provenance === "fixture" && input.reconstructed));
  assert.match(cellsCsv(), /,fixture\n/);
  assert.match(inputsCsv(), /,fixture\n/);
  assert.match(currentJson("abc"), /"provenance": "fixture"/);
});

test("registry and fixture inputs agree", () => {
  assert.equal(new Set(sources.map((source) => source.id)).size, sources.length);
  const known = new Set(sources.map((source) => source.id));
  for (const input of fixtureInputs) assert.ok(known.has(input.sourceId), `unknown source ${input.sourceId}`);
  assert.equal(new Set(fixtureInputs.map((input) => input.sourceId)).size, fixtureInputs.length);
  // Sources with no input are a modelled outage, and must be reported as such.
  for (const source of sources) {
    if (fixtureInputs.some((input) => input.sourceId === source.id)) continue;
    assert.equal(release.sourceHealth.find((health) => health.sourceId === source.id)?.status, "failed");
  }
});

test("the fixture release exercises every cell state", () => {
  const states = new Set(cells.map((cell) => cell.state));
  for (const state of ["confirming-in", "confirming-out", "diverging", "flow-only", "pressure-only", "insufficient", "unavailable"]) {
    assert.ok(states.has(state as never), `missing state ${state}`);
  }
  assert.equal(cells.length, regions.length * assetClasses.length);
});

test("stale and suppressed cells present themselves accurately", () => {
  const stale = cellFor("europe:liquidity")!;
  assert.equal(stale.freshness, "stale");
  assert.equal(stale.confidence, "low");
  assert.equal(stale.asOf, "2026-08-04"); // carried at its original as-of date

  const suppressed = cellFor("europe:credit")!;
  assert.equal(suppressed.state, "insufficient");
  assert.equal(suppressed.flowTrend, null);
  assert.match(suppressed.note!, /coverage rule/);

  const unavailable = cellFor("asia:crypto")!;
  assert.equal(unavailable.state, "unavailable");
  assert.equal(unavailable.confidence, null);
  assert.equal(unavailable.asOf, null);
});

test("cell state is a pure function of the two track signs", () => {
  for (const cell of cells) {
    if (!cell.flowTrend || !cell.pressure) continue;
    const flow = cell.flowTrend.score;
    const pressure = cell.pressure.score;
    assert.notEqual(cell.state === "diverging", Math.sign(flow) === Math.sign(pressure) && flow !== 0);
  }
});

test("the brief only points at cells that exist in this release", () => {
  assert.ok(brief.length > 0);
  for (const item of brief) assert.ok(cellFor(item.cellId), `brief references missing cell ${item.cellId}`);
});

test("CSV artifacts are rectangular and cover every row", () => {
  for (const [text, expectedRows] of [
    [cellsCsv(), cells.length],
    [inputsCsv(), fixtureInputs.length],
  ] as const) {
    const rows = text.trimEnd().split("\n");
    assert.equal(rows.length, expectedRows + 1);
    const columns = rows[0]!.split(",").length;
    for (const row of rows) assert.equal(row.split(",").length, columns);
  }
});

test("artifacts are byte-identical regardless of the local time zone", () => {
  const previous = process.env.TZ;
  const render = (zone: string) => {
    process.env.TZ = zone;
    return manifestJson([{ path: "/x", sha256: "0" }]) + cellsCsv() + inputsCsv();
  };
  const utc = render("UTC");
  const kiritimati = render("Pacific/Kiritimati");
  process.env.TZ = previous;
  assert.equal(utc, kiritimati);
});

test("the manifest carries the schema, the cells, and artifact checksums", () => {
  const manifest = JSON.parse(manifestJson([{ path: "/data/v1/releases/2026-W35/cells.csv", sha256: "deadbeef" }]));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.provenance, "fixture");
  assert.equal(manifest.cells.length, cells.length);
  assert.equal(manifest.artifacts[0].sha256, "deadbeef");
  assert.ok(manifest.sourceHealth.length === sources.length);
});
