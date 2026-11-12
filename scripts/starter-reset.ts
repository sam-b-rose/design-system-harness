import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import config from "../ds.config";
import { fromRoot, root } from "../cli/lib/paths";

const SAMPLE_CONTENT = [
  config.componentsDir,
  config.pagesDir,
  "cli/templates",
  "evals/tasks",
  "evals/fixtures",
  "evals/results",
  "demo/results",
];

const EMPTY_DIRECTORIES = [
  config.componentsDir,
  config.pagesDir,
  "evals/tasks",
  "evals/fixtures/good",
  "evals/fixtures/bad",
];

const OVERLAY = fromRoot("scripts/reset");

for (const path of SAMPLE_CONTENT) {
  rmSync(fromRoot(path), { recursive: true, force: true });
}
for (const path of EMPTY_DIRECTORIES) {
  mkdirSync(fromRoot(path), { recursive: true });
  writeFileSync(join(fromRoot(path), ".gitkeep"), "");
}
cpSync(OVERLAY, root, { recursive: true });
execFileSync("pnpm", ["docs:build"], { cwd: root, stdio: "inherit" });

console.log(`
Reset done. The sample components, eval tasks and demo results are gone.

Next:
  1. Add your components under ${config.componentsDir}/<Name>/ and export them from ${config.entry}
  2. Replace ${config.componentsDir.replace("components", "tokens")}/tokens.ts with your tokens
  3. Fill in ds.config.ts: knownHallucinations and layoutComponent
  4. Fill in the TODOs in AGENTS.md and skills/design-system/
  5. Add templates to cli/templates/, tasks to evals/tasks/ and fixtures to evals/fixtures/
  6. Replace the sample audits in lint/audit/ with checks for your components
  7. Run: pnpm docs:build && pnpm typecheck && pnpm test && pnpm evals`);
