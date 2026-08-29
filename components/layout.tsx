import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { release } from "../lib/current-release";
import { CellDetail } from "./cell-detail";

const links = [
  ["Overview", "/"],
  ["Liquidity", "/liquidity"],
  ["Cross-border", "/cross-border"],
  ["Markets", "/markets"],
  ["Methodology", "/methodology"],
] as const;

export function Layout({ title, children }: { title: string; children: ReactNode }) {
  const { pathname } = useRouter();
  const staleSources = release.sourceHealth.filter((health) => health.status !== "current");

  return (
    <>
      <Head>
        <title>{title} · Capflies</title>
        <meta name="description" content="A public radar for broad global capital-flow trends." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <a className="skip" href="#main">
        Skip to main content
      </a>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Capflies overview">
          CAPFLIES
        </Link>
        <nav aria-label="Primary navigation">
          {links.map(([label, href]) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
      </header>

      {release.provenance === "fixture" ? (
        <p className="banner" role="status">
          <strong>Fixture release {release.release}.</strong> Every number on this site is hand-written demonstration
          data used to build and test the interface. No official source has been fetched yet, and nothing here
          describes real capital flows.{" "}
          <Link href="/methodology#status">Read the data status</Link>.
        </p>
      ) : null}

      {release.provenance === "official" ? (
        <p className="banner official" role="status">
          <strong>Official release {release.release}.</strong> This release uses validated public Federal Reserve data.
          Coverage is intentionally narrow: unsupported markets remain unavailable rather than being estimated. {" "}
          <Link href="/methodology#status">Read the coverage</Link>.
        </p>
      ) : null}

      {release.provenance === "fixture" && staleSources.length ? (
        <p className="banner subtle" role="status">
          {staleSources.length} of {release.sourceHealth.length} configured series are stale, expired, or missing in this
          release. Affected tracks are carried with their original as-of date or suppressed, never filled in.{" "}
          <Link href="/methodology#health">Source health</Link>.
        </p>
      ) : null}

      <main id="main">{children}</main>
      <CellDetail />
      <footer>
        <p>
          Capflies is independent research software. It is not investment advice, not a forecast, and is not affiliated
          with or endorsed by any asset manager, data publisher, or index provider.
        </p>
        <p className="muted small">
          Data through {release.dataThrough} · release {release.release} · methodology {release.methodologyVersion} ·
          provenance {release.provenance}
        </p>
      </footer>
    </>
  );
}
