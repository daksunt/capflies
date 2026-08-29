import { Layout } from "../components/layout";
import { CellLink, ScoreBar } from "../components/signal";
import { cells, release } from "../lib/current-release";
import { cellMagnitude, formatScore, label, rankCells } from "../lib/radar";

const moves = rankCells(cells.filter((cell) => cell.flowTrend))
  .filter((cell) => cellMagnitude(cell) > 0);

function words(cell: (typeof moves)[number]) {
  const into = cell.flowTrend!.score > 0;
  if (cell.assetClass === "liquidity") {
    return { arrow: into ? "↑" : "↓", direction: into ? "LIQUIDITY GROWING" : "LIQUIDITY SHRINKING", tone: into ? "positive" : "negative" };
  }
  return { arrow: into ? "↑" : "↓", direction: into ? "MONEY MOVING IN" : "MONEY MOVING OUT", tone: into ? "positive" : "negative" };
}

export default function Overview() {
  return (
    <Layout title="Where money is moving">
      <section className="flow-board" aria-labelledby="page-title">
        <div className="flow-board-head">
          <h1 id="page-title">Where money is moving</h1>
          <p>{release.dataThrough}</p>
        </div>
        <div className="flow-cards">
          {moves.map((cell) => {
            const flow = cell.flowTrend!;
            const copy = words(cell);
            return (
              <CellLink cell={cell} className={`flow-card tone-${copy.tone}`} key={cell.id}>
                <span className="flow-arrow" aria-hidden="true">{copy.arrow}</span>
                <span className="flow-direction">{copy.direction}</span>
                <h2>{label[cell.region]}<br />{label[cell.assetClass]}</h2>
                <span className="flow-score">{formatScore(flow.score)}</span>
                <ScoreBar score={flow.score} />
              </CellLink>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
