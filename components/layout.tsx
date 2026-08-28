import Head from "next/head";
import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  ["Overview", "/"],
  ["Liquidity", "/liquidity"],
  ["Cross-border", "/cross-border"],
  ["Markets", "/markets"],
  ["Methodology", "/methodology"],
] as const;

export function Layout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Head>
        <title>{title} · Capflies</title>
        <meta name="description" content="A public radar for broad global capital-flow trends." />
      </Head>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Capflies overview">
          CAPFLIES
        </Link>
        <nav aria-label="Primary navigation">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        Research only. Not investment advice. Fixture data is clearly marked until official adapters ship.
      </footer>
    </>
  );
}
