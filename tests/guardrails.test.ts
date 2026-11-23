import assert from "node:assert/strict";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { after, test } from "node:test";
import config from "../ds.config";
import { runCheck } from "../checks";
import { fromRoot } from "../cli/lib/paths";
import { describeIntent, loadTasks, unmetIntent } from "../evals/tasks";

const FIXTURES_DIR = fromRoot("tests/fixtures");
const DERIVED_DIR = fromRoot("tests/.tmp/derived");

const CAUGHT_BY: Record<string, string> = {
  "unknown-import": "ds/no-unknown-imports",
  "raw-div": "ds/prefer-stack",
  "raw-values": "ds/no-raw-values",
  "guessed-props": "tsc/TS2322",
  "missing-label": "audit/textfield-label",
  "two-primary": "audit/one-primary-button",
};

const tasks = loadTasks();
const goodFixture = (taskId: string) => join(FIXTURES_DIR, "good", `${taskId}.tsx`);
const badFixtures = readdirSync(join(FIXTURES_DIR, "bad")).map((file) => join(FIXTURES_DIR, "bad", file));

after(() => rmSync(DERIVED_DIR, { recursive: true, force: true }));

for (const task of tasks) {
  test(`${task.id}: the good fixture passes ds check and meets every intent check`, async () => {
    const file = goodFixture(task.id);
    assert.deepEqual(await runCheck([file]), []);
    assert.deepEqual(unmetIntent(readFileSync(file, "utf8"), task.intent).map(describeIntent), []);
  });
}

for (const file of badFixtures) {
  const [taskId, failure] = basename(file, ".tsx").split(".");
  test(`${taskId}: ${failure} is caught by ${CAUGHT_BY[failure]}`, async () => {
    assert.ok(CAUGHT_BY[failure], `No rule is listed for the failure mode "${failure}"`);
    const rules = (await runCheck([file])).map((violation) => violation.rule);
    assert.ok(rules.includes(CAUGHT_BY[failure]), `got: ${rules.join(", ") || "no problems"}`);
  });
}

for (const [name, replacement] of Object.entries(config.knownHallucinations)) {
  test(`importing ${name} is caught and points at ${replacement}`, async () => {
    mkdirSync(DERIVED_DIR, { recursive: true });
    const task = tasks.find((candidate) => readFileSync(goodFixture(candidate.id), "utf8").includes(replacement));
    assert.ok(task, `No good fixture uses ${replacement}`);
    const file = join(DERIVED_DIR, `${task.id}.${name}.tsx`);
    writeFileSync(file, readFileSync(goodFixture(task.id), "utf8").replace(new RegExp(`\\b${replacement}\\b`, "g"), name));
    const violations = await runCheck([file]);
    assert.ok(
      violations.some((violation) => violation.rule === "ds/no-unknown-imports" && violation.message.includes(`Use ${replacement}`)),
    );
  });
}
