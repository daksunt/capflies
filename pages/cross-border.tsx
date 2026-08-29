import { Layout } from "../components/layout";
import { ScoreBar } from "../components/signal";
import { release, releaseInputs } from "../lib/current-release";
import { formatScore, sourceById } from "../lib/radar";

const names: Record<string, string> = {
  "tic-equities-us": "United States\nEquities",
  "tic-treasuries-us": "United States\nTreasuries",
  "tic-agency-us": "United States\nAgency bonds",
  "tic-corporate-us": "United States\nCorporate bonds",
  "tic-europe-us-securities": "Europe →\nUnited States",
  "tic-asia-us-securities": "Asia →\nUnited States",
  "tic-japan-us-securities": "Japan →\nUnited States",
  "tic-china-us-securities": "China →\nUnited States",
  "tic-india-us-securities": "India →\nUnited States",
  "tic-south-korea-us-securities": "South Korea →\nUnited States",
  "tic-hong-kong-us-securities": "Hong Kong →\nUnited States",
  "tic-singapore-us-securities": "Singapore →\nUnited States",
  "tic-taiwan-us-securities": "Taiwan →\nUnited States",
  "tic-malaysia-us-securities": "Malaysia →\nUnited States",
  "tic-indonesia-us-securities": "Indonesia →\nUnited States",
  "tic-philippines-us-securities": "Philippines →\nUnited States",
  "tic-saudi-arabia-us-securities": "Saudi Arabia →\nUnited States",
  "tic-uae-us-securities": "UAE →\nUnited States",
  "tic-kuwait-us-securities": "Kuwait →\nUnited States",
  "tic-israel-us-securities": "Israel →\nUnited States",
  "tic-russia-us-securities": "Russia →\nUnited States",
  "tic-turkey-us-securities": "Turkey →\nUnited States",
  "tic-latin-america-us-securities": "Latin America →\nUnited States",
  "tic-argentina-us-securities": "Argentina →\nUnited States",
  "tic-brazil-us-securities": "Brazil →\nUnited States",
  "tic-chile-us-securities": "Chile →\nUnited States",
  "tic-colombia-us-securities": "Colombia →\nUnited States",
  "tic-mexico-us-securities": "Mexico →\nUnited States",
  "tic-peru-us-securities": "Peru →\nUnited States",
  "tic-africa-us-securities": "Africa →\nUnited States",
  "tic-south-africa-us-securities": "South Africa →\nUnited States",
  "tic-canada-us-securities": "Canada →\nUnited States",
  "tic-uk-us-securities": "United Kingdom →\nUnited States",
  "tic-germany-us-securities": "Germany →\nUnited States",
  "tic-france-us-securities": "France →\nUnited States",
  "tic-switzerland-us-securities": "Switzerland →\nUnited States",
  "tic-australia-us-securities": "Australia →\nUnited States",
  "tic-new-zealand-us-securities": "New Zealand →\nUnited States",
  "tic-lebanon-us-securities": "Lebanon →\nUnited States",
  "tic-us-europe-securities": "United States →\nEurope",
  "tic-us-asia-securities": "United States →\nAsia",
  "tic-us-japan-securities": "United States →\nJapan",
  "tic-us-china-securities": "United States →\nChina",
  "tic-us-india-securities": "United States →\nIndia",
  "tic-us-uae-securities": "United States →\nUAE",
  "tic-us-russia-securities": "United States →\nRussia",
  "tic-us-latin-america-securities": "United States →\nLatin America",
  "tic-us-brazil-securities": "United States →\nBrazil",
  "tic-us-mexico-securities": "United States →\nMexico",
  "tic-us-africa-securities": "United States →\nAfrica",
  "tic-us-south-africa-securities": "United States →\nSouth Africa",
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
