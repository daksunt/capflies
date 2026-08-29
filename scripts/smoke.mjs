import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const dist = new URL("../dist/client/", import.meta.url);
const read = (file) => readFile(new URL(file, dist), "utf8");

// The Pages build serves from https://daksunt.github.io/capflies/, so every
// internal reference must carry that prefix while the export root stays flat.
// A root-path build sets nothing and must carry no prefix at all.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const url = (path) => `${basePath}${path}`;
const local = (path) => `.${path.slice(basePath.length)}`;

const routes = ["index.html", "liquidity.html", "cross-border.html", "markets.html", "methodology.html"];
for (const route of routes) {
  const page = await read(route);
  assert.match(page, new RegExp(`src="${basePath}/_next/static/`), `${route} does not load its scripts from ${basePath || "/"}`);
  assert.match(page, new RegExp(`href="${basePath}/_next/static/[^"]+\\.css"`), `${route} does not load its stylesheet from ${basePath || "/"}`);
  for (const link of ["/liquidity", "/cross-border", "/markets", "/methodology"]) {
    assert.match(page, new RegExp(`href="${url(link)}"`), `${route} does not link to ${url(link)}`);
  }
  // Anything root-absolute that skips the base path 404s once deployed.
  if (basePath) assert.doesNotMatch(page, new RegExp(`(?:href|src)="/(?!${basePath.slice(1)}(?:["/?#]))`), `${route} has links that escape ${basePath}`);
  assert.match(page, /CAPFLIES/, `${route} is missing the shell`);
  assert.match(page, /Skip to main content/, `${route} is missing the skip link`);
  assert.match(page, /Fixture release/, `${route} does not disclose fixture provenance`);
  assert.doesNotMatch(page, /\bLorem ipsum\b/i, `${route} contains placeholder copy`);
}

const overview = await read("index.html");
assert.match(overview, /\?cell=/, "overview has no URL-addressable cell links");
assert.match(overview, /Confirming in|Confirming out|Diverging/, "overview renders no derived cell states");
assert.match(overview, /Unavailable/, "overview hides unsupported cells instead of showing them");
assert.match(overview, new RegExp(`href="${url("/data/v1/releases/")}[^"]+/cells\\.csv" download`), "overview does not offer base-path-correct artifact downloads");

const methodology = await read("methodology.html");
assert.match(methodology, /provenance: &quot;/, "methodology omits the provenance statement");
assert.match(methodology, /Source catalog/, "methodology omits the source catalog");

// Artifacts are present, well formed, and match the checksums the manifest declares.
const current = JSON.parse(await read("data/v1/current.json"));
assert.equal(current.schemaVersion, 1);
assert.equal(current.provenance, "fixture");

assert.ok(current.manifestPath.startsWith(`${basePath}/data/v1/`), `current.json points at ${current.manifestPath}, which is outside ${basePath || "/"}`);

const manifestText = await read(local(current.manifestPath));
assert.equal(createHash("sha256").update(manifestText).digest("hex"), current.manifestSha256, "current.json checksum does not match the manifest");

const manifest = JSON.parse(manifestText);
assert.equal(manifest.provenance, "fixture");
assert.ok(manifest.cells.length > 0, "manifest carries no cells");
for (const artifact of manifest.artifacts) {
  const contents = await read(local(artifact.path));
  assert.equal(createHash("sha256").update(contents).digest("hex"), artifact.sha256, `${artifact.path} checksum mismatch`);
  const rows = contents.trimEnd().split("\n");
  assert.ok(rows.length > 1, `${artifact.path} has no rows`);
  for (const row of rows.slice(1)) assert.match(row, /,fixture$/, `${artifact.path} row is not marked as fixture`);
}

console.log(`Static smoke passed at base path ${basePath || "/"}: ${routes.length} routes, ${manifest.artifacts.length + 2} artifacts, checksums verified.`);
