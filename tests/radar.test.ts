import assert from "node:assert/strict";
import test from "node:test";
import { assetClasses, cellFor, fixtureCells, regions } from "../lib/radar.ts";

test("fixture has exactly one cell for each region and asset class", () => {
  assert.equal(fixtureCells.length, regions.length * assetClasses.length);
  for (const region of regions) for (const assetClass of assetClasses) assert.ok(cellFor(region, assetClass));
});

test("fixture preserves independent flow and pressure tracks", () => {
  const diverging = cellFor("global", "equities");
  assert.equal(diverging.state, "diverging");
  assert.ok(diverging.flowTrend);
  assert.ok(diverging.pressure);
  assert.notEqual(Math.sign(diverging.flowTrend.score), Math.sign(diverging.pressure.score));
});

test("unavailable cells do not invent signals", () => {
  const cell = cellFor("asia", "crypto");
  assert.equal(cell.state, "unavailable");
  assert.equal(cell.flowTrend, null);
  assert.equal(cell.pressure, null);
});
