import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import config from "../ds.config";
import { exportNames } from "../cli/lib/exports";
import { ENTRY, fromRoot } from "../cli/lib/paths";

const agentsFile = readFileSync(fromRoot("AGENTS.md"), "utf8");

test("AGENTS.md stays under 60 lines", () => {
  assert.ok(agentsFile.trimEnd().split("\n").length < 60);
});

test("AGENTS.md states the completion rule", () => {
  assert.match(agentsFile.replace(/\s+/g, " "), /A task is not complete until `ds check` passes\./);
});

test("every link in AGENTS.md resolves to a file", () => {
  for (const [, target] of agentsFile.matchAll(/\]\(([^)#]+)\)/g)) {
    assert.ok(existsSync(fromRoot(target)), `${target} does not exist`);
  }
});

test("every known hallucination points at a real export and is not one itself", () => {
  const real = exportNames();
  for (const [name, replacement] of Object.entries(config.knownHallucinations)) {
    assert.ok(real.includes(replacement), `${replacement} is not exported by ${config.alias}`);
    assert.ok(!real.includes(name), `${name} is exported, so it is not a hallucination`);
  }
});

test("tsconfig.json maps the import alias from ds.config.ts to the entry file", () => {
  const tsconfig = JSON.parse(readFileSync(fromRoot("tsconfig.json"), "utf8"));
  assert.deepEqual(tsconfig.compilerOptions.paths[config.alias], [`./${ENTRY}`]);
});
