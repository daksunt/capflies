/**
 * Project Pages serves this site from https://daksunt.github.io/capflies/, so
 * the Pages build sets NEXT_PUBLIC_BASE_PATH=/capflies. Local dev and the local
 * build leave it unset and keep serving from the root path.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import("vinext").NextConfig} */
const nextConfig = {
  output: "export",
  basePath,

  // vinext 1.0.0-beta.8 prerenders Pages Router routes by fetching un-prefixed
  // paths ("/markets") from a server that only claims paths under basePath, so
  // every route 404s during `output: "export"`. A pass-through `basePath: false`
  // rewrite claims those paths so the prerender resolves them. It has no effect
  // on the exported files. Drop this once vinext prefixes its prerender fetches.
  ...(basePath ? { rewrites: async () => ({ beforeFiles: [{ source: "/:path*", destination: "/:path*", basePath: false }] }) } : {}),
};

export default nextConfig;
