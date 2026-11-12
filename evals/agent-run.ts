import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import { fromRoot, root } from "../cli/lib/paths";
import {
  agentCommandLine,
  agentPrompt,
  createWorkspace,
  parseAgentOptions,
  runAgent,
  scoreWorkspace,
  type Variant,
} from "./agent";
import { loadTasks, type Task } from "./run";

const RESULTS_DIR = fromRoot("evals/results");

const { model, positional: requested, flags } = parseAgentOptions(process.argv.slice(2));
const variant: Variant = flags.includes("--baseline") ? "baseline" : "toolkit";
const tasks = loadTasks().filter((task) => requested.length === 0 || requested.includes(task.id));

if (tasks.length === 0) {
  console.error(`No matching eval tasks. Usage: pnpm evals:agent [--baseline] [--model <id>] [task-id...]`);
  process.exit(2);
}

async function runTask(task: Task) {
  const workspace = createWorkspace(variant);
  const run = await runAgent(workspace, agentPrompt(task), model);
  const score = await scoreWorkspace(workspace, task, `${variant}-${task.id}`);
  rmSync(workspace, { recursive: true, force: true });

  const passed = run.exitCode === 0 && score.targetExists && score.violations.length === 0;
  console.log(`${passed ? "pass" : "FAIL"}  ${task.id}  (${run.turns ?? "?"} turns, ${run.seconds}s, ${score.violations.length} problems)`);
  return {
    task: task.id,
    passed,
    agentExitCode: run.exitCode,
    targetWritten: score.targetExists,
    turns: run.turns,
    seconds: run.seconds,
    models: run.models,
    violations: score.violations.map((violation) => ({
      rule: violation.rule,
      file: relative(root, violation.file),
      line: violation.line,
      message: violation.message,
    })),
  };
}

console.log(`Running ${tasks.length} task(s) in the ${variant} setup with: ${agentCommandLine(model)}`);
const results = await Promise.all(tasks.map(runTask));
const passedCount = results.filter((result) => result.passed).length;
const date = new Date().toISOString().slice(0, 10);
const fileName = `${[date, variant === "toolkit" ? "" : variant, model ?? ""].filter(Boolean).join("-")}.json`;
const report = {
  generatedBy: "evals/agent-run.ts",
  date,
  variant,
  agent: agentCommandLine(model),
  models: [...new Set(results.flatMap((result) => result.models))],
  passed: passedCount,
  total: results.length,
  results,
};

mkdirSync(RESULTS_DIR, { recursive: true });
writeFileSync(`${RESULTS_DIR}/${fileName}`, `${JSON.stringify(report, null, 2)}\n`);
console.log(`\n${passedCount}/${results.length} tasks passed ds check. Wrote evals/results/${fileName}.`);
process.exit(passedCount === results.length ? 0 : 1);
