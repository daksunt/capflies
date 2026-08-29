import assert from "node:assert/strict";
import test from "node:test";
import { impulses, parseFredCsv, scoreLatest } from "../lib/fred.ts";

test("FRED parser rejects malformed values and ignores blank non-observation days", () => {
  const rows = ["observation_date,TEST"];
  for (let day = 1; day <= 320; day += 1) rows.push(`2020-01-${String((day % 28) + 1).padStart(2, "0")},${day}`);
  assert.throws(() => parseFredCsv(rows.join("\n"), "TEST"), /Unsorted/);
  assert.throws(() => parseFredCsv("observation_date,TEST\n2020-01-01,nope", "TEST"), /Invalid/);
});

test("latest score only calibrates against strictly earlier impulses", () => {
  const history = Array.from({ length: 25 }, (_, index) => ({ date: `202${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}-01`, value: index + 1 }));
  const result = scoreLatest(history);
  assert.equal(result.impulse, 25);
  assert.equal(result.calibrationObservations, 24);
  assert.equal(result.score, 100);
});

test("impulses use an earlier value and never a later value", () => {
  const points = Array.from({ length: 120 }, (_, index) => ({ date: new Date(Date.UTC(2020, 0, 1 + index)).toISOString().slice(0, 10), value: index + 100 }));
  const result = impulses(points, true);
  assert.ok(result.length > 0);
  assert.ok(result.every((item) => Number.isFinite(item.value)));
});
