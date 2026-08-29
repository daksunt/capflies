import { Layout } from "../components/layout";
import { RankedList } from "../components/matrix";
import { CellLink, FreshnessNote, StateBadge } from "../components/signal";
import { cells } from "../lib/fixture-release";
import { assetClasses, formatScore, label, rankCells, type AssetClassId } from "../lib/radar";

const marketClasses = assetClasses.filter((assetClass) => assetClass !== "liquidity");

function rowsFor(assetClass: AssetClassId) {
  return rankCells(cells.filter((cell) => cell.assetClass === assetClass && cell.state !== "unavailable"));
}

export default function Markets() {
  const populated = marketClasses.filter((assetClass) => rowsFor(assetClass).length > 0);

  return (
    <Layout title="Markets">
      <section className="hero narrow">
        <p className="eyebrow">Markets</p>
        <h1>Regional market rotation</h1>
        <p>
          Compare regions within an asset class. Flow and pressure stay in separate columns: a positive pressure reading
          beside a negative flow reading is a divergence to inspect, not a number to average away.
        </p>
      </section>

      {populated.map((assetClass) => (
        <section className="panel" key={assetClass} aria-labelledby={`${assetClass}-title`}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Asset class</p>
              <h2 id={`${assetClass}-title`}>{label[assetClass]}</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <caption>{label[assetClass]} by region, ranked by the larger of the two tracks.</caption>
              <thead>
                <tr>
                  <th scope="col">Region</th>
                  <th scope="col">State</th>
                  <th scope="col">Flow</th>
                  <th scope="col">Pressure</th>
                  <th scope="col">Confidence</th>
                  <th scope="col">Freshness</th>
                </tr>
              </thead>
              <tbody>
                {rowsFor(assetClass).map((cell) => (
                  <tr key={cell.id}>
                    <th scope="row">
                      <CellLink cell={cell}>{label[cell.region]}</CellLink>
                    </th>
                    <td>
                      <StateBadge state={cell.state} />
                    </td>
                    <td className="num">{cell.flowTrend ? formatScore(cell.flowTrend.score) : "—"}</td>
                    <td className="num">{cell.pressure ? formatScore(cell.pressure.score) : "—"}</td>
                    <td>{cell.confidence ?? "—"}</td>
                    <td>
                      <FreshnessNote freshness={cell.freshness} asOf={cell.asOf} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="panel" aria-labelledby="all-markets-title">
        <p className="eyebrow">All market cells</p>
        <h2 id="all-markets-title">Ranked list</h2>
        <RankedList cells={rankCells(cells.filter((cell) => cell.assetClass !== "liquidity" && cell.state !== "unavailable"))} />
      </section>
    </Layout>
  );
}
