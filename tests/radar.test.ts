import assert from "node:assert/strict";
import test from "node:test";
import {
  accelerationFrom,
  assetClasses,
  daysBetween,
  deriveBrief,
  deriveCell,
  deriveCells,
  freshnessOf,
  hasCalibration,
  label,
  regions,
  sourceById,
  strengthBand,
  thresholds,
  type AssetClassId,
  type RegionId,
  type SourceInput,
} from "../lib/radar.ts";

const dataThrough = "2026-08-25";

function input(sourceId: string, asOf: string, score: number, over: Partial<SourceInput> = {}): SourceInput {
  return {
    sourceId,
    asOf,
    releasedAt: null,
    score,
    calibrationObservations: 60,
    calibrationYears: 10,
    reconstructed: true,
    provenance: "fixture",
    ...over,
  };
}

/** Shifts a date by whole days without depending on the local time zone. */
function daysBefore(anchor: string, days: number): string {
  return new Date(Date.parse(`${anchor}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);
}

test("freshness boundaries are inclusive at stale and expire", () => {
  const source = sourceById("fed-h41-total-assets"); // weekly: 14 / 35
  assert.equal(freshnessOf(source, daysBefore(dataThrough, 14), dataThrough), "current");
  assert.equal(freshnessOf(source, daysBefore(dataThrough, 15), dataThrough), "stale");
  assert.equal(freshnessOf(source, daysBefore(dataThrough, 35), dataThrough), "stale");
  assert.equal(freshnessOf(source, daysBefore(dataThrough, 36), dataThrough), "expired");
});

test("date arithmetic does not depend on the local time zone", () => {
  const previous = process.env.TZ;
  const readings = ["UTC", "Pacific/Kiritimati", "Pacific/Niue"].map((zone) => {
    process.env.TZ = zone;
    return daysBetween("2026-03-31", dataThrough);
  });
  process.env.TZ = previous;
  assert.deepEqual(readings, [147, 147, 147]);
});

test("calibration floor is exactly 20 observations and 5 years", () => {
  const base = input("tic-equities-us", dataThrough, 10);
  assert.equal(hasCalibration({ ...base, calibrationObservations: 20, calibrationYears: 5 }), true);
  assert.equal(hasCalibration({ ...base, calibrationObservations: 19, calibrationYears: 5 }), false);
  assert.equal(hasCalibration({ ...base, calibrationObservations: 20, calibrationYears: 4 }), false);
});

test("acceleration steps at exactly 15 points and is null without a previous release", () => {
  assert.equal(accelerationFrom(40, 25), "increasing");
  assert.equal(accelerationFrom(40, 26), "stable");
  assert.equal(accelerationFrom(25, 40), "decreasing");
  assert.equal(accelerationFrom(25, 39), "stable");
  assert.equal(accelerationFrom(40, null), null);
});

test("strength bands break at 40 and 80", () => {
  assert.equal(strengthBand(39.9), "ordinary");
  assert.equal(strengthBand(-40), "moderate");
  assert.equal(strengthBand(80), "moderate");
  assert.equal(strengthBand(80.1), "strong");
});

test("state is derived from the two tracks, including the zero case", () => {
  const state = (inputs: SourceInput[], region: RegionId = "us", assetClass: AssetClassId = "rates") =>
    deriveCell(region, assetClass, inputs, dataThrough).state;

  assert.equal(state([input("tic-treasuries-us", dataThrough, 44), input("fed-h15-10y", dataThrough, 30), input("cftc-treasury-us", dataThrough, 20)]), "confirming-in");
  assert.equal(state([input("tic-treasuries-us", dataThrough, -44), input("fed-h15-10y", dataThrough, -30), input("cftc-treasury-us", dataThrough, -20)]), "confirming-out");
  assert.equal(state([input("tic-treasuries-us", dataThrough, 44), input("fed-h15-10y", dataThrough, -30), input("cftc-treasury-us", dataThrough, -20)]), "diverging");
  // A zero score has no direction, so it can never confirm the other track.
  assert.equal(state([input("tic-treasuries-us", dataThrough, 0), input("fed-h15-10y", dataThrough, 30), input("cftc-treasury-us", dataThrough, 20)]), "diverging");
  assert.equal(state([input("tic-treasuries-us", dataThrough, 44)]), "flow-only");
  assert.equal(state([input("fed-h15-10y", dataThrough, 30), input("cftc-treasury-us", dataThrough, 20)]), "pressure-only");
  assert.equal(state([]), "insufficient");
  assert.equal(state([], "global", "rates"), "unavailable");
});

test("a track is suppressed below 50% coverage and kept at exactly 50%", () => {
  // us:credit has two configured flow inputs.
  const half = deriveCell("us", "credit", [input("tic-agency-us", dataThrough, -30)], dataThrough);
  assert.equal(half.state, "flow-only");
  assert.equal(half.flowTrend?.usableInputs, 1);
  assert.equal(half.flowTrend?.configuredInputs, 2);

  // us:liquidity has three; one usable is below the rule.
  const third = deriveCell("us", "liquidity", [input("treasury-tga", dataThrough, 55)], dataThrough);
  assert.equal(third.state, "insufficient");
  assert.equal(third.flowTrend, null);
  assert.match(third.note!, /50% coverage rule/);
});

test("a cell aggregates by median and never zero-fills a missing input", () => {
  const cell = deriveCell(
    "us",
    "liquidity",
    [input("fed-h41-total-assets", dataThrough, 10), input("treasury-tga", dataThrough, 20), input("nyfed-on-rrp", dataThrough, 90)],
    dataThrough,
  );
  assert.equal(cell.flowTrend?.score, 20); // median, not the mean of 40

  const missing = deriveCell(
    "us",
    "liquidity",
    [input("fed-h41-total-assets", dataThrough, 10), input("treasury-tga", dataThrough, 20)],
    dataThrough,
  );
  assert.equal(missing.flowTrend?.score, 15); // median of the two that reported, not (10+20+0)/3
});

test("a cell reports its oldest as-of date and its worst freshness", () => {
  const cell = deriveCell(
    "us",
    "rates",
    [
      input("tic-treasuries-us", "2026-06-30", 44),
      input("fed-h15-10y", dataThrough, 30),
      input("cftc-treasury-us", daysBefore(dataThrough, 20), 20),
    ],
    dataThrough,
  );
  assert.equal(cell.asOf, "2026-06-30");
  assert.equal(cell.freshness, "stale");
  assert.equal(cell.pressure?.freshness, "stale");
  assert.equal(cell.flowTrend?.freshness, "current");
});

test("confidence follows coverage, currency, sign agreement, and stale carry", () => {
  const full = deriveCell("us", "credit", [input("tic-agency-us", dataThrough, -30), input("tic-corporate-us", dataThrough, -20)], dataThrough);
  assert.equal(full.confidence, "high");

  const partial = deriveCell("us", "credit", [input("tic-agency-us", dataThrough, -30)], dataThrough);
  assert.equal(partial.confidence, "medium");

  const disagreeing = deriveCell("us", "credit", [input("tic-agency-us", dataThrough, -30), input("tic-corporate-us", dataThrough, 20)], dataThrough);
  assert.equal(disagreeing.confidence, "low");

  const stale = deriveCell("us", "credit", [input("tic-agency-us", dataThrough, -30), input("tic-corporate-us", daysBefore(dataThrough, 90), -20)], dataThrough);
  assert.equal(stale.confidence, "low");
  assert.equal(stale.freshness, "stale");
});

test("expired and thin-history inputs are excluded rather than degraded", () => {
  const expired = deriveCell("us", "real-assets", [input("cftc-commodities-us", daysBefore(dataThrough, 90), 30)], dataThrough);
  assert.equal(expired.state, "insufficient");
  assert.match(expired.note!, /expiry window/);

  const thin = deriveCell("us", "real-assets", [input("cftc-commodities-us", dataThrough, 30, { calibrationObservations: 5, calibrationYears: 1 })], dataThrough);
  assert.equal(thin.state, "insufficient");
  assert.match(thin.note!, /calibration history/);
});

test("derived cells cover every region and asset class exactly once", () => {
  const cells = deriveCells([], dataThrough);
  assert.equal(cells.length, regions.length * assetClasses.length);
  assert.equal(new Set(cells.map((cell) => cell.id)).size, cells.length);
});

test("the brief keeps a fixed order, skips low confidence, and omits empty categories", () => {
  const inputs = [
    input("tic-treasuries-us", dataThrough, 44),
    input("fed-h15-10y", dataThrough, 30),
    input("cftc-treasury-us", dataThrough, 20),
    input("imf-portfolio-equity-emerging", dataThrough, -55),
    input("cftc-msci-emerging", dataThrough, -68),
  ];
  const brief = deriveBrief(deriveCells(inputs, dataThrough), label);
  assert.deepEqual(brief.map((item) => item.kind), ["Confirmed inflow", "Confirmed outflow"]);
  assert.deepEqual(brief.map((item) => item.cellId), ["us:rates", "emerging:equities"]);
  assert.equal(deriveBrief(deriveCells(inputs, dataThrough), label)[0]!.text, brief[0]!.text);

  const lowConfidence = deriveBrief(
    deriveCells([input("tic-agency-us", dataThrough, -30), input("tic-corporate-us", dataThrough, 20)], dataThrough),
    label,
  );
  assert.deepEqual(lowConfidence, []);
});
