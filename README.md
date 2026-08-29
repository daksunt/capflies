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

Capflies is independent research software. It is not affiliated with or endorsed by any asset manager, data publisher,
or index provider, and it does not provide investment advice.
