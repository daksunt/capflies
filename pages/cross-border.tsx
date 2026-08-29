import { Layout } from "../components/layout";
import { CellLink, ScoreBar } from "../components/signal";
import { cells, releaseInputs } from "../lib/current-release";
import { formatScore, freshnessOf, label, sourceById } from "../lib/radar";
import { release as manifest } from "../lib/current-release";

/** Cross-border evidence: reported external flows and cross-border bank claims. */
const lanePublishers = new Set(["treasury-tic", "imf", "bis"]);

const lanes = releaseInputs
  .map((input) => ({ input, source: sourceById(input.sourceId) }))
  .filter(({ source }) => lanePublishers.has(source.publisher) && source.track === "flowTrend")
  .map((lane) => ({
    ...lane,
    freshness: freshnessOf(lane.source, lane.input.asOf, manifest.dataThrough),
    cell: cells.find((cell) => cell.region === lane.source.region && cell.assetClass === lane.source.assetClass)!,
  }))
  .sort(
    (a, b) =>
      Math.abs(b.input.score) - Math.abs(a.input.score) || a.source.id.localeCompare(b.source.id),
  );

export default function CrossBorder() {
  return (
    <Layout title="Cross-border flows">
      <section className="hero narrow">
        <p className="eyebrow">Cross-border</p>
        <h1>Capital moving between markets</h1>
        <p>
          Ranked official flow lanes: reported external portfolio flows and cross-border bank claims. These are
          aggregate positions by reporting economy, so Capflies ranks them as directional lanes and does not imply
          bilateral country-to-country precision the published data cannot support.
        </p>
      </section>

      <section className="panel" aria-labelledby="lanes-title">
        <p className="eyebrow">Ranked lanes</p>
        <h2 id="lanes-title">Strongest cross-border readings</h2>
        <div className="table-wrap">
          <table>
            <caption>
              One row per configured cross-border series in release {manifest.release}, ranked by absolute score. Rows
              marked expired are excluded from the matrix.
            </caption>
            <thead>
              <tr>
                <th scope="col">Lane</th>
                <th scope="col">Destination</th>
                <th scope="col">Score</th>
                <th scope="col">As of</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {lanes.map(({ input, source, freshness, cell }) => (
                <tr key={input.sourceId}>
                  <th scope="row">
                    {source.series}
                    <span className="muted small block">
                      {source.attribution} · {source.evidenceKind}
                    </span>
                  </th>
                  <td>
                    <CellLink cell={cell}>
                      {label[source.region]} {label[source.assetClass]!.toLowerCase()}
                    </CellLink>
                  </td>
                  <td className="num">
                    {formatScore(input.score)}
                    <ScoreBar score={input.score} />
                  </td>
                  <td>{input.asOf}</td>
                  <td className={freshness === "current" ? "muted" : "warn"}>{freshness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">
          Scores are signed historical extremity, not currency amounts. A lane with a strong score is unusual relative
          to its own ten-year history; it is not necessarily large in dollar terms.
        </p>
      </section>
    </Layout>
  );
}
