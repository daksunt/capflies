import { Layout } from "../components/layout";
import { CellLink, FreshnessNote, StateBadge, TrackReading } from "../components/signal";
import { cells } from "../lib/fixture-release";
import { label, regions, sourcesFor } from "../lib/radar";

const liquidityCells = regions
  .map((region) => cells.find((cell) => cell.region === region && cell.assetClass === "liquidity")!)
  .filter((cell) => cell.state !== "unavailable");

export default function Liquidity() {
  return (
    <Layout title="Liquidity">
      <section className="hero narrow">
        <p className="eyebrow">Liquidity</p>
        <h1>Global liquidity conditions</h1>
        <p>
          Central-bank balance sheets, official reserves, and cross-border credit aggregates. Liquidity is a constructed
          or measured stock change, never a positioning proxy, so most regions show a flow track only.
        </p>
      </section>

      {liquidityCells.map((cell) => (
        <section className="panel" key={cell.id} aria-labelledby={`${cell.id}-title`}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">{label[cell.region]}</p>
              <h2 id={`${cell.id}-title`}>
                <CellLink cell={cell}>{label[cell.region]} liquidity</CellLink>
              </h2>
            </div>
            <p className="legend">
              <StateBadge state={cell.state} /> <FreshnessNote freshness={cell.freshness} asOf={cell.asOf} />
            </p>
          </div>

          {cell.note ? <p className="notice">{cell.note}</p> : null}

          <div className="tracks">
            <TrackReading signal={cell.flowTrend} track="flowTrend" />
            <TrackReading signal={cell.pressure} track="pressure" />
          </div>

          <div className="table-wrap">
          <table className="detail-table">
            <caption>Contributing series configured for {label[cell.region]} liquidity.</caption>
            <thead>
              <tr>
                <th scope="col">Series</th>
                <th scope="col">Evidence</th>
                <th scope="col">Frequency</th>
                <th scope="col">Used this release</th>
              </tr>
            </thead>
            <tbody>
              {sourcesFor(cell.region, "liquidity").map((source) => {
                const used = cell.flowTrend?.sourceIds.includes(source.id) || cell.pressure?.sourceIds.includes(source.id);
                return (
                  <tr key={source.id}>
                    <th scope="row">
                      {source.series}
                      <span className="muted small block">{source.attribution} · {source.dataset}</span>
                    </th>
                    <td>{source.evidenceKind}</td>
                    <td>{source.frequency}</td>
                    <td>{used ? "yes" : "no"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </section>
      ))}
    </Layout>
  );
}
