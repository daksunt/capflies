export const regions = ["global", "us", "europe", "asia", "emerging"] as const;
export const assetClasses = [
  "liquidity",
  "equities",
  "rates",
  "credit",
  "real-assets",
  "crypto",
] as const;

export type RegionId = (typeof regions)[number];
export type AssetClassId = (typeof assetClasses)[number];
export type EvidenceKind = "measured" | "constructed" | "positioning" | "inferred";
export type MatrixState =
  | "confirming-in"
  | "confirming-out"
  | "diverging"
  | "flow-only"
  | "pressure-only"
  | "insufficient"
  | "unavailable";

export interface Track {
  score: number;
  evidenceKind: EvidenceKind;
  asOf: string;
}

export interface MatrixCell {
  region: RegionId;
  assetClass: AssetClassId;
  state: MatrixState;
  flowTrend: Track | null;
  pressure: Track | null;
}

type FixtureCell = Omit<MatrixCell, "region" | "assetClass">;

const current = "2026-08-25";

const examples: Partial<Record<`${RegionId}:${AssetClassId}`, FixtureCell>> = {
  "global:liquidity": {
    state: "confirming-in",
    flowTrend: { score: 64, evidenceKind: "constructed", asOf: current },
    pressure: { score: 41, evidenceKind: "positioning", asOf: current },
  },
  "global:equities": {
    state: "diverging",
    flowTrend: { score: -38, evidenceKind: "measured", asOf: "2026-07-31" },
    pressure: { score: 57, evidenceKind: "positioning", asOf: current },
  },
  "global:credit": {
    state: "confirming-in",
    flowTrend: { score: 52, evidenceKind: "measured", asOf: "2026-06-30" },
    pressure: { score: 45, evidenceKind: "inferred", asOf: current },
  },
  "global:real-assets": {
    state: "pressure-only",
    flowTrend: null,
    pressure: { score: 61, evidenceKind: "positioning", asOf: current },
  },
  "global:crypto": {
    state: "pressure-only",
    flowTrend: null,
    pressure: { score: -44, evidenceKind: "positioning", asOf: current },
  },
  "us:liquidity": {
    state: "confirming-in",
    flowTrend: { score: 71, evidenceKind: "constructed", asOf: current },
    pressure: { score: 48, evidenceKind: "inferred", asOf: current },
  },
  "us:equities": {
    state: "flow-only",
    flowTrend: { score: 46, evidenceKind: "measured", asOf: "2026-07-31" },
    pressure: null,
  },
  "us:rates": {
    state: "confirming-in",
    flowTrend: { score: 59, evidenceKind: "measured", asOf: "2026-07-31" },
    pressure: { score: 43, evidenceKind: "inferred", asOf: current },
  },
  "europe:liquidity": {
    state: "flow-only",
    flowTrend: { score: -42, evidenceKind: "measured", asOf: "2026-08-21" },
    pressure: null,
  },
  "emerging:equities": {
    state: "confirming-out",
    flowTrend: { score: -63, evidenceKind: "measured", asOf: "2026-06-30" },
    pressure: { score: -49, evidenceKind: "positioning", asOf: current },
  },
};

export const fixtureCells: MatrixCell[] = regions.flatMap((region) =>
  assetClasses.map((assetClass) => {
    const example = examples[`${region}:${assetClass}`];
    return example
      ? { region, assetClass, ...example }
      : { region, assetClass, state: "unavailable", flowTrend: null, pressure: null };
  }),
);

export const fixtureBrief = [
  "Liquidity is the strongest confirmed inflow, led by the US and global measures.",
  "Emerging-market equities are the strongest confirmed outflow in the current fixture.",
  "Global equities diverge: measured cross-border flow is negative while futures pressure is positive.",
];

export function cellFor(region: RegionId, assetClass: AssetClassId): MatrixCell {
  const cell = fixtureCells.find((item) => item.region === region && item.assetClass === assetClass);
  if (!cell) throw new Error(`Missing fixture cell: ${region}:${assetClass}`);
  return cell;
}
