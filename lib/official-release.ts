/** A narrow release made only from validated public FRED observations. */
import fred from "../data/official.json" with { type: "json" };
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
    calibrationYears: item.calibrationYears,
    reconstructed: false,
    provenance: "official",
  };
};

/** RRP contraction is liquidity-positive, hence its score is sign-reversed. */
export const officialInputs: SourceInput[] = [
  asInput("fed-h41-total-assets", "WALCL"),
  asInput("nyfed-on-rrp", "RRPONTSYD", -1),
  asInput("fed-h15-10y", "DGS10"),
  asInput("ecb-balance-sheet", "ECBASSETSW"),
  asInput("boj-total-assets", "JPNASSETS"),
  asInput("tic-equities-us", "FORLTEQTYNET69995"),
  asInput("tic-treasuries-us", "FORLTTREASNET69995"),
  asInput("tic-agency-us", "FORLTAGCYNET69995"),
  asInput("tic-corporate-us", "FORLTCORPNET69995"),
];

export const crossBorderInputs: SourceInput[] = [
  asInput("tic-europe-us-securities", "FORLTTOTALNET19992"),
  asInput("tic-asia-us-securities", "FORLTTOTALNET49999"),
  asInput("tic-japan-us-securities", "FORLTTOTALNET42609"),
  asInput("tic-china-us-securities", "FORLTTOTALNET41408"),
  asInput("tic-india-us-securities", "FORLTTOTALNET42102"),
  asInput("tic-south-korea-us-securities", "FORLTTOTALNET43001"),
  asInput("tic-hong-kong-us-securities", "FORLTTOTALNET42005"),
  asInput("tic-singapore-us-securities", "FORLTTOTALNET46019"),
  asInput("tic-taiwan-us-securities", "FORLTTOTALNET46302"),
  asInput("tic-malaysia-us-securities", "FORLTTOTALNET43605"),
  asInput("tic-indonesia-us-securities", "FORLTTOTALNET42218"),
  asInput("tic-philippines-us-securities", "FORLTTOTALNET44806"),
  asInput("tic-saudi-arabia-us-securities", "FORLTTOTALNET45608"),
  asInput("tic-uae-us-securities", "FORLTTOTALNET46604"),
  asInput("tic-kuwait-us-securities", "FORLTTOTALNET43109"),
  asInput("tic-israel-us-securities", "FORLTTOTALNET42501"),
  asInput("tic-russia-us-securities", "FORLTTOTALNET16101"),
  asInput("tic-turkey-us-securities", "FORLTTOTALNET12807"),
  asInput("tic-latin-america-us-securities", "FORLTTOTALNET39942"),
  asInput("tic-argentina-us-securities", "FORLTTOTALNET30104"),
  asInput("tic-brazil-us-securities", "FORLTTOTALNET30309"),
  asInput("tic-chile-us-securities", "FORLTTOTALNET30406"),
  asInput("tic-colombia-us-securities", "FORLTTOTALNET30503"),
  asInput("tic-mexico-us-securities", "FORLTTOTALNET31704"),
  asInput("tic-peru-us-securities", "FORLTTOTALNET32204"),
  asInput("tic-africa-us-securities", "FORLTTOTALNET59994"),
  asInput("tic-south-africa-us-securities", "FORLTTOTALNET55719"),
];
export const releaseInputs: SourceInput[] = [...officialInputs, ...crossBorderInputs];

export const release: ReleaseManifest = {
  schemaVersion: 1,
  methodologyVersion: "0.3.0-official",
  release: `official-${fred.dataThrough}`,
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
