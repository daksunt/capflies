/**
 * FIXTURE RELEASE — not production data.
 *
 * Every score below is illustrative and was written by hand to exercise the
 * derivation rules while official adapters (plan.md M2) are unimplemented. No
 * value here was fetched from, or reproduces, an official publisher's data. The
 * manifest carries `provenance: "fixture"`; the build refuses to label it
 * otherwise and the interface shows a fixture notice on every route.
 */
import {
  deriveBrief,
  deriveCells,
  deriveSourceHealth,
  label,
  type MatrixCell,
  type ReleaseManifest,
  type SourceInput,
} from "./radar.ts";

const fixture = (
  sourceId: string,
  asOf: string,
  score: number,
  calibrationObservations: number,
  calibrationYears: number,
  releasedAt: string | null = null,
): SourceInput => ({
  sourceId,
  asOf,
  releasedAt,
  score,
  calibrationObservations,
  calibrationYears,
  reconstructed: true,
  provenance: "fixture",
});

export const fixtureInputs: SourceInput[] = [
  // Global
  fixture("imf-reserves-global", "2026-06-30", 58, 40, 10, "2026-08-14"),
  fixture("bis-gli-global", "2026-06-30", 46, 38, 10, "2026-08-07"),
  fixture("imf-portfolio-equity-global", "2026-03-31", -31, 34, 9, "2026-07-24"),
  fixture("imf-portfolio-debt-global", "2026-03-31", 24, 33, 9, "2026-07-24"),
  fixture("bis-claims-global", "2026-03-31", 40, 36, 10, "2026-07-17"),
  fixture("imf-commodity-prices", "2026-07-31", 61, 120, 10, "2026-08-12"),
  fixture("cftc-commodities-global", "2026-08-18", 49, 300, 10, "2026-08-21"),
  fixture("cftc-bitcoin", "2026-08-18", -44, 260, 8, "2026-08-21"),

  // United States. nyfed-on-rrp is deliberately absent: a source outage.
  fixture("fed-h41-total-assets", "2026-08-19", 68, 520, 10, "2026-08-20"),
  fixture("treasury-tga", "2026-08-24", 55, 900, 10, "2026-08-25"),
  fixture("tic-equities-us", "2026-06-30", 37, 200, 10, "2026-08-18"),
  fixture("cftc-equity-index-us", "2026-08-18", -52, 300, 10, "2026-08-21"),
  fixture("tic-treasuries-us", "2026-06-30", 44, 210, 10, "2026-08-18"),
  fixture("fed-h15-10y", "2026-08-24", 39, 900, 10, "2026-08-25"),
  fixture("cftc-treasury-us", "2026-08-18", 57, 300, 10, "2026-08-21"),
  fixture("tic-agency-us", "2026-06-30", -22, 200, 10, "2026-08-18"),
  fixture("tic-corporate-us", "2026-06-30", -35, 200, 10, "2026-08-18"),
  // Expired: last usable print is far beyond the weekly expiry window.
  fixture("cftc-commodities-us", "2026-06-05", 30, 300, 10, "2026-06-09"),

  // Europe. ecb-balance-sheet is inside the stale window and is carried once.
  fixture("ecb-balance-sheet", "2026-08-04", -47, 480, 10, "2026-08-05"),
  fixture("imf-portfolio-equity-europe", "2026-03-31", 18, 32, 9, "2026-07-24"),
  fixture("ecb-yield-curve", "2026-08-24", 51, 850, 10, "2026-08-25"),
  // Thin calibration history: no score is published for it. bis-claims-europe did not report.
  fixture("imf-portfolio-debt-europe", "2026-03-31", 15, 12, 3, "2026-07-24"),

  // Asia
  fixture("boj-total-assets", "2026-08-19", 33, 480, 10, "2026-08-20"),
  fixture("imf-reserves-asia", "2026-06-30", 29, 40, 10, "2026-08-14"),
  fixture("imf-portfolio-equity-asia", "2026-03-31", 12, 30, 8, "2026-07-24"),
  fixture("bis-claims-asia", "2026-03-31", -19, 36, 10, "2026-07-17"),

  // Emerging markets
  fixture("imf-reserves-emerging", "2026-06-30", -26, 40, 10, "2026-08-14"),
  fixture("bis-gli-emerging", "2026-03-31", -38, 34, 10, "2026-07-17"),
  fixture("imf-portfolio-equity-emerging", "2026-03-31", -55, 32, 9, "2026-07-24"),
  fixture("cftc-msci-emerging", "2026-08-18", -68, 260, 8, "2026-08-21"),
  fixture("bis-claims-emerging", "2026-03-31", -41, 30, 10, "2026-07-17"),
];

/** Fixed timestamps keep the generated artifacts byte-identical across machines. */
export const release: ReleaseManifest = {
  schemaVersion: 1,
  methodologyVersion: "0.2.0-fixture",
  release: "2026-W35",
  generatedAt: "2026-08-31T00:00:00.000Z",
  dataThrough: "2026-08-25",
  liveSince: null,
  previousRelease: null,
  reconstructed: true,
  provenance: "fixture",
  sourceHealth: deriveSourceHealth(fixtureInputs, {
    dataThrough: "2026-08-25",
    generatedAt: "2026-08-31T00:00:00.000Z",
  }),
};

export const cells: MatrixCell[] = deriveCells(fixtureInputs, release.dataThrough);
export const brief = deriveBrief(cells, label);

export function cellFor(id: string): MatrixCell | undefined {
  return cells.find((cell) => cell.id === id);
}

export function inputsFor(cell: MatrixCell): SourceInput[] {
  const ids = new Set([...(cell.flowTrend?.sourceIds ?? []), ...(cell.pressure?.sourceIds ?? [])]);
  return fixtureInputs.filter((input) => ids.has(input.sourceId));
}
