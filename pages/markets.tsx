import { Layout } from "../components/layout";
import { ScoreBar } from "../components/signal";
import { cells, release } from "../lib/current-release";
import { cellMagnitude, formatScore, label, rankCells } from "../lib/radar";

const markets = rankCells(cells.filter((cell) => cell.assetClass !== "liquidity" && cell.flowTrend))
  .filter((cell) => cellMagnitude(cell) > 0);

export default function Markets() {
  return (
    <Layout title="Markets">
      <section className="flow-board" aria-labelledby="page-title">
        <div className="flow-board-head"><h1 id="page-title">Markets</h1><p>{release.dataThrough}</p></div>
        <div className="flow-cards">
          {markets.map((cell) => {
            const score = cell.flowTrend!.score;
            const up = score > 0;
            return <article className={`flow-card tone-${up ? "positive" : "negative"}`} key={cell.id}>
              <span className="flow-arrow" aria-hidden="true">{up ? "↑" : "↓"}</span>
              <span className="flow-direction">{up ? "MONEY MOVING IN" : "MONEY MOVING OUT"}</span>
              <h2>{label[cell.region]}<br />{label[cell.assetClass]}</h2>
              <span className="flow-score">{formatScore(score)}</span><ScoreBar score={score} />
            </article>;
          })}
        </div>
      </section>
    </Layout>
  );
}
