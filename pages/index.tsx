import Link from "next/link";
import { Layout } from "../components/layout";
import { Matrix, RankedList } from "../components/matrix";
import { CellLink, ScoreBar, StateBadge } from "../components/signal";
import { downloads } from "../lib/artifacts";
import { brief, cellFor, cells, release } from "../lib/fixture-release";
import { cellMagnitude, formatScore, label, rankCells } from "../lib/radar";

const supported = cells.filter((cell) => cell.state !== "unavailable");
const ranked = rankCells(supported).filter((cell) => cellMagnitude(cell) > 0);
const counts = {
  supported: supported.length,
  total: cells.length,
  suppressed: cells.filter((cell) => cell.state === "insufficient").length,
};

const takeaway = {
  "Confirmed inflow": "Money is moving in",
  "Confirmed outflow": "Money is moving out",
  Divergence: "The signals disagree",
} as const;

function trackSentence(flow: number | undefined, pressure: number | undefined) {
  if (flow !== undefined && pressure !== undefined) return `Cash-flow evidence is ${formatScore(flow)} while forward-looking pressure is ${formatScore(pressure)}.`;
  if (flow !== undefined) return `The measured-flow signal is ${formatScore(flow)}. There is no defensible pressure signal yet.`;
  return `The leading-pressure signal is ${formatScore(pressure!)}. There is no measured-flow signal yet.`;
}

export default function Overview() {
  return (
    <Layout title="Global capital rotation">
      <section className="front-hero" aria-labelledby="page-title">
        <div className="front-hero-copy">
          <p className="kicker">Capital flows, made legible</p>
          <h1 id="page-title">Follow the money.<br />Keep the doubt.</h1>
          <p className="front-lede">Capflies separates <strong>where money has actually moved</strong> from <strong>where markets are leaning next</strong>. Start with the three signals below; use the map only when you want the full picture.</p>
          <div className="hero-meta"><span>Release {release.release}</span><span>Evidence through {release.dataThrough}</span><span>Research, not a trade call</span></div>
        </div>
        <aside className="orientation-card" aria-label="How to read Capflies">
          <p className="eyebrow">Read this first</p><h2>Two questions. One view.</h2>
          <ol>
            <li><b>Did capital move?</b><span>Flow is reported or transparently constructed evidence.</span></li>
            <li><b>Is pressure building?</b><span>Positioning and market signals can lead — or contradict — flow.</span></li>
            <li><b>Do they agree?</b><span>Agreement is confirmation. Disagreement is your cue to investigate.</span></li>
          </ol>
        </aside>
      </section>

      <section className="story-section" aria-labelledby="story-title">
        <div className="section-intro"><p className="kicker">The short version</p><h2 id="story-title">What this release is saying</h2><p>These are the only three things you need to take away before opening the detailed map.</p></div>
        <div className="story-grid">
          {brief.map((item, index) => {
            const cell = cellFor(item.cellId)!;
            return (
              <article className={`story-card story-card-${index + 1}`} key={item.kind}>
                <p className="story-index">0{index + 1}</p><p className="story-label">{takeaway[item.kind]}</p>
                <h3>{label[cell.region]} {label[cell.assetClass]!.toLowerCase()}</h3><StateBadge state={cell.state} />
                <p className="story-copy">{trackSentence(cell.flowTrend?.score, cell.pressure?.score)}</p>
                <div className="story-bars" aria-label={trackSentence(cell.flowTrend?.score, cell.pressure?.score)}>
                  {cell.flowTrend ? <span><small>Observed flow</small><b>{formatScore(cell.flowTrend.score)}</b><ScoreBar score={cell.flowTrend.score} /></span> : null}
                  {cell.pressure ? <span><small>Market pressure</small><b>{formatScore(cell.pressure.score)}</b><ScoreBar score={cell.pressure.score} /></span> : null}
                </div>
                <CellLink cell={cell} className="story-link">See the evidence <span aria-hidden="true">→</span></CellLink>
              </article>
            );
          })}
        </div>
      </section>

      <section className="reading-guide" aria-labelledby="guide-title">
        <div><p className="kicker">A small translation guide</p><h2 id="guide-title">What the colours and scores mean</h2></div>
        <div className="guide-items">
          <p><i className="guide-mark guide-positive" /> <b>Positive</b> means an unusually supportive reading versus that series’ own history.</p>
          <p><i className="guide-mark guide-negative" /> <b>Negative</b> means an unusually adverse reading. It is not a price forecast.</p>
          <p><i className="guide-mark guide-neutral" /> <b>Split signals</b> mean “wait and look closer,” not “average the two numbers.”</p>
        </div>
      </section>

      <section className="map-section" aria-labelledby="matrix-title">
        <div className="section-heading map-heading"><div><p className="kicker">The full map</p><h2 id="matrix-title">Where the evidence is pointing</h2></div><p className="legend"><span className="key">F</span> observed flow <span className="key">P</span> market pressure</p></div>
        <p className="map-explainer">Read across a row to see a region. Read down a column to compare an asset class. Select any available cell to see its evidence, dates and limits.</p>
        <Matrix cells={cells} />
        <p className="muted small">{counts.supported} of {counts.total} combinations have a configured source. {counts.suppressed} are intentionally hidden as insufficient rather than guessed.</p>
      </section>

      <section className="secondary-grid">
        <section className="ranked-section" aria-labelledby="ranked-title"><p className="kicker">Zoom out</p><h2 id="ranked-title">The biggest moves</h2><p className="muted">Ranked by the stronger of the two tracks — never a blended score.</p><RankedList cells={ranked} limit={6} /></section>
        <section className="method-card" aria-labelledby="method-title"><p className="kicker">Before you act on a chart</p><h2 id="method-title">Capflies is a research instrument, not an oracle.</h2><p>It uses dated public evidence and shows when it is thin, stale or unavailable. It does not tell you what to buy, sell or expect next.</p><Link href="/methodology">Read the method <span aria-hidden="true">→</span></Link></section>
      </section>

      <section className="downloads-strip" aria-labelledby="downloads-title">
        <div><p className="kicker">For your own work</p><h2 id="downloads-title">Take the release with you</h2></div>
        <p><a href={downloads.cells} download>cells.csv</a><span>cell-level signals</span><a href={downloads.inputs} download>inputs.csv</a><span>underlying inputs</span><a href={downloads.manifest} download>release.json</a><span>release record</span><a href={downloads.current}>current.json</a></p>
      </section>
    </Layout>
  );
}
