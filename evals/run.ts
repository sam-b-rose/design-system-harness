import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import config from "../ds.config";
import { runCheck, type Violation } from "../cli/lib/check";
import { fromRoot } from "../cli/lib/paths";

interface Task {
  id: string;
  prompt: string;
  target: string;
  checks: string[];
  good: string[];
  bad: { fixture: string; rule: string }[];
}

interface Outcome {
  label: string;
  passed: boolean;
  detail: string;
}

const TASKS_DIR = fromRoot("evals/tasks");
const FIXTURES_DIR = fromRoot("evals/fixtures");
const TEMP_DIR = fromRoot("evals/.tmp");

const rulesOf = (violations: Violation[]) => [...new Set(violations.map((violation) => violation.rule))];

async function expectPass(label: string, file: string): Promise<Outcome> {
  const violations = await runCheck([file]);
  const detail = violations.length === 0 ? "passes" : `expected to pass, got: ${rulesOf(violations).join(", ")}`;
  return { label, passed: violations.length === 0, detail };
}

async function expectFail(label: string, file: string, rule: string, messagePart = ""): Promise<Outcome> {
  const violations = await runCheck([file]);
  const hit = violations.find((violation) => violation.rule === rule && violation.message.includes(messagePart));
  const expected = messagePart ? `${rule} mentioning "${messagePart}"` : rule;
  const detail = hit ? `fails with ${rule}` : `expected ${expected}, got: ${rulesOf(violations).join(", ") || "no problems"}`;
  return { label, passed: hit !== undefined, detail };
}

async function runTask(task: Task): Promise<Outcome[]> {
  const outcomes: Outcome[] = [];
  for (const fixture of task.good) {
    outcomes.push(await expectPass(`${task.id}: ${fixture}`, join(FIXTURES_DIR, fixture)));
  }
  for (const { fixture, rule } of task.bad) {
    outcomes.push(await expectFail(`${task.id}: ${fixture}`, join(FIXTURES_DIR, fixture), rule));
  }
  return outcomes;
}

async function runKnownHallucinations(): Promise<Outcome[]> {
  mkdirSync(TEMP_DIR, { recursive: true });
  const outcomes: Outcome[] = [];
  for (const [name, replacement] of Object.entries(config.knownHallucinations)) {
    const file = join(TEMP_DIR, `${name}.tsx`);
    writeFileSync(
      file,
      `import { ${name} } from "${config.alias}";\n\nexport function Example() {\n  return <${name} />;\n}\n`,
    );
    outcomes.push(
      await expectFail(`ds.config.ts: import { ${name} }`, file, "ds/no-unknown-imports", `Use ${replacement}`),
    );
  }
  rmSync(TEMP_DIR, { recursive: true });
  return outcomes;
}

const tasks = readdirSync(TASKS_DIR)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file): Task => JSON.parse(readFileSync(join(TASKS_DIR, file), "utf8")));

const outcomes: Outcome[] = [];
for (const task of tasks) outcomes.push(...(await runTask(task)));
outcomes.push(...(await runKnownHallucinations()));

for (const outcome of outcomes) {
  console.log(`${outcome.passed ? "ok  " : "FAIL"}  ${outcome.label}  (${outcome.detail})`);
}
const failed = outcomes.filter((outcome) => !outcome.passed);
console.log(`\n${outcomes.length - failed.length}/${outcomes.length} eval assertions passed across ${tasks.length} task(s).`);
process.exit(failed.length === 0 ? 0 : 1);
