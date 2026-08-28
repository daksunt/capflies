import { Layout } from "../components/layout";

export default function Methodology() {
  return (
    <Layout title="Methodology">
      <section className="hero narrow">
        <p className="eyebrow">Methodology</p>
        <h1>Evidence before precision</h1>
        <p>Capflies labels measured, constructed, positioning, and inferred evidence separately. It uses stale data only when the as-of date is visible.</p>
      </section>
      <section className="panel prose">
        <h2>How to read a cell</h2>
        <dl>
          <dt>Flow trend</dt><dd>Measured or transparent official construction.</dd>
          <dt>Pressure</dt><dd>Official positioning or market-derived leading evidence.</dd>
          <dt>Confirmed rotation</dt><dd>Both tracks agree; this is not a forecast or recommendation.</dd>
        </dl>
      </section>
    </Layout>
  );
}
