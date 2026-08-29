import { cells, fixtureInputs, release } from "./fixture-release.ts";
import { sourceById, type MatrixCell, type SourceInput } from "./radar.ts";

export const releaseDir = `data/v1/releases/${release.release}`;
export const currentPath = "data/v1/current.json";

/**
 * Artifacts live in public/ and are linked with plain anchors, which Next does
 * not rewrite for `basePath`. Prefix them ourselves so the same links resolve
 * at the root locally and under /capflies on GitHub Pages.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const downloads = {
  manifest: `${basePath}/${releaseDir}/release.json`,
  cells: `${basePath}/${releaseDir}/cells.csv`,
  inputs: `${basePath}/${releaseDir}/inputs.csv`,
  current: `${basePath}/${currentPath}`,
};

function csv(header: string[], rows: (string | number | null)[][]): string {
  const cell = (value: string | number | null) => {
    const text = value === null ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [header, ...rows].map((row) => row.map(cell).join(",")).join("\n") + "\n";
}

export function cellsCsv(source: MatrixCell[] = cells): string {
  return csv(
    ["region", "asset_class", "state", "flow_score", "pressure_score", "confidence", "freshness", "as_of", "provenance"],
    source.map((item) => [
      item.region,
      item.assetClass,
      item.state,
      item.flowTrend?.score ?? null,
      item.pressure?.score ?? null,
      item.confidence,
      item.freshness,
      item.asOf,
      release.provenance,
    ]),
  );
}

export function inputsCsv(source: SourceInput[] = fixtureInputs): string {
  return csv(
    ["source_id", "publisher", "region", "asset_class", "track", "evidence_kind", "transform", "as_of", "released_at", "score", "calibration_observations", "calibration_years", "reconstructed", "provenance"],
    source.map((input) => {
      const definition = sourceById(input.sourceId);
      return [
        input.sourceId,
        definition.publisher,
        definition.region,
        definition.assetClass,
        definition.track,
        definition.evidenceKind,
        definition.transform,
        input.asOf,
        input.releasedAt,
        input.score,
        input.calibrationObservations,
        input.calibrationYears,
        String(input.reconstructed),
        input.provenance,
      ];
    }),
  );
}

export function manifestJson(artifacts: Array<{ path: string; sha256: string }>): string {
  return JSON.stringify({ ...release, cells, artifacts }, null, 2) + "\n";
}

export function currentJson(manifestSha256: string): string {
  return (
    JSON.stringify(
      {
        schemaVersion: 1,
        release: release.release,
        provenance: release.provenance,
        manifestPath: downloads.manifest,
        manifestSha256,
      },
      null,
      2,
    ) + "\n"
  );
}
