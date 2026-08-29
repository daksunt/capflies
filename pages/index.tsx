import { Layout } from "../components/layout";
import { Matrix, RankedList } from "../components/matrix";
import { downloads } from "../lib/artifacts";
import { brief, cells, release } from "../lib/fixture-release";
import { cellMagnitude, rankCells } from "../lib/radar";

const supported = cells.filter((cell) => cell.state !== "unavailable");
const ranked = rankCells(supported).filter((cell) => cellMagnitude(cell) > 0);
const counts = {
  supported: supported.length,
  total: cells.length,
  suppressed: cells.filter((cell) => cell.state === "insufficient").length,
};

export default function Overview() {
  return (
    <Layout title="Global capital rotation">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Release {release.release} · data through {release.dataThrough}</p>
        <h1 id="page-title">Global capital rotation</h1>
        <p>
          Where capital appears to be gathering, leaving, or accelerating over weeks and months. Measured movement and
          leading pressure are shown as two separate tracks, and a cell only claims a rotation when both agree.
        </p>
      </section>

      <section className="panel" aria-labelledby="matrix-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Rotation matrix</p>
            <h2 id="matrix-title">Flow trend and leading pressure</h2>
          </div>
          <p className="legend">
            <span className="key">F</span> flow trend <span className="key">P</span> pressure · scores are signed
            historical extremity from −100 to +100
          </p>
        </div>
        <Matrix cells={cells} />
        <p className="muted small">
          {counts.supported} of {counts.total} combinations have a configured v1 source. {counts.suppressed} are
          suppressed as insufficient this week. Unsupported combinations stay visible as unavailable rather than being
          hidden.
        </p>
      </section>

      <section className="panel" aria-labelledby="brief-title">
        <p className="eyebrow">Weekly brief</p>
        <h2 id="brief-title">What the release says</h2>
        <div className="brief-grid">
          {brief.map((item) => (
            <article className="brief-card" key={item.kind}>
              <p className="eyebrow">{item.kind}</p>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <p className="muted small">
          The brief is generated from fixed templates and a fixed selection order, so identical evidence always produces
          identical text. Categories with no qualifying cell are omitted rather than padded.
        </p>
      </section>

      <section className="panel" aria-labelledby="ranked-title">
        <p className="eyebrow">Strongest movements</p>
        <h2 id="ranked-title">Ranked by the larger of the two tracks</h2>
        <RankedList cells={ranked} limit={8} />
        <p className="muted small">
          Ranking uses the larger absolute track score and never a blended flow/pressure composite. Ties resolve by the
          registry's region and asset order.
        </p>
      </section>

      <section className="panel" aria-labelledby="downloads-title">
        <p className="eyebrow">Artifacts</p>
        <h2 id="downloads-title">Download this release</h2>
        <p className="muted">
          <a href={downloads.cells} download>
            cells.csv
          </a>{" "}
          ·{" "}
          <a href={downloads.inputs} download>
            inputs.csv
          </a>{" "}
          ·{" "}
          <a href={downloads.manifest} download>
            release.json
          </a>{" "}
          ·{" "}
          <a href={downloads.current}>current.json</a>
        </p>
      </section>
    </Layout>
  );
}
