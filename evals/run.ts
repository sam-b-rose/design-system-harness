import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
import { describeIntent, loadTasks, type Task } from "./tasks";

interface TaskScore {
  passed: boolean;
  problems: number;
  intentMet: number;
  intentTotal: number;
}

interface Baseline {
  date: string;
  models: string[];
  tasks: Record<string, TaskScore>;
}

const RESULTS_DIR = fromRoot("evals/results");
const BASELINE_FILE = fromRoot("evals/baseline.json");
const USAGE = "Usage: pnpm evals [--no-harness] [--save-baseline] [--model <id>] [task-id...]";

const { model, positional: requested, flags } = parseAgentOptions(process.argv.slice(2));
const variant: Variant = flags.includes("--no-harness") ? "no-harness" : "harness";
const saveBaseline = flags.includes("--save-baseline");
const tasks = loadTasks().filter((task) => requested.length === 0 || requested.includes(task.id));

if (tasks.length === 0) {
  console.error(`No matching eval tasks. ${USAGE}`);
  process.exit(2);
}
if (saveBaseline && variant !== "harness") {
  console.error("The team baseline records the harness. Run --save-baseline without --no-harness.");
  process.exit(2);
}

const baseline: Baseline | undefined =
  variant === "harness" && existsSync(BASELINE_FILE) ? JSON.parse(readFileSync(BASELINE_FILE, "utf8")) : undefined;

function compared(task: Task, score: TaskScore): string {
  const before = baseline?.tasks[task.id];
  if (!before) return "";
  if (before.passed && !score.passed) return "  REGRESSED (baseline: pass)";
  if (!before.passed && score.passed) return "  improved (baseline: fail)";
  return "";
}

async function runTask(task: Task) {
  const workspace = createWorkspace(variant);
  const run = await runAgent(workspace, agentPrompt(task), model);
  const result = await scoreWorkspace(workspace, task, `${variant}-${task.id}`);
  rmSync(workspace, { recursive: true, force: true });

  const score: TaskScore = {
    passed:
      run.exitCode === 0 && result.targetExists && result.violations.length === 0 && result.unmetIntent.length === 0,
    problems: result.violations.length,
    intentMet: task.intent.length - result.unmetIntent.length,
    intentTotal: task.intent.length,
  };
  console.log(
    `${score.passed ? "pass" : "FAIL"}  ${task.id}  (${score.problems} problems, intent ${score.intentMet}/${score.intentTotal}, ${run.turns ?? "?"} turns, ${run.seconds}s)${compared(task, score)}`,
  );
  return {
    task: task.id,
    ...score,
    agentExitCode: run.exitCode,
    targetWritten: result.targetExists,
    turns: run.turns,
    seconds: run.seconds,
    models: run.models,
    unmetIntent: result.unmetIntent.map(describeIntent),
    violations: result.violations.map((violation) => ({
      rule: violation.rule,
      file: relative(root, violation.file),
      line: violation.line,
      message: violation.message,
    })),
  };
}

console.log(`Running ${tasks.length} task(s) in the ${variant} setup with: ${agentCommandLine(model)}`);
if (variant === "harness" && !baseline) console.log("No team baseline yet. Record one with --save-baseline.");
const results = await Promise.all(tasks.map(runTask));
const passedCount = results.filter((result) => result.passed).length;
const date = new Date().toISOString().slice(0, 10);
const models = [...new Set(results.flatMap((result) => result.models))];
const fileName = `${[date, variant, model ?? ""].filter(Boolean).join("-")}.json`;
const report = {
  generatedBy: "evals/run.ts",
  date,
  variant,
  agent: agentCommandLine(model),
  models,
  passed: passedCount,
  total: results.length,
  results,
};

mkdirSync(RESULTS_DIR, { recursive: true });
writeFileSync(`${RESULTS_DIR}/${fileName}`, `${JSON.stringify(report, null, 2)}\n`);
console.log(`\n${passedCount}/${results.length} tasks passed ds check and intent. Wrote evals/results/${fileName}.`);

if (saveBaseline) {
  const scores = Object.fromEntries(
    results.map(({ task, passed, problems, intentMet, intentTotal }) => [task, { passed, problems, intentMet, intentTotal }]),
  );
  const next: Baseline = { date, models, tasks: { ...baseline?.tasks, ...scores } };
  writeFileSync(BASELINE_FILE, `${JSON.stringify(next, null, 2)}\n`);
  console.log("Wrote evals/baseline.json.");
}
process.exit(passedCount === results.length ? 0 : 1);
