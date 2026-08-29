import { Layout } from "../components/layout";
import { ScoreBar } from "../components/signal";
import { cells, release } from "../lib/current-release";
import { formatScore, label, regions } from "../lib/radar";

const items = regions
  .map((region) => cells.find((cell) => cell.region === region && cell.assetClass === "liquidity"))
  .filter((cell): cell is NonNullable<typeof cell> => Boolean(cell?.flowTrend));

export default function Liquidity() {
  return (
    <Layout title="Liquidity">
      <section className="flow-board" aria-labelledby="page-title">
        <div className="flow-board-head"><h1 id="page-title">Liquidity</h1><p>{release.dataThrough}</p></div>
        <div className="flow-cards">
          {items.map((cell) => {
            const score = cell.flowTrend!.score;
            const up = score > 0;
            return <article className={`flow-card tone-${up ? "positive" : "negative"}`} key={cell.id}>
              <span className="flow-arrow" aria-hidden="true">{up ? "↑" : "↓"}</span>
              <span className="flow-direction">{up ? "LIQUIDITY GROWING" : "LIQUIDITY SHRINKING"}</span>
              <h2>{label[cell.region]}</h2><span className="flow-score">{formatScore(score)}</span><ScoreBar score={score} />
            </article>;
          })}
        </div>
      </section>
    </Layout>
  );
}
