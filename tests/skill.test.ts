import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { listComponents } from "../cli/lib/components";
import { fromRoot } from "../cli/lib/paths";

const SKILLS = readdirSync(fromRoot("skills")).map((name) => `skills/${name}/SKILL.md`);
const read = (file: string) => readFileSync(fromRoot(file), "utf8");

function headingAnchors(markdown: string): string[] {
  return [...markdown.matchAll(/^#{1,6} (.+)$/gm)].map((match) =>
    match[1].toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/ /g, "-"),
  );
}

for (const skill of SKILLS) {
  test(`${skill} names itself after its folder`, () => {
    assert.match(read(skill), new RegExp(`^---\\nname: ${dirname(skill).split("/")[1]}\\n`));
  });

  test(`every link in ${skill} resolves to a file and heading`, () => {
    for (const [, target, anchor] of read(skill).matchAll(/\]\(([^)#]+)(?:#([^)]+))?\)/g)) {
      const file = join(fromRoot(dirname(skill)), target);
      assert.ok(existsSync(file), `${target} does not exist`);
      if (anchor) {
        assert.ok(headingAnchors(readFileSync(file, "utf8")).includes(anchor), `${target} has no heading #${anchor}`);
      }
    }
  });
}

test("the build-ui skill routes to every component", () => {
  const skill = read("skills/build-ui/SKILL.md");
  for (const name of listComponents()) {
    assert.ok(skill.includes(`ds docs get ${name}`), `build-ui has no route that reads ${name}`);
  }
});

test("the build-ui skill states the completion rule", () => {
  assert.match(read("skills/build-ui/SKILL.md"), /A task is not complete until `ds check` passes\./);
});
