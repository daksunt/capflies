import { Layout } from "../components/layout";
import { ScoreBar } from "../components/signal";
import { release, releaseInputs } from "../lib/current-release";
import { formatScore, sourceById } from "../lib/radar";

const names: Record<string, string> = {
  "tic-equities-us": "United States\nEquities",
  "tic-treasuries-us": "United States\nTreasuries",
  "tic-agency-us": "United States\nAgency bonds",
  "tic-corporate-us": "United States\nCorporate bonds",
};
const flows = releaseInputs
  .filter((input) => input.sourceId in names && sourceById(input.sourceId).track === "flowTrend")
  .sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

export default function CrossBorder() {
  return (
    <Layout title="Flows">
      <section className="flow-board" aria-labelledby="page-title">
        <div className="flow-board-head"><h1 id="page-title">Cross-border flows</h1><p>{release.dataThrough}</p></div>
        <div className="flow-cards">
          {flows.map((flow) => {
            const up = flow.score > 0;
            return <article className={`flow-card tone-${up ? "positive" : "negative"}`} key={flow.sourceId}>
              <span className="flow-arrow" aria-hidden="true">{up ? "↑" : "↓"}</span>
              <span className="flow-direction">{up ? "MONEY MOVING IN" : "MONEY MOVING OUT"}</span>
              <h2>{names[flow.sourceId]!.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h2>
              <span className="flow-score">{formatScore(flow.score)}</span><ScoreBar score={flow.score} />
            </article>;
          })}
        </div>
      </section>
    </Layout>
  );
}
