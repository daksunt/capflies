# Capflies

Capflies is a public, read-only radar for understanding broad global capital-flow trends over weeks and months.

- [Architecture](architecture.md)
- [Implementation plan](plan.md)

## Current state

The site renders a **fixture release** (`provenance: "fixture"`). Every score is hand-written demonstration data used
to build and test the interface while the official source adapters in plan.md M2 are unimplemented. Nothing on the site
describes real capital flows, and the fixture disclosure is rendered on every route, written into every CSV row, and
carried in the release manifest.

What is real is the machinery around it: a typed source registry, derived cell states (flow and pressure stay
independent and are never averaged), freshness, coverage and confidence rules, a deterministic weekly brief, and
checksummed JSON/CSV release artifacts under `/data/v1/`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run artifacts` | Generate the release artifacts into `public/data/` |
| `npm run build` | Generate artifacts, then produce the static export in `dist/` |
| `npm test` | Derivation and artifact unit tests |
| `npm run check` | Type check, tests, and build |
| `npm run smoke` | Build, then verify the exported routes and artifact checksums |
| `npm run publish` | Rebuild, smoke-test, and publish the static site to GitHub Pages |

## Updating the live site

1. Make and verify a change locally with `npm run check`.
2. Push the source change to `main`: `git add <files> && git commit -m "..." && git push origin main`.
3. Run `npm run publish`. It builds the Pages version, verifies its routes and artifacts, then updates the `gh-pages` branch that powers [the live site](https://daksunt.github.io/capflies/).

For the verified official release, run `npm run refresh:official`, review `data/official.json`, then run `npm run publish:official`. The refresh fetches FRED WALCL, RRPONTSYD, DGS10, ECBASSETSW, and JPNASSETS, records source checksums, and publishes U.S., Eurosystem, and Bank of Japan liquidity/rates evidence. It does not fill unsupported markets.

The current release intentionally uses fixture data. Do not replace `lib/fixture-release.ts` with guessed numbers: implement and validate the official source adapters first, then publish an `official`-provenance release.

Capflies is independent research software. It is not affiliated with or endorsed by any asset manager, data publisher,
or index provider, and it does not provide investment advice.
