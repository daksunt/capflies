import assert from "node:assert/strict";
import test from "node:test";
import { cellFor, officialInputs, release } from "../lib/official-release.ts";

test("official release never mixes fixture provenance", () => {
  assert.equal(release.provenance, "official");
  assert.ok(officialInputs.length > 0);
  assert.ok(officialInputs.every((input) => input.provenance === "official" && !input.reconstructed));
});

test("official U.S. coverage is narrow and derived from the validated inputs", () => {
  const liquidity = cellFor("us:liquidity")!;
  const rates = cellFor("us:rates")!;
  assert.equal(liquidity.state, "flow-only");
  assert.deepEqual(liquidity.flowTrend?.sourceIds, ["fed-h41-total-assets", "nyfed-on-rrp"]);
  assert.equal(rates.state, "pressure-only");
  assert.deepEqual(rates.pressure?.sourceIds, ["fed-h15-10y"]);
});
