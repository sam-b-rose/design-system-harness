import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { componentDir, listComponents } from "../cli/lib/components";
import { fromRoot } from "../cli/lib/paths";
import { loadTasks } from "../evals/tasks";

const RULE = /^- `([a-z]+\/[a-z0-9-]+)` /;

function guidanceRules(component: string): { id: string; line: string }[] {
  const docs = readFileSync(join(componentDir(component), `${component}.docs.md`), "utf8");
  const doAndDont = docs.slice(docs.indexOf("## Do\n"));
  return doAndDont
    .split("\n")
    .filter((line) => line.startsWith("- "))
    .map((line) => ({ id: line.match(RULE)?.[1] ?? "", line }));
}

function filesIn(dir: string, extension: string): string[] {
  return readdirSync(fromRoot(dir), { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(extension))
    .map((file) => join(dir, file));
}

const components = listComponents();
const ruleIds = new Set(components.flatMap((component) => guidanceRules(component).map((rule) => rule.id)));
const prefixes = components.map((component) => component.toLowerCase());

test("every Do and Don't rule has a unique ID prefixed with its component", () => {
  const seen = new Set<string>();
  for (const component of components) {
    for (const { id, line } of guidanceRules(component)) {
      assert.ok(id.startsWith(`${component.toLowerCase()}/`), `${component}.docs.md: no ID on "${line}"`);
      assert.ok(!seen.has(id), `${id} is used twice`);
      seen.add(id);
    }
  }
});

test("every rule ID cited by a check, a skill or an eval task exists", () => {
  const fromChecks = filesIn("checks", ".ts").flatMap((file) =>
    [...readFileSync(fromRoot(file), "utf8").matchAll(/\(rule ([a-z]+\/[a-z0-9-]+)\)/g)].map((match) => [file, match[1]]),
  );
  const fromSkills = filesIn("skills", ".md").flatMap((file) =>
    [...readFileSync(fromRoot(file), "utf8").matchAll(/`([a-z]+)\/([a-z0-9-]+)`/g)]
      .filter((match) => prefixes.includes(match[1]))
      .map((match) => [file, `${match[1]}/${match[2]}`]),
  );
  const fromTasks = loadTasks().flatMap((task) =>
    task.intent.flatMap((check) => (check.rule ? [[`evals/tasks/${task.id}.json`, check.rule]] : [])),
  );
  const cited = [...fromChecks, ...fromSkills, ...fromTasks];
  assert.ok(fromChecks.length > 0 && fromSkills.length > 0 && fromTasks.length > 0);
  for (const [file, id] of cited) {
    assert.ok(ruleIds.has(id), `${file} cites ${id}, which no component's docs define`);
  }
});
