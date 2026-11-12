import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import config from "../ds.config";
import { runCheck } from "../cli/lib/check";
import { fromRoot } from "../cli/lib/paths";

export interface Task {
  id: string;
  prompt: string;
  target: string;
  checks: string[];
  good: string[];
  bad: { fixture: string; rule: string }[];
}

interface Case {
  label: string;
  file: string;
  expected: "pass" | { rule: string; messagePart: string };
}

const TASKS_DIR = fromRoot("evals/tasks");
const FIXTURES_DIR = fromRoot("evals/fixtures");
const DERIVED_DIR = fromRoot("evals/.tmp/derived");

export function loadTasks(): Task[] {
  return readdirSync(TASKS_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(readFileSync(join(TASKS_DIR, file), "utf8")));
}

function fixtureCases(task: Task): Case[] {
  const good = task.good.map((fixture): Case => ({
    label: `${task.id}: ${fixture}`,
    file: join(FIXTURES_DIR, fixture),
    expected: "pass",
  }));
  const bad = task.bad.map(({ fixture, rule }): Case => ({
    label: `${task.id}: ${fixture}`,
    file: join(FIXTURES_DIR, fixture),
    expected: { rule, messagePart: "" },
  }));
  return [...good, ...bad];
}

function hallucinationCases(task: Task): Case[] {
  return task.good.flatMap((fixture) => {
    const source = readFileSync(join(FIXTURES_DIR, fixture), "utf8");
    return Object.entries(config.knownHallucinations).flatMap(([name, replacement]): Case[] => {
      const real = new RegExp(`\\b${replacement}\\b`, "g");
      if (!real.test(source)) return [];
      const file = join(DERIVED_DIR, `${task.id}.${name}.tsx`);
      writeFileSync(file, source.replace(real, name));
      return [
        {
          label: `${task.id}: ${fixture} with ${replacement} swapped for ${name} (from ds.config.ts)`,
          file,
          expected: { rule: "ds/no-unknown-imports", messagePart: `Use ${replacement}` },
        },
      ];
    });
  });
}

async function main(): Promise<void> {
  const tasks = loadTasks();
  mkdirSync(DERIVED_DIR, { recursive: true });
  const cases = tasks.flatMap((task) => [...fixtureCases(task), ...hallucinationCases(task)]);
  const violations = await runCheck(cases.map((testCase) => testCase.file));
  rmSync(DERIVED_DIR, { recursive: true });

  let failures = 0;
  for (const { label, file, expected } of cases) {
    const found = violations.filter((violation) => violation.file === file);
    const rules = [...new Set(found.map((violation) => violation.rule))].join(", ") || "no problems";
    const passed =
      expected === "pass"
        ? found.length === 0
        : found.some((violation) => violation.rule === expected.rule && violation.message.includes(expected.messagePart));
    const wanted = expected === "pass" ? "passes" : `fails with ${expected.rule}`;
    if (!passed) failures += 1;
    console.log(passed ? `ok    ${label}  (${wanted})` : `FAIL  ${label}  (expected: ${wanted}; got: ${rules})`);
  }

  console.log(`\n${cases.length - failures}/${cases.length} eval assertions passed across ${tasks.length} task(s).`);
  process.exit(failures === 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
