export const regions = ["global", "us", "europe", "asia", "emerging"] as const;
export const assetClasses = [
  "liquidity",
  "equities",
  "rates",
  "credit",
  "real-assets",
  "crypto",
] as const;

export type RegionId = (typeof regions)[number];
export type AssetClassId = (typeof assetClasses)[number];
export type EvidenceKind = "measured" | "constructed" | "positioning" | "inferred";
export type Track = "flowTrend" | "pressure";
export type Frequency = "daily" | "weekly" | "monthly" | "quarterly";
export type TransformId =
  | "signed-flow"
  | "stock-change-13w"
  | "position-change-4w"
  | "price-return-13w"
  | "yield-change-13w";

export interface SourceDefinition {
  id: string;
  publisher:
    | "fed"
    | "fred"
    | "ny-fed"
    | "treasury-fiscal"
    | "treasury-tic"
    | "ecb"
    | "boj"
    | "imf"
    | "bis"
    | "cftc";
  /** Published release or dataset name, as the publisher titles it. */
  dataset: string;
  /** Human-readable description of the series this cell would consume. */
  series: string;
  /** Publisher landing page. Exact series selectors are resolved in M2. */
  officialUrl: string;
  attribution: string;
  /** Null until the licence page is verified against the selected series (M2). */
  termsUrl: string | null;
  /** False until an adapter has fetched and validated the real selector. */
  verified: boolean;
  frequency: Frequency;
  staleAfterDays: number;
  expireAfterDays: number;
  unit: string;
  transform: TransformId;
  evidenceKind: EvidenceKind;
  region: RegionId;
  assetClass: AssetClassId;
  track: Track;
}

export const publishers: Record<SourceDefinition["publisher"], { name: string; url: string }> = {
  fed: { name: "Federal Reserve Board", url: "https://www.federalreserve.gov/data.htm" },
  fred: { name: "Federal Reserve Bank of St. Louis FRED", url: "https://fred.stlouisfed.org/" },
  "ny-fed": { name: "Federal Reserve Bank of New York", url: "https://www.newyorkfed.org/markets/desk-operations/reverse-repo" },
  "treasury-fiscal": { name: "U.S. Treasury Fiscal Data", url: "https://fiscaldata.treasury.gov/datasets/daily-treasury-statement/" },
  "treasury-tic": { name: "U.S. Treasury International Capital System", url: "https://home.treasury.gov/data/treasury-international-capital-tic-system" },
  ecb: { name: "European Central Bank", url: "https://data.ecb.europa.eu/" },
  boj: { name: "Bank of Japan", url: "https://www.boj.or.jp/en/statistics/index.htm" },
  imf: { name: "International Monetary Fund", url: "https://data.imf.org/" },
  bis: { name: "Bank for International Settlements", url: "https://data.bis.org/" },
  cftc: { name: "U.S. Commodity Futures Trading Commission", url: "https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" },
};

type SourceSeed = Omit<SourceDefinition, "officialUrl" | "attribution" | "termsUrl" | "verified">;

function define(seed: SourceSeed): SourceDefinition {
  return {
    ...seed,
    officialUrl: publishers[seed.publisher].url,
    attribution: publishers[seed.publisher].name,
    termsUrl: null,
    verified: false,
  };
}

const weekly = { frequency: "weekly", staleAfterDays: 14, expireAfterDays: 35 } as const;
const monthly = { frequency: "monthly", staleAfterDays: 75, expireAfterDays: 135 } as const;
const quarterly = { frequency: "quarterly", staleAfterDays: 165, expireAfterDays: 285 } as const;

/**
 * Allowlisted series for the v1 launch coverage table in plan.md section 3.
 * Identifiers describe the published series; exact selectors, licence links and
 * release lags are verified per publisher batch in M2 before any adapter runs.
 */
export const sources: SourceDefinition[] = [
  // Global
  define({ id: "imf-reserves-global", publisher: "imf", dataset: "International Reserves and Foreign Currency Liquidity", series: "World total reserves excluding gold", ...quarterly, unit: "USD", transform: "stock-change-13w", evidenceKind: "measured", region: "global", assetClass: "liquidity", track: "flowTrend" }),
  define({ id: "bis-gli-global", publisher: "bis", dataset: "Global liquidity indicators", series: "Total credit to non-bank borrowers, all currencies", ...quarterly, unit: "USD", transform: "stock-change-13w", evidenceKind: "constructed", region: "global", assetClass: "liquidity", track: "flowTrend" }),
  define({ id: "imf-portfolio-equity-global", publisher: "imf", dataset: "Balance of Payments", series: "Portfolio investment, equity, net acquisition of assets, world", ...quarterly, unit: "USD", transform: "signed-flow", evidenceKind: "measured", region: "global", assetClass: "equities", track: "flowTrend" }),
  define({ id: "imf-portfolio-debt-global", publisher: "imf", dataset: "Balance of Payments", series: "Portfolio investment, debt securities, net acquisition of assets, world", ...quarterly, unit: "USD", transform: "signed-flow", evidenceKind: "measured", region: "global", assetClass: "credit", track: "flowTrend" }),
  define({ id: "bis-claims-global", publisher: "bis", dataset: "Locational banking statistics", series: "Cross-border claims of reporting banks, all sectors", ...quarterly, unit: "USD", transform: "stock-change-13w", evidenceKind: "measured", region: "global", assetClass: "credit", track: "flowTrend" }),
  define({ id: "imf-commodity-prices", publisher: "imf", dataset: "Primary Commodity Price System", series: "All primary commodities price index", ...monthly, unit: "index", transform: "price-return-13w", evidenceKind: "inferred", region: "global", assetClass: "real-assets", track: "pressure" }),
  define({ id: "cftc-commodities-global", publisher: "cftc", dataset: "Commitments of Traders, disaggregated", series: "Managed money net position, selected commodity contracts", ...weekly, unit: "ratio", transform: "position-change-4w", evidenceKind: "positioning", region: "global", assetClass: "real-assets", track: "pressure" }),
  define({ id: "cftc-bitcoin", publisher: "cftc", dataset: "Commitments of Traders, Traders in Financial Futures", series: "Bitcoin futures net position", ...weekly, unit: "ratio", transform: "position-change-4w", evidenceKind: "positioning", region: "global", assetClass: "crypto", track: "pressure" }),

  // United States
  define({ id: "fed-h41-total-assets", publisher: "fred", dataset: "H.4.1 Factors Affecting Reserve Balances (FRED WALCL)", series: "Total assets of the Federal Reserve", ...weekly, unit: "USD", transform: "stock-change-13w", evidenceKind: "constructed", region: "us", assetClass: "liquidity", track: "flowTrend" }),
  define({ id: "treasury-tga", publisher: "treasury-fiscal", dataset: "Daily Treasury Statement", series: "Treasury General Account operating cash balance", frequency: "daily", staleAfterDays: 7, expireAfterDays: 21, unit: "USD", transform: "stock-change-13w", evidenceKind: "constructed", region: "us", assetClass: "liquidity", track: "flowTrend" }),
  define({ id: "nyfed-on-rrp", publisher: "fred", dataset: "Overnight Reverse Repurchase Agreements (FRED RRPONTSYD)", series: "Overnight reverse repurchase agreement award amount", frequency: "daily", staleAfterDays: 7, expireAfterDays: 21, unit: "USD", transform: "stock-change-13w", evidenceKind: "constructed", region: "us", assetClass: "liquidity", track: "flowTrend" }),
  define({ id: "tic-equities-us", publisher: "treasury-tic", dataset: "TIC monthly transactions", series: "Net foreign purchases of U.S. equities", ...monthly, unit: "USD", transform: "signed-flow", evidenceKind: "measured", region: "us", assetClass: "equities", track: "flowTrend" }),
  define({ id: "cftc-equity-index-us", publisher: "cftc", dataset: "Commitments of Traders, Traders in Financial Futures", series: "E-mini S&P 500 asset manager net position", ...weekly, unit: "ratio", transform: "position-change-4w", evidenceKind: "positioning", region: "us", assetClass: "equities", track: "pressure" }),
  define({ id: "tic-treasuries-us", publisher: "treasury-tic", dataset: "TIC monthly transactions", series: "Net foreign purchases of U.S. Treasury bonds and notes", ...monthly, unit: "USD", transform: "signed-flow", evidenceKind: "measured", region: "us", assetClass: "rates", track: "flowTrend" }),
  define({ id: "fed-h15-10y", publisher: "fred", dataset: "H.15 Selected Interest Rates (FRED DGS10)", series: "10-year Treasury constant maturity yield", frequency: "daily", staleAfterDays: 7, expireAfterDays: 21, unit: "percent", transform: "yield-change-13w", evidenceKind: "inferred", region: "us", assetClass: "rates", track: "pressure" }),
  define({ id: "cftc-treasury-us", publisher: "cftc", dataset: "Commitments of Traders, Traders in Financial Futures", series: "10-year Treasury note asset manager net position", ...weekly, unit: "ratio", transform: "position-change-4w", evidenceKind: "positioning", region: "us", assetClass: "rates", track: "pressure" }),
  define({ id: "tic-agency-us", publisher: "treasury-tic", dataset: "TIC monthly transactions", series: "Net foreign purchases of U.S. agency bonds", ...monthly, unit: "USD", transform: "signed-flow", evidenceKind: "measured", region: "us", assetClass: "credit", track: "flowTrend" }),
  define({ id: "tic-corporate-us", publisher: "treasury-tic", dataset: "TIC monthly transactions", series: "Net foreign purchases of U.S. corporate bonds", ...monthly, unit: "USD", transform: "signed-flow", evidenceKind: "measured", region: "us", assetClass: "credit", track: "flowTrend" }),
  define({ id: "cftc-commodities-us", publisher: "cftc", dataset: "Commitments of Traders, disaggregated", series: "WTI crude oil managed money net position", ...weekly, unit: "ratio", transform: "position-change-4w", evidenceKind: "positioning", region: "us", assetClass: "real-assets", track: "pressure" }),

  // Europe
  define({ id: "ecb-balance-sheet", publisher: "ecb", dataset: "Eurosystem weekly financial statement", series: "Total assets of the Eurosystem", ...weekly, unit: "EUR", transform: "stock-change-13w", evidenceKind: "constructed", region: "europe", assetClass: "liquidity", track: "flowTrend" }),
  define({ id: "imf-portfolio-equity-europe", publisher: "imf", dataset: "Balance of Payments", series: "Portfolio investment, equity, euro area", ...quarterly, unit: "EUR", transform: "signed-flow", evidenceKind: "measured", region: "europe", assetClass: "equities", track: "flowTrend" }),
  define({ id: "ecb-yield-curve", publisher: "ecb", dataset: "Euro area yield curves", series: "AAA-rated euro area 10-year government bond yield", frequency: "daily", staleAfterDays: 7, expireAfterDays: 21, unit: "percent", transform: "yield-change-13w", evidenceKind: "inferred", region: "europe", assetClass: "rates", track: "pressure" }),
  define({ id: "imf-portfolio-debt-europe", publisher: "imf", dataset: "Balance of Payments", series: "Portfolio investment, debt securities, euro area", ...quarterly, unit: "EUR", transform: "signed-flow", evidenceKind: "measured", region: "europe", assetClass: "credit", track: "flowTrend" }),
  define({ id: "bis-claims-europe", publisher: "bis", dataset: "Locational banking statistics", series: "Cross-border claims on euro area residents", ...quarterly, unit: "USD", transform: "stock-change-13w", evidenceKind: "measured", region: "europe", assetClass: "credit", track: "flowTrend" }),

  // Asia
  define({ id: "boj-total-assets", publisher: "boj", dataset: "Bank of Japan Accounts", series: "Total assets of the Bank of Japan", ...weekly, unit: "JPY", transform: "stock-change-13w", evidenceKind: "constructed", region: "asia", assetClass: "liquidity", track: "flowTrend" }),
  define({ id: "imf-reserves-asia", publisher: "imf", dataset: "International Reserves and Foreign Currency Liquidity", series: "Emerging and developing Asia total reserves", ...quarterly, unit: "USD", transform: "stock-change-13w", evidenceKind: "measured", region: "asia", assetClass: "liquidity", track: "flowTrend" }),
  define({ id: "imf-portfolio-equity-asia", publisher: "imf", dataset: "Balance of Payments", series: "Portfolio investment, equity, Asia country group", ...quarterly, unit: "USD", transform: "signed-flow", evidenceKind: "measured", region: "asia", assetClass: "equities", track: "flowTrend" }),
  define({ id: "bis-claims-asia", publisher: "bis", dataset: "Locational banking statistics", series: "Cross-border claims on Asia-Pacific residents", ...quarterly, unit: "USD", transform: "stock-change-13w", evidenceKind: "measured", region: "asia", assetClass: "credit", track: "flowTrend" }),

  // Emerging markets
  define({ id: "imf-reserves-emerging", publisher: "imf", dataset: "International Reserves and Foreign Currency Liquidity", series: "Emerging and developing economies total reserves", ...quarterly, unit: "USD", transform: "stock-change-13w", evidenceKind: "measured", region: "emerging", assetClass: "liquidity", track: "flowTrend" }),
  define({ id: "bis-gli-emerging", publisher: "bis", dataset: "Global liquidity indicators", series: "Credit to non-bank borrowers in emerging market economies", ...quarterly, unit: "USD", transform: "stock-change-13w", evidenceKind: "constructed", region: "emerging", assetClass: "liquidity", track: "flowTrend" }),
  define({ id: "imf-portfolio-equity-emerging", publisher: "imf", dataset: "Balance of Payments", series: "Portfolio investment, equity, emerging market country group", ...quarterly, unit: "USD", transform: "signed-flow", evidenceKind: "measured", region: "emerging", assetClass: "equities", track: "flowTrend" }),
  define({ id: "cftc-msci-emerging", publisher: "cftc", dataset: "Commitments of Traders, Traders in Financial Futures", series: "MSCI Emerging Markets index futures net position", ...weekly, unit: "ratio", transform: "position-change-4w", evidenceKind: "positioning", region: "emerging", assetClass: "equities", track: "pressure" }),
  define({ id: "bis-claims-emerging", publisher: "bis", dataset: "Locational banking statistics", series: "Cross-border claims on emerging market residents", ...quarterly, unit: "USD", transform: "stock-change-13w", evidenceKind: "measured", region: "emerging", assetClass: "credit", track: "flowTrend" }),
];

export function sourcesFor(region: RegionId, assetClass: AssetClassId, track?: Track): SourceDefinition[] {
  return sources.filter(
    (source) =>
      source.region === region &&
      source.assetClass === assetClass &&
      (track === undefined || source.track === track),
  );
}

export function sourceById(id: string): SourceDefinition {
  const source = sources.find((item) => item.id === id);
  if (!source) throw new Error(`Unknown source: ${id}`);
  return source;
}

export const label: Record<string, string> = {
  global: "Global",
  us: "United States",
  europe: "Europe",
  asia: "Asia",
  emerging: "Emerging markets",
  liquidity: "Liquidity",
  equities: "Equities",
  rates: "Rates",
  credit: "Credit",
  "real-assets": "Real assets",
  crypto: "Crypto",
  flowTrend: "Flow trend",
  pressure: "Pressure",
};
