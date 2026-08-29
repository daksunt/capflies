/** Build and publish the static export to the GitHub Pages source branch. */
import { execFileSync } from "node:child_process";
import { cp, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pages = await mkdtemp(path.join(tmpdir(), "capflies-pages-"));
const run = (command, args, cwd = root) => execFileSync(command, args, { cwd, stdio: "inherit" });

try {
  run("npm", ["run", "smoke:pages"]);
  run("git", ["worktree", "add", "--detach", pages, "origin/gh-pages"]);

  for (const entry of await readdir(pages)) {
    if (entry !== ".git") await rm(path.join(pages, entry), { recursive: true, force: true });
  }
  await cp(path.join(root, "dist", "client"), pages, { recursive: true });

  run("git", ["add", "--all"], pages);
  run("git", ["commit", "--allow-empty", "-m", "Deploy Capflies static site"], pages);
  run("git", ["push", "origin", "HEAD:gh-pages"], pages);
} finally {
  try { run("git", ["worktree", "remove", "--force", pages]); } catch { await rm(pages, { recursive: true, force: true }); }
}
