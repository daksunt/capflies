import { Layout } from "../components/layout";
import { ScoreBar } from "../components/signal";
import { release, releaseInputs } from "../lib/current-release";
import { formatScore, label, sourceById } from "../lib/radar";

export default function Data() {
  return (
    <Layout title="Data">
      <section className="flow-board" aria-labelledby="page-title">
        <div className="flow-board-head"><h1 id="page-title">Data</h1><p>{release.dataThrough}</p></div>
        <div className="flow-cards data-cards">
          {releaseInputs.map((input) => {
            const source = sourceById(input.sourceId);
            const up = input.score > 0;
            return <article className={`flow-card tone-${up ? "positive" : "negative"}`} key={input.sourceId}>
              <span className="flow-arrow" aria-hidden="true">{up ? "↑" : "↓"}</span>
              <span className="flow-direction">{source.attribution}</span>
              <h2>{label[source.region]}<br />{label[source.assetClass]}</h2>
              <span className="flow-score">{formatScore(input.score)}</span><ScoreBar score={input.score} />
            </article>;
          })}
        </div>
      </section>
    </Layout>
  );
}
