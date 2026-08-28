import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routes = ["index.html", "liquidity.html", "cross-border.html", "markets.html", "methodology.html"];
for (const route of routes) {
  const page = await readFile(new URL(`../dist/client/${route}`, import.meta.url), "utf8");
  assert.match(page, /CAPFLIES/);
}
console.log(`Static smoke passed for ${routes.length} routes.`);
