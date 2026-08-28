import { Layout } from "../components/layout";
import { assetClasses, cellFor, fixtureBrief, regions, type MatrixCell } from "../lib/radar";

function display(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}

function Cell({ cell }: { cell: MatrixCell }) {
  if (cell.state === "unavailable") return <span className="cell-unavailable">—</span>;

  return (
    <div className={`matrix-cell state-${cell.state}`}>
      <span>{cell.state.replace("-", " ")}</span>
      <strong>Flow {cell.flowTrend ? display(cell.flowTrend.score) : "—"}</strong>
      <strong>Pressure {cell.pressure ? display(cell.pressure.score) : "—"}</strong>
    </div>
  );
}

export default function Overview() {
  return (
    <Layout title="Global capital rotation">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Weekly fixture · 25 Aug 2026</p>
        <h1 id="page-title">Global capital rotation</h1>
        <p>Where capital is gathering, leaving, and accelerating. This first build uses clearly marked fixture data while official adapters are implemented.</p>
      </section>

      <section className="panel" aria-labelledby="matrix-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Rotation matrix</p>
            <h2 id="matrix-title">Flow trend and leading pressure</h2>
          </div>
          <p className="legend"><span className="dot positive" /> inflow <span className="dot negative" /> outflow <span className="dot warning" /> partial</p>
        </div>
        <div className="table-wrap">
          <table>
            <caption>Fixture matrix. Each supported cell keeps measured flow trend separate from leading pressure.</caption>
            <thead>
              <tr>
                <th scope="col">Region</th>
                {assetClasses.map((assetClass) => <th key={assetClass} scope="col">{assetClass.replace("-", " ")}</th>)}
              </tr>
            </thead>
            <tbody>
              {regions.map((region) => (
                <tr key={region}>
                  <th scope="row">{region}</th>
                  {assetClasses.map((assetClass) => <td key={assetClass}><Cell cell={cellFor(region, assetClass)} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="brief-grid" aria-label="Weekly brief">
        {fixtureBrief.map((item, index) => (
          <article className="brief-card" key={item}>
            <p className="eyebrow">{["Confirmed inflow", "Confirmed outflow", "Divergence"][index]}</p>
            <p>{item}</p>
          </article>
        ))}
      </section>
    </Layout>
  );
}
