import assert from "node:assert/strict";
import test from "node:test";
import { cellFor, crossBorderInputs, officialInputs, release } from "../lib/official-release.ts";

test("official release never mixes fixture provenance", () => {
  assert.equal(release.provenance, "official");
  assert.ok(officialInputs.length > 0);
  assert.ok(officialInputs.every((input) => input.provenance === "official" && !input.reconstructed));
});

test("official U.S. flows are derived from validated inputs", () => {
  const liquidity = cellFor("us:liquidity")!;
  const equities = cellFor("us:equities")!;
  const rates = cellFor("us:rates")!;
  const credit = cellFor("us:credit")!;
  assert.equal(liquidity.state, "flow-only");
  assert.deepEqual(liquidity.flowTrend?.sourceIds, ["fed-h41-total-assets", "nyfed-on-rrp"]);
  assert.deepEqual(equities.flowTrend?.sourceIds, ["tic-equities-us"]);
  assert.deepEqual(rates.flowTrend?.sourceIds, ["tic-treasuries-us"]);
  assert.deepEqual(rates.pressure?.sourceIds, ["fed-h15-10y"]);
  assert.deepEqual(credit.flowTrend?.sourceIds, ["tic-agency-us", "tic-corporate-us"]);
});

test("official release includes validated European and Asian liquidity", () => {
  assert.deepEqual(cellFor("europe:liquidity")?.flowTrend?.sourceIds, ["ecb-balance-sheet"]);
  assert.deepEqual(cellFor("asia:liquidity")?.flowTrend?.sourceIds, ["boj-total-assets"]);
});

test("official release includes regional Treasury TIC lanes", () => {
  assert.deepEqual(crossBorderInputs.map((input) => input.sourceId), [
    "tic-europe-us-securities", "tic-asia-us-securities", "tic-japan-us-securities", "tic-china-us-securities",
  ]);
});
