import {
  assetClasses,
  regions,
  sourceById,
  sources,
  sourcesFor,
  type AssetClassId,
  type EvidenceKind,
  type RegionId,
  type SourceDefinition,
  type Track,
} from "./registry.ts";

export * from "./registry.ts";

export type Freshness = "current" | "stale" | "expired";
export type Confidence = "low" | "medium" | "high";
export type Acceleration = "increasing" | "stable" | "decreasing";
export type Provenance = "fixture" | "official";
export type MatrixState =
  | "confirming-in"
  | "confirming-out"
  | "diverging"
  | "flow-only"
  | "pressure-only"
  | "insufficient"
  | "unavailable";

/** Thresholds from architecture.md section 7. Boundaries are inclusive as written there. */
export const thresholds = {
  minCalibrationObservations: 20,
  minCalibrationYears: 5,
  minTrackCoverage: 0.5,
  moderateScore: 40,
  strongScore: 80,
  accelerationStep: 15,
} as const;

/** One transformed, scored series input. A missing input is absent, never zero. */
export interface SourceInput {
  sourceId: string;
  /** Period end of the oldest contributing observation. */
  asOf: string;
  /** Publisher release timestamp, or null when the publisher supplies none. */
  releasedAt: string | null;
  score: number;
  calibrationObservations: number;
  calibrationYears: number;
  reconstructed: boolean;
  provenance: Provenance;
}

export interface TrackSignal {
  id: string;
  region: RegionId;
  assetClass: AssetClassId;
  track: Track;
  score: number;
  evidenceKinds: EvidenceKind[];
  asOf: string;
  releasedAt: string | null;
  freshness: Freshness;
  confidence: Confidence;
  acceleration: Acceleration | null;
  configuredInputs: number;
  usableInputs: number;
  sourceIds: string[];
  reconstructed: boolean;
}

export interface MatrixCell {
  id: string;
  region: RegionId;
  assetClass: AssetClassId;
  state: MatrixState;
  flowTrend: TrackSignal | null;
  pressure: TrackSignal | null;
  confidence: Confidence | null;
  freshness: Freshness | null;
  asOf: string | null;
  /** Why a configured cell shows no defensible track. */
  note: string | null;
}

export interface SourceHealth {
  sourceId: string;
  status: Freshness | "failed";
  checkedAt: string;
  message: string | null;
}

export interface ReleaseManifest {
  schemaVersion: 1;
  methodologyVersion: string;
  release: string;
  generatedAt: string;
  dataThrough: string;
  liveSince: string | null;
  previousRelease: string | null;
  reconstructed: boolean;
  provenance: Provenance;
  sourceHealth: SourceHealth[];
}

const DAY = 86_400_000;

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY);
}

export function freshnessOf(source: SourceDefinition, asOf: string, dataThrough: string): Freshness {
  const age = daysBetween(asOf, dataThrough);
  if (age <= source.staleAfterDays) return "current";
  if (age <= source.expireAfterDays) return "stale";
  return "expired";
}

export function hasCalibration(input: SourceInput): boolean {
  return (
    input.calibrationObservations >= thresholds.minCalibrationObservations &&
    input.calibrationYears >= thresholds.minCalibrationYears
  );
}

export function accelerationFrom(score: number, previousScore: number | null): Acceleration | null {
  if (previousScore === null) return null;
  const change = score - previousScore;
  if (change >= thresholds.accelerationStep) return "increasing";
  if (change <= -thresholds.accelerationStep) return "decreasing";
  return "stable";
}

export function strengthBand(score: number): "ordinary" | "moderate" | "strong" {
  const magnitude = Math.abs(score);
  if (magnitude > thresholds.strongScore) return "strong";
  if (magnitude >= thresholds.moderateScore) return "moderate";
  return "ordinary";
}

export function formatScore(score: number): string {
  const rounded = roundScore(score);
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

function roundScore(score: number): number {
  return Math.round(score * 10) / 10;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

function labelTrack(track: Track): string {
  return track === "flowTrend" ? "flow" : "pressure";
}

const freshnessRank: Record<Freshness, number> = { current: 0, stale: 1, expired: 2 };
const confidenceRank: Record<Confidence, number> = { low: 0, medium: 1, high: 2 };

/**
 * Aggregates the eligible inputs of one track. Returns null when the track is not
 * configured, and a suppression reason when configured evidence fails the rules.
 */
export function deriveTrack(
  region: RegionId,
  assetClass: AssetClassId,
  track: Track,
  inputs: SourceInput[],
  dataThrough: string,
): { signal: TrackSignal | null; configured: number; reason: string | null } {
  const configured = sourcesFor(region, assetClass, track);
  if (configured.length === 0) return { signal: null, configured: 0, reason: null };

  const configuredIds = new Set(configured.map((source) => source.id));
  const candidates = inputs.filter((input) => configuredIds.has(input.sourceId));

  let thin = 0;
  let expired = 0;
  let carriedStale = false;
  const usable = candidates.filter((input) => {
    if (!hasCalibration(input)) {
      thin += 1;
      return false;
    }
    const freshness = freshnessOf(sourceById(input.sourceId), input.asOf, dataThrough);
    if (freshness === "expired") {
      expired += 1;
      return false;
    }
    if (freshness === "stale") carriedStale = true;
    return true;
  });

  const coverage = usable.length / configured.length;
  if (coverage < thresholds.minTrackCoverage) {
    const causes = [];
    if (expired) causes.push(`${expired} past its expiry window`);
    if (thin) causes.push(`${thin} without the required calibration history`);
    const missing = configured.length - candidates.length;
    if (missing) causes.push(`${missing} not reported in this release`);
    return {
      signal: null,
      configured: configured.length,
      reason:
        `Only ${usable.length} of ${configured.length} configured ${labelTrack(track)} inputs were usable ` +
        `(${causes.join(", ")}). Below the 50% coverage rule, so the track is suppressed rather than partly filled.`,
    };
  }

  const score = roundScore(median(usable.map((input) => input.score)));
  const signs = new Set(usable.map((input) => Math.sign(input.score)));
  const currentCount = usable.filter(
    (input) => freshnessOf(sourceById(input.sourceId), input.asOf, dataThrough) === "current",
  ).length;

  let confidence: Confidence;
  if (signs.size > 1 || carriedStale || thin > 0) confidence = "low";
  else if (currentCount >= 2 && usable.length === configured.length) confidence = "high";
  else confidence = "medium";

  const releasedDates = usable.map((input) => input.releasedAt).filter((value): value is string => value !== null);

  return {
    configured: configured.length,
    reason: null,
    signal: {
      id: `${region}:${assetClass}:${track}`,
      region,
      assetClass,
      track,
      score,
      // Oldest contributing period end: one fresh input must not make old evidence look current.
      asOf: usable.map((input) => input.asOf).sort()[0]!,
      releasedAt: releasedDates.length ? releasedDates.sort().at(-1)! : null,
      freshness: usable
        .map((input) => freshnessOf(sourceById(input.sourceId), input.asOf, dataThrough))
        .sort((a, b) => freshnessRank[b] - freshnessRank[a])[0]!,
      confidence,
      acceleration: null,
      evidenceKinds: [...new Set(usable.map((input) => sourceById(input.sourceId).evidenceKind))],
      configuredInputs: configured.length,
      usableInputs: usable.length,
      sourceIds: usable.map((input) => input.sourceId),
      reconstructed: usable.some((input) => input.reconstructed),
    },
  };
}

export function deriveCell(
  region: RegionId,
  assetClass: AssetClassId,
  inputs: SourceInput[],
  dataThrough: string,
): MatrixCell {
  const flow = deriveTrack(region, assetClass, "flowTrend", inputs, dataThrough);
  const press = deriveTrack(region, assetClass, "pressure", inputs, dataThrough);
  const shown = [flow.signal, press.signal].filter((signal): signal is TrackSignal => signal !== null);

  let state: MatrixState;
  if (flow.signal && press.signal) {
    const sign = Math.sign(flow.signal.score);
    // A zero score carries no direction, so it can never confirm the other track.
    state = sign !== 0 && sign === Math.sign(press.signal.score)
      ? sign > 0 ? "confirming-in" : "confirming-out"
      : "diverging";
  } else if (flow.signal) state = "flow-only";
  else if (press.signal) state = "pressure-only";
  else if (flow.configured + press.configured > 0) state = "insufficient";
  else state = "unavailable";

  return {
    id: `${region}:${assetClass}`,
    region,
    assetClass,
    state,
    flowTrend: flow.signal,
    pressure: press.signal,
    confidence: shown.length
      ? shown.map((signal) => signal.confidence).sort((a, b) => confidenceRank[a] - confidenceRank[b])[0]!
      : null,
    freshness: shown.length
      ? shown.map((signal) => signal.freshness).sort((a, b) => freshnessRank[b] - freshnessRank[a])[0]!
      : null,
    asOf: shown.length ? shown.map((signal) => signal.asOf).sort()[0]! : null,
    note:
      state === "insufficient"
        ? [flow.reason, press.reason].filter(Boolean).join(" ")
        : state === "unavailable"
          ? "No official v1 source is configured for this combination."
          : null,
  };
}

export function deriveCells(inputs: SourceInput[], dataThrough: string): MatrixCell[] {
  return regions.flatMap((region) =>
    assetClasses.map((assetClass) => deriveCell(region, assetClass, inputs, dataThrough)),
  );
}

export function deriveSourceHealth(inputs: SourceInput[], release: { dataThrough: string; generatedAt: string }): SourceHealth[] {
  return sources.map((source) => {
    const input = inputs.find((item) => item.sourceId === source.id);
    if (!input) {
      return { sourceId: source.id, status: "failed", checkedAt: release.generatedAt, message: "No input in this release." };
    }
    const status = freshnessOf(source, input.asOf, release.dataThrough);
    return {
      sourceId: source.id,
      status,
      checkedAt: release.generatedAt,
      message:
        status === "current"
          ? null
          : status === "stale"
            ? `Carried at its original as-of date ${input.asOf}.`
            : `Older than ${source.expireAfterDays} days; excluded from derivation.`,
    };
  });
}

/** Cell magnitude for ranking: the larger displayed track, never a blended score. */
export function cellMagnitude(cell: MatrixCell): number {
  return Math.max(Math.abs(cell.flowTrend?.score ?? 0), Math.abs(cell.pressure?.score ?? 0));
}

const regionOrder = new Map(regions.map((region, index) => [region, index]));
const assetOrder = new Map(assetClasses.map((assetClass, index) => [assetClass, index]));

/** Deterministic: magnitude first, then the registry's region and asset order. */
export function rankCells(cells: MatrixCell[]): MatrixCell[] {
  return [...cells].sort(
    (a, b) =>
      cellMagnitude(b) - cellMagnitude(a) ||
      regionOrder.get(a.region)! - regionOrder.get(b.region)! ||
      assetOrder.get(a.assetClass)! - assetOrder.get(b.assetClass)!,
  );
}

export interface BriefItem {
  kind: "Confirmed inflow" | "Confirmed outflow" | "Divergence";
  cellId: string;
  text: string;
}

const stateWord: Record<string, string> = {
  "confirming-in": "gathering",
  "confirming-out": "leaving",
};

/** Fixed selection order and fixed templates: identical inputs give identical text. */
export function deriveBrief(cells: MatrixCell[], labels: Record<string, string>): BriefItem[] {
  const eligible = (state: MatrixState) =>
    rankCells(cells).find((cell) => cell.state === state && cell.confidence !== "low");

  const items: BriefItem[] = [];
  const inflow = eligible("confirming-in");
  const outflow = eligible("confirming-out");
  const diverging = eligible("diverging");

  for (const [kind, cell] of [
    ["Confirmed inflow", inflow],
    ["Confirmed outflow", outflow],
  ] as const) {
    if (!cell) continue;
    items.push({
      kind,
      cellId: cell.id,
      text:
        `${labels[cell.region]} ${labels[cell.assetClass]!.toLowerCase()}: capital is ${stateWord[cell.state]} on both tracks ` +
        `(flow ${formatScore(cell.flowTrend!.score)}, pressure ${formatScore(cell.pressure!.score)}, ` +
        `${strengthBand(cellMagnitude(cell))} by convention), ${cell.confidence} confidence as of ${cell.asOf}.`,
    });
  }

  if (diverging) {
    items.push({
      kind: "Divergence",
      cellId: diverging.id,
      text:
        `${labels[diverging.region]} ${labels[diverging.assetClass]!.toLowerCase()}: measured flow ` +
        `${formatScore(diverging.flowTrend!.score)} disagrees with leading pressure ${formatScore(diverging.pressure!.score)}. ` +
        `The tracks are reported separately and are not averaged. As of ${diverging.asOf}.`,
    });
  }

  return items;
}
