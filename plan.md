# Capflies v1 implementation plan

Status: documentation gate

Architecture dependency: [architecture.md](architecture.md)

## 1. Definition of done

Capflies v1 is complete when a visitor can open a polished public site, identify broad global capital-flow rotations, distinguish measured movement from leading pressure, inspect every contributing source and date, and download the public artifacts. A failed data refresh must leave the last good release usable.

The product makes no return forecast, recommendation, or claim to institutional accuracy.

## 2. Feature inventory

### Overview

- Global-by-asset rotation matrix above the fold.
- Separate flow and pressure encodings in every supported cell.
- Direction, strength, acceleration, state, confidence, freshness, and evidence labels.
- Deterministic weekly brief: confirmed inflow, confirmed outflow, and divergence.
- Three compact context charts for liquidity, cross-border movement, and market pressure.
- Visible unavailable, insufficient, stale, and offline states.

### Exploration

- Liquidity route with global, US, Europe, and Asia histories.
- Cross-border route with ranked lanes and time series.
- Markets route comparing regions and asset classes.
- URL-addressable cell drawer with ten-year history, raw unit, inputs, transformations, source dates, and download links.
- Theme detail only when a configured official series directly supports it.

### Transparency

- Methodology route containing coverage, formulas, thresholds, evidence definitions, limitations, attribution, and changelog.
- JSON and CSV downloads for selected observations and derived signals.
- Latest-vintage reconstruction label on pre-launch history.
- Immutable live-release history beginning at launch.
- Research-only and non-endorsement notices.

### Experience

- Approved dark editorial visual direction with custom SVG charts.
- Desktop-first dense analysis and a usable mobile ranked-list alternative.
- Keyboard-complete interactions and accessible chart alternatives.
- No login, cookies for product state, user tracking SDK, or runtime AI.

## 3. Launch coverage

| Region | Liquidity | Equities | Rates | Credit | Real assets | Crypto |
| --- | --- | --- | --- | --- | --- | --- |
| Global | G3 construction, IMF reserves, BIS GLI | IMF cross-border portfolio equity | Unavailable | IMF portfolio debt, BIS claims | IMF commodity prices and CFTC pressure | CFTC Bitcoin pressure only |
| US | Fed assets/reserves, TGA, ON RRP | TIC flows, CFTC pressure | TIC flows, H.15 and CFTC pressure | TIC agency/corporate flows | CFTC commodity pressure | Unavailable |
| Europe | ECB balance-sheet liquidity | IMF cross-border portfolio equity | ECB official yield pressure | IMF/BIS cross-border credit | Unavailable | Unavailable |
| Asia | BoJ and IMF reserve liquidity | IMF cross-border portfolio equity | Unavailable until an exact official series is approved | IMF/BIS cross-border credit | Unavailable | Unavailable |
| Emerging | IMF reserves and BIS GLI | IMF flows and CFTC MSCI EM pressure | Unavailable | IMF/BIS cross-border credit | Unavailable | Unavailable |

Coverage describes the nature of the official series, not total market ownership or a complete global flow-of-funds account.

## 4. Milestones

### M0 — Documentation gate

- [x] Rename the remote repository to `daksunt/capflies`.
- [x] Rename the local workspace to `capflies`.
- [x] Define the system, data contracts, methodology, interface, and failure behavior in `architecture.md`.
- [x] Define features, scope, milestones, verification, and launch gates in `plan.md`.
- [x] User accepted the documentation and authorized implementation on `main`.

Exit: documentation-only commit on a feature branch, with no application scaffold.

### M1 — Minimal foundation

Owner: Codex.

- [x] Initialize Node 22, TypeScript, React, and vinext with one lockfile.
- [x] Add five routes, the application shell, CSS tokens, and static-export configuration.
- [x] Define a small typed fixture that preserves independent flow and pressure tracks.
- [x] Render a plain accessible matrix and methodology page from the fixture before adding visual polish.
- [x] Add unit-test, static-artifact smoke, and production-route smoke commands.

Exit: both local and static builds render typed fixture data; no official adapter exists yet.

### M2 — Source registry and adapters

Owner: Codex verifies every official identifier and license boundary.

1. Fed, New York Fed, and Treasury Fiscal Data.
2. Treasury TIC.
3. ECB and Bank of Japan.
4. IMF and BIS.
5. CFTC.

For each batch:

- Add only allowlisted series definitions.
- Keep the raw download ephemeral.
- Commit one minimal official-response fixture per parser.
- Validate IDs, units, dates, host, and checksums.
- Document attribution and known release lag.
- Run contract tests before starting the next batch.

Exit: selected canonical observations can be rebuilt from all launch sources without storing raw mirrors.

### M3 — Methodology and weekly artifacts

Owner: Codex.

- Implement transforms, no-lookahead calibration, signed percentile scores, aggregation, confidence, freshness, and cell states.
- Bootstrap approximately ten years of latest-vintage history where sources provide it.
- Generate immutable release artifacts, current pointer, CSV downloads, provenance, and deterministic brief.
- Add live/reconstructed separation and methodology versioning.
- Ensure one source outage produces a stale or insufficient track while structural failures abort publication.

Exit: a manual refresh produces a complete deterministic candidate release with no application changes required.

### M4 — Visual product

Owner: Codex.

- Build the polished rotation matrix, detail drawer, context charts, ranked lanes, histories, legends, and mobile ranked list.
- Implement loading, stale, unavailable, invalid-version, error, and offline-fallback states.
- Add URL selection, keyboard behavior, focus management, reduced motion, accessible tables, and downloads.
- Confirm that no visual encoding implies a combined flow/pressure score.

Exit: production artifacts render without fixtures and pass visual, responsive, and accessibility checks.

### M5 — Automation and private hosting

Owner: Codex.

- Add Monday UTC and manual GitHub Actions refresh workflows with concurrency protection.
- Generate and commit a release only when validated content changes.
- Build the GitHub Pages artifact without making the private repository public.
- Add MIT license, final README, source catalog, contribution instructions, and research disclaimer.
- Create/link the ChatGPT Sites project only if `.openai/hosting.json` has no project ID.
- Save a private Sites version from the exact reviewed Git commit; do not deploy it.

Exit: scheduled refresh is proven on a manual run and a private saved Sites version is ready for review.

### M6 — Public launch gate

Owner: Codex performs only after explicit user approval.

- Create a recoverable bundle of the placeholder/private Git history.
- Prepare a clean public Capflies root history if still desired.
- Make the GitHub repository public and enable Pages.
- Point the Sites build at the public versioned Pages data endpoint.
- Save and inspect the final Sites version.
- Set public Sites access and deploy the approved version.
- Verify both public URLs as a signed-out visitor.

Exit: public site and repository are reachable, consistent, and contain no secrets or fabricated production data.

## 5. Delivery protocol

Codex is the sole implementation worker by explicit direction. Work lands directly on `main` in small, verified commits. Before each commit, Codex inspects the exact changed paths, runs the relevant checks, preserves unrelated user files, and pushes the verified result. No external coding CLI or parallel agent is used.

## 6. Verification matrix

### Data contracts

- Parse one smallest representative fixture per publisher.
- Reject missing selectors, non-finite values, unit changes, future dates, duplicate identities, and redirects away from official allowlisted hosts.
- Confirm raw responses are not included in public artifacts.

### Methodology

- A signal at time `t` uses calibration observations strictly earlier than `t`.
- Adding or revising future vintages cannot change an already published live release.
- Latest-vintage reconstruction and as-released selection choose their documented vintage.
- Five-year, 20-observation, 50%-coverage, 40/80-strength, and 15-point-acceleration boundaries are tested exactly.
- Missing inputs are never zero-filled and do not affect unrelated calibration sets.
- Weekly, monthly, and quarterly sources respect their own stale and expiry rules.
- Known inflow, yield, price, and positioning fixtures produce the documented sign.

### Determinism and publication

- Same observations, registry, and methodology version produce byte-identical analytical artifacts and brief text across time zones.
- Artifact hashes match the manifest.
- Failed parsing, derivation, validation, test, or build produces no current-pointer change.
- A permitted source outage publishes a coherent stale/insufficient state and source-health record.

### Interface

- Every cell state and evidence class has a rendering test.
- Matrix and charts have equivalent semantic tables.
- Drawer works by pointer, keyboard, Escape, URL, back, and forward navigation.
- Desktop and mobile screenshot tests protect layout and signal meaning.
- Automated accessibility checks cover contrast, labels, landmarks, focus, dialog behavior, and reduced motion.
- Offline and stale banners expose the exact release and as-of dates.

### Production safeguards

- Build fails if fixture or demo provenance appears in production artifacts.
- Build fails on missing attribution, unsupported schema, checksum mismatch, or future observation.
- Static export and Sites-compatible package pass smoke tests.
- Public launch inspection finds no secrets, paid-source data, third-party asset-manager branding, or investment-advice language.

## 7. Deferred work

Accounts, saved portfolios, alerts, individual securities, predictive models, return backtests, real-time feeds, SEC N-PORT, paid fund-flow data, custom domains, WebMCP actions, databases, and runtime AI remain out of scope until usage demonstrates a need.
