/** Fetch selected public FRED series and save only derived, checksummed observations. */
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { impulses, parseFredCsv, rollingFlows, scoreLatest } from "../lib/fred.ts";

const root = path.resolve(import.meta.dirname, "..");
const catalog = [
  { id: "WALCL", transform: "stock-change-13w", relative: true, unit: "millions of USD" },
  { id: "RRPONTSYD", transform: "stock-change-13w", relative: true, unit: "billions of USD" },
  { id: "DGS10", transform: "yield-change-13w", relative: false, unit: "percent" },
  { id: "ECBASSETSW", transform: "stock-change-13w", relative: true, unit: "millions of EUR" },
  { id: "JPNASSETS", transform: "stock-change-13w", relative: true, unit: "billions of JPY" },
  { id: "FORLTEQTYNET69995", transform: "signed-flow-3m", flow: true, unit: "millions of USD" },
  { id: "FORLTTREASNET69995", transform: "signed-flow-3m", flow: true, unit: "millions of USD" },
  { id: "FORLTAGCYNET69995", transform: "signed-flow-3m", flow: true, unit: "millions of USD" },
  { id: "FORLTCORPNET69995", transform: "signed-flow-3m", flow: true, unit: "millions of USD" },
  { id: "FORLTTOTALNET19992", transform: "signed-flow-3m", flow: true, unit: "millions of USD" },
  { id: "FORLTTOTALNET49999", transform: "signed-flow-3m", flow: true, unit: "millions of USD" },
  { id: "FORLTTOTALNET42609", transform: "signed-flow-3m", flow: true, unit: "millions of USD" },
  { id: "FORLTTOTALNET41408", transform: "signed-flow-3m", flow: true, unit: "millions of USD" },
];

async function fetchSeries(definition) {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${definition.id}`;
  const response = await fetch(url, { redirect: "error", headers: { accept: "text/csv" } });
  if (!response.ok || new URL(response.url).hostname !== "fred.stlouisfed.org") throw new Error(`FRED request failed for ${definition.id}`);
  const text = await response.text();
  const points = parseFredCsv(text, definition.id);
  const history = definition.flow ? rollingFlows(points) : impulses(points, definition.relative);
  const latest = history.at(-1);
  if (!latest) throw new Error(`No derived history for ${definition.id}`);
  const derived = scoreLatest(history);
  return {
    ...definition,
    url,
    checksum: createHash("sha256").update(text).digest("hex"),
    periodEnd: latest.date,
    impulse: derived.impulse,
    score: derived.score,
    calibrationObservations: derived.calibrationObservations,
    calibrationYears: derived.calibrationYears,
  };
}

const sources = await Promise.all(catalog.map(fetchSeries));
// The release clock is its newest selected observation; individual inputs retain
// their own as-of dates and are judged against this clock for freshness.
const dataThrough = sources.map((source) => source.periodEnd).sort().at(-1);
const output = {
  schemaVersion: 1,
  provenance: "official",
  publisher: "Federal Reserve Bank of St. Louis FRED",
  retrievedAt: new Date().toISOString(),
  dataThrough,
  sources,
};
await mkdir(path.join(root, "data"), { recursive: true });
await writeFile(path.join(root, "data", "official.json"), JSON.stringify(output, null, 2) + "\n");
console.log(`Refreshed ${sources.length} official FRED series through ${dataThrough}.`);
