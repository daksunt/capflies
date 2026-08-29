/** Minimal, strict parser and scorer for public FRED graph CSV series. */
export interface FredPoint { date: string; value: number }

export function parseFredCsv(text: string, id: string): FredPoint[] {
  const [header, ...rows] = text.trim().split(/\r?\n/);
  if (header !== `observation_date,${id}`) throw new Error(`Unexpected FRED header for ${id}: ${header}`);

  const points: FredPoint[] = [];
  for (const row of rows) {
    const comma = row.indexOf(",");
    if (comma < 0) throw new Error(`Malformed FRED row for ${id}`);
    const date = row.slice(0, comma);
    const raw = row.slice(comma + 1);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Invalid FRED date for ${id}: ${date}`);
    if (raw === "") continue; // FRED marks non-observation business days as blank.
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new Error(`Invalid FRED value for ${id} on ${date}`);
    points.push({ date, value });
  }
  if (points.length < 300) throw new Error(`Too little usable history for ${id}`);
  for (let index = 1; index < points.length; index += 1) {
    if (points[index - 1]!.date >= points[index]!.date) throw new Error(`Unsorted or duplicate FRED dates for ${id}`);
  }
  return points;
}

function dayNumber(date: string) { return Date.parse(`${date}T00:00:00Z`); }

/** Last value on or before the requested lag date; never looks ahead. */
export function pointAtOrBefore(points: FredPoint[], target: string, before: number): FredPoint | null {
  const targetMs = dayNumber(target);
  for (let index = before; index >= 0; index -= 1) {
    if (dayNumber(points[index]!.date) <= targetMs) return points[index]!;
  }
  return null;
}

export type Impulse = { date: string; value: number };

/** A 13-week percentage stock change, or signed yield change when `relative` is false. */
export function impulses(points: FredPoint[], relative: boolean, lagDays = 91): Impulse[] {
  return points.flatMap((point, index) => {
    const lag = pointAtOrBefore(points, new Date(dayNumber(point.date) - lagDays * 86_400_000).toISOString().slice(0, 10), index - 1);
    if (!lag || (relative && lag.value === 0)) return [];
    return [{ date: point.date, value: relative ? (point.value - lag.value) / Math.abs(lag.value) : lag.value - point.value }];
  });
}

export function scoreLatest(history: Impulse[], latestDate = history.at(-1)?.date): { impulse: number; score: number; calibrationObservations: number; calibrationYears: number } {
  if (!latestDate) throw new Error("No impulse history");
  const latest = history.find((item) => item.date === latestDate);
  if (!latest) throw new Error(`No impulse on ${latestDate}`);
  const earliest = new Date(dayNumber(latestDate));
  earliest.setUTCFullYear(earliest.getUTCFullYear() - 10);
  const reference = history.filter((item) => item.date < latestDate && item.date >= earliest.toISOString().slice(0, 10));
  if (reference.length < 20) throw new Error("Insufficient prior calibration history");
  const fiveYearsEarlier = new Date(dayNumber(latestDate));
  fiveYearsEarlier.setUTCFullYear(fiveYearsEarlier.getUTCFullYear() - 5);
  if (reference[0]!.date > fiveYearsEarlier.toISOString().slice(0, 10)) throw new Error("Insufficient calibration span");
  const percentile = reference.filter((item) => Math.abs(item.value) <= Math.abs(latest.value)).length / reference.length;
  const calibrationYears = Math.floor((dayNumber(latestDate) - dayNumber(reference[0]!.date)) / 365.25 / 86_400_000);
  return { impulse: latest.value, score: Math.sign(latest.value) * Math.round(percentile * 1000) / 10, calibrationObservations: reference.length, calibrationYears };
}
