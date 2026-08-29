/** Writes the release artifacts into public/ so the static export serves them. */
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { basePath, cellsCsv, currentJson, currentPath, inputsCsv, manifestJson, releaseDir } from "../lib/artifacts.ts";
import { release } from "../lib/current-release.ts";

const root = path.resolve(import.meta.dirname, "..");
const out = (file: string) => path.join(root, "public", file);
const sha256 = (contents: string) => createHash("sha256").update(contents).digest("hex");

async function write(file: string, contents: string) {
  await mkdir(path.dirname(out(file)), { recursive: true });
  await writeFile(out(file), contents);
}

await rm(out("data"), { recursive: true, force: true });

const files = [
  [`${releaseDir}/cells.csv`, cellsCsv()],
  [`${releaseDir}/inputs.csv`, inputsCsv()],
] as const;

for (const [file, contents] of files) await write(file, contents);

// Artifact paths are the URLs a consumer resolves against the site origin, so they carry the base path.
const manifest = manifestJson(files.map(([file, contents]) => ({ path: `${basePath}/${file}`, sha256: sha256(contents) })));
await write(`${releaseDir}/release.json`, manifest);
await write(currentPath, currentJson(sha256(manifest)));

console.log(`Wrote ${files.length + 2} artifacts for release ${release.release} (${release.provenance}).`);
