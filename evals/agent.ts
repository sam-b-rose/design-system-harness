import { execFileSync, spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import config from "../ds.config";
import { resolveTargets, runCheck, type Violation } from "../cli/lib/check";
import { fromRoot, root } from "../cli/lib/paths";
import type { Task } from "./run";

export type Variant = "baseline" | "toolkit";

export interface AgentRun {
  exitCode: number | null;
  seconds: number;
  turns: number | null;
  output: string;
}

export interface Score {
  targetExists: boolean;
  files: { path: string; source: string }[];
  violations: Violation[];
}

const BASELINE_PATHS = ["packages/", "playground/", "tsconfig.json"];
const TOOLKIT_EXCLUDED = ["demo/", "evals/", "tests/", ".github/", "scripts/reset/", "README.md"];
const AGENT_TIMEOUT_MS = 10 * 60 * 1000;
const SCORING_DIR = "evals/.tmp/agent";

function trackedFiles(): string[] {
  return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter((file) => file && existsSync(fromRoot(file)));
}

export function createWorkspace(variant: Variant): string {
  const workspace = mkdtempSync(join(tmpdir(), `ds-${variant}-`));
  const startsWithAny = (file: string, prefixes: string[]) => prefixes.some((prefix) => file.startsWith(prefix));
  const files = trackedFiles().filter((file) =>
    variant === "baseline" ? startsWithAny(file, BASELINE_PATHS) : !startsWithAny(file, TOOLKIT_EXCLUDED),
  );
  for (const file of files) {
    mkdirSync(dirname(join(workspace, file)), { recursive: true });
    cpSync(fromRoot(file), join(workspace, file));
  }

  if (variant === "baseline") {
    const { dependencies, devDependencies } = JSON.parse(readFileSync(fromRoot("package.json"), "utf8"));
    const manifest = { name: "app", private: true, type: "module", dependencies, devDependencies };
    writeFileSync(join(workspace, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  } else {
    for (const copy of config.agent.instructionFileCopies) {
      cpSync(fromRoot("AGENTS.md"), join(workspace, copy));
    }
  }
  symlinkSync(fromRoot("node_modules"), join(workspace, "node_modules"));
  return workspace;
}

export function agentPrompt(task: Task): string {
  return `${task.prompt} Use this repo's design system. Write it to ${task.target}.`;
}

export function agentCommandLine(): string {
  return [config.agent.command, ...config.agent.args].join(" ");
}

export function runAgent(workspace: string, prompt: string): Promise<AgentRun> {
  const args = config.agent.args.map((arg) => arg.replace("{prompt}", prompt));
  const started = Date.now();
  return new Promise((resolve) => {
    const child = spawn(config.agent.command, args, { cwd: workspace, stdio: ["ignore", "pipe", "pipe"] });
    const timer = setTimeout(() => child.kill(), AGENT_TIMEOUT_MS);
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ exitCode: null, seconds: 0, turns: null, output: `Could not start ${config.agent.command}: ${error.message}` });
    });
    child.on("close", (exitCode) => {
      clearTimeout(timer);
      const seconds = Math.round((Date.now() - started) / 1000);
      resolve({ exitCode, seconds, ...readAgentOutput(stdout, stderr) });
    });
  });
}

function readAgentOutput(stdout: string, stderr: string): Pick<AgentRun, "turns" | "output"> {
  try {
    const parsed = JSON.parse(stdout);
    return {
      turns: typeof parsed.num_turns === "number" ? parsed.num_turns : null,
      output: typeof parsed.result === "string" ? parsed.result : stdout,
    };
  } catch {
    return { turns: null, output: (stdout || stderr).trim() };
  }
}

export async function scoreWorkspace(workspace: string, task: Task, label: string): Promise<Score> {
  const scoringDir = fromRoot(SCORING_DIR, label);
  const playgroundSource = join(config.playgroundDir, "src");
  rmSync(scoringDir, { recursive: true, force: true });
  cpSync(join(workspace, playgroundSource), scoringDir, { recursive: true });

  const { files } = resolveTargets([relative(root, scoringDir)]);
  const original = (file: string) => join(playgroundSource, relative(scoringDir, file));
  const violations = (await runCheck(files)).map((violation) => ({ ...violation, file: fromRoot(original(violation.file)) }));
  const pagesDir = join(scoringDir, relative(playgroundSource, config.pagesDir));
  const written = files
    .filter((file) => file.startsWith(pagesDir))
    .map((file) => ({ path: original(file), source: readFileSync(file, "utf8") }));

  rmSync(scoringDir, { recursive: true, force: true });
  return { targetExists: existsSync(join(workspace, task.target)), files: written, violations };
}
