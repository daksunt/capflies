import { Layout } from "../components/layout";
import { downloads } from "../lib/artifacts";
import { release } from "../lib/fixture-release";
import { label, publishers, sources, thresholds } from "../lib/radar";

const evidence: Array<[string, string]> = [
  ["measured", "An official publisher's reported economic flow or stock."],
  ["constructed", "A transparent calculation from official observations, such as Fed assets less the Treasury General Account and ON RRP."],
  ["positioning", "Official futures positioning, used as pressure and never described as cash flow."],
  ["inferred", "An official price or yield transformed into directional pressure."],
];

const states: Array<[string, string]> = [
  ["confirming-in", "Both tracks exist, are positive, and agree."],
  ["confirming-out", "Both tracks exist, are negative, and agree."],
  ["diverging", "Both tracks exist and disagree, or one carries no direction."],
  ["flow-only", "Only the flow track is defensible."],
  ["pressure-only", "Only the pressure track is defensible."],
  ["insufficient", "Sources are configured, but the evidence fails the coverage, history, or freshness rules."],
  ["unavailable", "No v1 source is configured for this combination."],
];

const transforms: Array<[string, string]> = [
  ["signed-flow", "The published signed flow, summed over the configured horizon."],
  ["stock-change-13w", "13-week percentage change of a balance or liquidity stock."],
  ["position-change-4w", "Four-week change in (long − short) / open interest."],
  ["price-return-13w", "13-week percentage return; always labelled inferred."],
  ["yield-change-13w", "Negative 13-week yield change, so falling yields map to positive duration pressure; always labelled inferred."],
];

export default function Methodology() {
  const unhealthy = release.sourceHealth.filter((health) => health.status !== "current");

  return (
    <Layout title="Methodology">
      <section className="hero narrow">
        <p className="eyebrow">Methodology {release.methodologyVersion}</p>
        <h1>Evidence before precision</h1>
        <p>
          Capflies labels measured, constructed, positioning, and inferred evidence separately, keeps flow and pressure
          on independent tracks, and uses stale data only while its as-of date is visible.
        </p>
      </section>

      <section className="panel prose" id="status" aria-labelledby="status-title">
        <p className="eyebrow">Data status</p>
        <h2 id="status-title">This release is fixture data</h2>
        <p>
          Release {release.release} carries <code>provenance: "{release.provenance}"</code>. Its scores were written by
          hand to exercise the derivation rules while the official source adapters are unimplemented. They are not
          observations, not estimates, and not a description of any real market. The registry below lists the series
          Capflies intends to consume; every entry is marked unverified until an adapter has fetched and validated the
          exact selector, unit, and licence.
        </p>
        <p>
          When official adapters land, provenance becomes <code>official</code>, the fixture notice disappears, and the
          build refuses to publish an artifact that mixes the two.
        </p>
      </section>

      <section className="panel prose" aria-labelledby="tracks-title">
        <h2 id="tracks-title">Two tracks, never averaged</h2>
        <dl>
          <dt>Flow trend</dt>
          <dd>Measured or transparently constructed movement of capital or liquidity.</dd>
          <dt>Pressure</dt>
          <dd>Official positioning or market-derived leading evidence.</dd>
          <dt>Cell state</dt>
          <dd>A function of the two tracks, computed at build time. No state is stored by hand.</dd>
        </dl>
        <div className="table-wrap">
        <table className="detail-table">
          <caption>Cell states.</caption>
          <thead>
            <tr>
              <th scope="col">State</th>
              <th scope="col">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {states.map(([state, meaning]) => (
              <tr key={state}>
                <th scope="row">{state}</th>
                <td>{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>

      <section className="panel prose" aria-labelledby="evidence-title">
        <h2 id="evidence-title">Evidence classes</h2>
        <dl>
          {evidence.map(([kind, meaning]) => (
            <div key={kind}>
              <dt>{kind}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel prose" aria-labelledby="scoring-title">
        <h2 id="scoring-title">Transforms, scoring, and thresholds</h2>
        <div className="table-wrap">
        <table className="detail-table">
          <caption>One economic transform per series.</caption>
          <thead>
            <tr>
              <th scope="col">Transform</th>
              <th scope="col">Definition</th>
            </tr>
          </thead>
          <tbody>
            {transforms.map(([id, definition]) => (
              <tr key={id}>
                <th scope="row">{id}</th>
                <td>{definition}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <p>
          A score is <code>sign(impulse) × percentile_rank(|impulse|) × 100</code>, calibrated only on transformed
          observations strictly earlier than the observation being scored, within the preceding ten years. It measures
          signed historical extremity: +80 and −80 do not claim symmetric probabilities.
        </p>
        <ul>
          <li>
            A score requires at least {thresholds.minCalibrationObservations} prior observations and{" "}
            {thresholds.minCalibrationYears} calendar years of history.
          </li>
          <li>
            Strength is a naming convention, not statistical significance: below {thresholds.moderateScore} ordinary,{" "}
            {thresholds.moderateScore} to {thresholds.strongScore} moderate, above {thresholds.strongScore} strong.
          </li>
          <li>
            A track is suppressed when fewer than {thresholds.minTrackCoverage * 100}% of its configured inputs are
            usable. Missing values are never zero-filled, and a cell aggregates by the median of eligible scores within
            a track.
          </li>
          <li>
            Acceleration compares a score with the same score in the previous release: at least +
            {thresholds.accelerationStep} is increasing, at most −{thresholds.accelerationStep} is decreasing. Release{" "}
            {release.release} has no previous release, so acceleration is reported as not comparable.
          </li>
        </ul>
        <p>
          Confidence is categorical. <strong>High</strong> needs at least two current inputs of the same sign with full
          configured coverage. <strong>Medium</strong> is a single current input, or several with partial coverage and
          no sign disagreement. <strong>Low</strong> marks stale carry, thin calibration history, or sign disagreement
          within a track.
        </p>
      </section>

      <section className="panel" id="health" aria-labelledby="health-title">
        <p className="eyebrow">Source health</p>
        <h2 id="health-title">Freshness in this release</h2>
        <p className="muted">
          Freshness follows each series' own registry windows, not a global clock. One missed release may be carried
          once as stale with its original as-of date; past its expiry window it becomes unusable and its track is
          suppressed rather than filled in.
        </p>
        {unhealthy.length ? (
          <div className="table-wrap">
            <table className="detail-table">
            <caption>Series that are not current in release {release.release}.</caption>
            <thead>
              <tr>
                <th scope="col">Series</th>
                <th scope="col">Status</th>
                <th scope="col">Note</th>
              </tr>
            </thead>
            <tbody>
              {unhealthy.map((health) => (
                <tr key={health.sourceId}>
                  <th scope="row">{health.sourceId}</th>
                  <td className="warn">{health.status}</td>
                  <td>{health.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <p>All configured series are current.</p>
        )}
      </section>

      <section className="panel" id="sources" aria-labelledby="sources-title">
        <p className="eyebrow">Registry</p>
        <h2 id="sources-title">Source catalog</h2>
        <p className="muted">
          {sources.length} allowlisted series across {Object.keys(publishers).length} official publishers. Licence links
          stay empty until each series' terms page is verified with its adapter, rather than being guessed here.
        </p>
        <div className="table-wrap">
          <table>
            <caption>Configured series, their evidence class, and their target cell.</caption>
            <thead>
              <tr>
                <th scope="col">Series</th>
                <th scope="col">Publisher</th>
                <th scope="col">Cell</th>
                <th scope="col">Track</th>
                <th scope="col">Evidence</th>
                <th scope="col">Frequency</th>
                <th scope="col">Stale / expire</th>
                <th scope="col">Verified</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.id}>
                  <th scope="row">
                    {source.series}
                    <span className="muted small block">{source.dataset}</span>
                  </th>
                  <td>
                    <a href={source.officialUrl} rel="noreferrer noopener" target="_blank">
                      {source.attribution}
                    </a>
                  </td>
                  <td>
                    {label[source.region]} · {label[source.assetClass]!.toLowerCase()}
                  </td>
                  <td>{label[source.track]}</td>
                  <td>{source.evidenceKind}</td>
                  <td>{source.frequency}</td>
                  <td className="num">
                    {source.staleAfterDays} / {source.expireAfterDays} d
                  </td>
                  <td className="warn">{source.verified ? "yes" : "pending"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel prose" id="downloads" aria-labelledby="downloads-title">
        <h2 id="downloads-title">Downloads</h2>
        <ul>
          <li>
            <a href={downloads.cells} download>
              cells.csv
            </a>{" "}
            — one row per matrix cell with both track scores, state, confidence, freshness, and provenance.
          </li>
          <li>
            <a href={downloads.inputs} download>
              inputs.csv
            </a>{" "}
            — one row per configured series input, with transform, dates, and calibration counts.
          </li>
          <li>
            <a href={downloads.manifest} download>
              release.json
            </a>{" "}
            — the release manifest, derived cells, source health, and artifact checksums.
          </li>
          <li>
            <a href={downloads.current}>current.json</a> — the pointer to the current manifest and its SHA-256.
          </li>
        </ul>
      </section>

      <section className="panel prose" aria-labelledby="limits-title">
        <h2 id="limits-title">Limitations</h2>
        <ul>
          <li>Coverage describes the nature of the selected official series, not total market ownership.</li>
          <li>Scores are historical extremity, not size, and not a forecast of returns.</li>
          <li>Positioning and price-derived readings are pressure, not capital flow.</li>
          <li>Pre-launch history uses the latest official vintage and is not a contemporaneous backtest.</li>
          <li>Capflies makes no recommendation and covers no individual security.</li>
        </ul>
      </section>
    </Layout>
  );
}
