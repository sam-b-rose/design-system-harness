import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import config from "../ds.config";
import { listComponents } from "../cli/lib/components";
import { fromRoot } from "../cli/lib/paths";

const SKILL = "skills/design-system/SKILL.md";
const skill = readFileSync(fromRoot(SKILL), "utf8");

function headingAnchors(markdown: string): string[] {
  return [...markdown.matchAll(/^#{1,6} (.+)$/gm)].map((match) =>
    match[1].toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/ /g, "-"),
  );
}

test("every link in SKILL.md resolves to a file and heading", () => {
  const links = [...skill.matchAll(/\]\(([^)#]+)(?:#([^)]+))?\)/g)];
  assert.ok(links.length > 0);
  for (const [, target, anchor] of links) {
    const file = join(fromRoot(dirname(SKILL)), target);
    assert.ok(existsSync(file), `${target} does not exist`);
    if (anchor) {
      assert.ok(headingAnchors(readFileSync(file, "utf8")).includes(anchor), `${target} has no heading #${anchor}`);
    }
  }
});

test("SKILL.md routes to every component", () => {
  for (const name of listComponents()) {
    assert.ok(skill.includes(`${config.cliName} docs get ${name}`), `SKILL.md has no route that reads ${name}`);
  }
});

test("SKILL.md states the completion rule", () => {
  assert.match(skill, /A task is not complete until `ds check` passes\./);
});
