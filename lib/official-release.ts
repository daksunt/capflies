/** A narrow release made only from validated public FRED observations. */
import fred from "../data/official-us.json" with { type: "json" };
import { deriveBrief, deriveCells, deriveSourceHealth, type MatrixCell, type ReleaseManifest, type SourceInput } from "./radar.ts";
import { label } from "./registry.ts";

const source = (id: string) => {
  const found = fred.sources.find((item) => item.id === id);
  if (!found) throw new Error(`Missing validated FRED series ${id}`);
  return found;
};

const asInput = (sourceId: string, fredId: string, direction = 1): SourceInput => {
  const item = source(fredId);
  return {
    sourceId,
    asOf: item.periodEnd,
    releasedAt: item.periodEnd,
    score: item.score * direction,
    calibrationObservations: item.calibrationObservations,
    calibrationYears: 10,
    reconstructed: false,
    provenance: "official",
  };
};

/** RRP contraction is liquidity-positive, hence its score is sign-reversed. */
export const officialInputs: SourceInput[] = [
  asInput("fed-h41-total-assets", "WALCL"),
  asInput("nyfed-on-rrp", "RRPONTSYD", -1),
  asInput("fed-h15-10y", "DGS10"),
];

export const release: ReleaseManifest = {
  schemaVersion: 1,
  methodologyVersion: "0.3.0-official-us",
  release: `official-us-${fred.dataThrough}`,
  generatedAt: fred.retrievedAt,
  dataThrough: fred.dataThrough,
  liveSince: fred.retrievedAt.slice(0, 10),
  previousRelease: null,
  reconstructed: false,
  provenance: "official",
  sourceHealth: deriveSourceHealth(officialInputs, { dataThrough: fred.dataThrough, generatedAt: fred.retrievedAt }),
};

export const cells: MatrixCell[] = deriveCells(officialInputs, release.dataThrough);
export const brief = deriveBrief(cells, label);

export function cellFor(id: string): MatrixCell | undefined { return cells.find((cell) => cell.id === id); }
export function inputsFor(cell: MatrixCell): SourceInput[] {
  const ids = new Set([...(cell.flowTrend?.sourceIds ?? []), ...(cell.pressure?.sourceIds ?? [])]);
  return officialInputs.filter((input) => ids.has(input.sourceId));
}
