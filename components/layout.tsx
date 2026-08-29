import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { release } from "../lib/current-release";

const links = [
  ["Home", "/"],
  ["Liquidity", "/liquidity"],
  ["Flows", "/cross-border"],
  ["Markets", "/markets"],
  ["Data", "/methodology"],
] as const;

export function Layout({ title, children }: { title: string; children: ReactNode }) {
  const { pathname } = useRouter();

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

      <p className="sr-only">{`${release.provenance === "official" ? "Official" : "Fixture"} release ${release.release}.`}</p>

      <main id="main">{children}</main>
    </>
  );
}
