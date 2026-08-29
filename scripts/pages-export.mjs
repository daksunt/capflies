/**
 * vinext 1.0.0-beta.8 exports HTML and public/ files at the export root but
 * nests _next assets under basePath. GitHub Pages maps the uploaded artifact to
 * https://daksunt.github.io/capflies/, so lift those assets back to the root the
 * HTML already points at. Drop this once vinext exports one consistent layout.
 */
import { readdir, rename, rm } from "node:fs/promises";
import path from "node:path";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
if (!basePath.startsWith("/")) throw new Error("NEXT_PUBLIC_BASE_PATH must be set to an absolute path for the Pages export");

const out = path.resolve(import.meta.dirname, "..", "dist", "client");
const nested = path.join(out, basePath.slice(1));

for (const entry of await readdir(nested)) await rename(path.join(nested, entry), path.join(out, entry));
await rm(nested, { recursive: true });

console.log(`Lifted ${basePath} assets to the dist/client root for GitHub Pages.`);
