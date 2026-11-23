import { execFileSync, spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import ts from "typescript";
import config from "../ds.config";
import { resolveTargets, runCheck, type Violation } from "../checks";
import { ENTRY, fromRoot, PAGES_DIR, PLAYGROUND_DIR, root } from "../cli/lib/paths";
import { loadCompilerOptions } from "../cli/lib/typescript";
import { unmetIntent, type IntentCheck, type Task } from "./tasks";

export type Variant = "harness" | "no-harness";

export interface AgentRun {
  exitCode: number | null;
  seconds: number;
  turns: number | null;
  models: string[];
  output: string;
}

export interface AgentOptions {
  model?: string;
  positional: string[];
  flags: string[];
}

export interface Score {
  targetExists: boolean;
  files: { path: string; source: string }[];
  violations: Violation[];
  unmetIntent: IntentCheck[];
}

const NO_HARNESS_PATHS = ["playground/"];
const COMPILED_PACKAGE = "example-ds";
const HARNESS_EXCLUDED = ["evals/", "tests/", ".github/", "README.md", "docs/harness.md"];
const AGENT_TIMEOUT_MS = 10 * 60 * 1000;
const SCORING_DIR = "evals/.tmp/agent";

function trackedFiles(): string[] {
  return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter((file) => file && existsSync(fromRoot(file)));
}

function linkDependencies(workspace: string): void {
  const modules = join(workspace, "node_modules");
  mkdirSync(modules);
  for (const entry of readdirSync(fromRoot("node_modules"))) {
    symlinkSync(fromRoot("node_modules", entry), join(modules, entry));
  }
}

function installCompiledDesignSystem(workspace: string): void {
  const entry = fromRoot(ENTRY);
  const sourceDir = dirname(entry);
  const packageDir = join(workspace, "node_modules", COMPILED_PACKAGE);
  const program = ts.createProgram([entry], {
    ...loadCompilerOptions(),
    noEmit: false,
    allowImportingTsExtensions: false,
    declaration: true,
    rootDir: sourceDir,
    outDir: join(packageDir, "dist"),
  });
  program.emit();

  const stylesheets = trackedFiles().filter((file) => fromRoot(file).startsWith(sourceDir) && file.endsWith(".css"));
  for (const file of stylesheets) {
    cpSync(fromRoot(file), join(packageDir, "dist", relative(sourceDir, fromRoot(file))));
  }
  const manifest = { name: COMPILED_PACKAGE, version: "1.0.0", type: "module", main: "dist/index.js", types: "dist/index.d.ts" };
  writeFileSync(join(packageDir, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

function writeAppProject(workspace: string): void {
  const { dependencies, devDependencies } = JSON.parse(readFileSync(fromRoot("package.json"), "utf8"));
  const manifest = {
    name: "app",
    private: true,
    type: "module",
    scripts: { typecheck: "tsc --noEmit" },
    dependencies: { ...dependencies, [COMPILED_PACKAGE]: "1.0.0" },
    devDependencies,
  };
  writeFileSync(join(workspace, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  const tsconfig = JSON.parse(readFileSync(fromRoot("tsconfig.json"), "utf8"));
  tsconfig.compilerOptions.paths = { [config.alias]: [`./node_modules/${COMPILED_PACKAGE}/dist/index.d.ts`] };
  tsconfig.include = [PLAYGROUND_DIR];
  tsconfig.exclude = ["node_modules"];
  writeFileSync(join(workspace, "tsconfig.json"), `${JSON.stringify(tsconfig, null, 2)}\n`);
}

export function createWorkspace(variant: Variant): string {
  const workspace = mkdtempSync(join(tmpdir(), `ds-${variant}-`));
  const startsWithAny = (file: string, prefixes: string[]) => prefixes.some((prefix) => file.startsWith(prefix));
  const files = trackedFiles().filter((file) =>
    variant === "no-harness" ? startsWithAny(file, NO_HARNESS_PATHS) : !startsWithAny(file, HARNESS_EXCLUDED),
  );
  for (const file of files) {
    mkdirSync(dirname(join(workspace, file)), { recursive: true });
    cpSync(fromRoot(file), join(workspace, file));
  }
  linkDependencies(workspace);

  if (variant === "no-harness") {
    installCompiledDesignSystem(workspace);
    writeAppProject(workspace);
  } else {
    for (const copy of config.agent.instructionFileCopies) {
      cpSync(fromRoot("AGENTS.md"), join(workspace, copy));
    }
  }
  return workspace;
}

export function agentPrompt(task: Task): string {
  return `${task.prompt} Use this repo's design system. Write it to ${task.target}.`;
}

export function parseAgentOptions(args: string[]): AgentOptions {
  const modelFlag = args.indexOf("--model");
  const model = modelFlag === -1 ? undefined : args[modelFlag + 1];
  const others = args.filter((_, index) => modelFlag === -1 || (index !== modelFlag && index !== modelFlag + 1));
  return {
    model,
    positional: others.filter((arg) => !arg.startsWith("--")),
    flags: others.filter((arg) => arg.startsWith("--")),
  };
}

function agentArgs(model?: string): string[] {
  return model ? [...config.agent.args, "--model", model] : config.agent.args;
}

export function agentCommandLine(model?: string): string {
  return [config.agent.command, ...agentArgs(model)].join(" ");
}

export function runAgent(workspace: string, prompt: string, model?: string): Promise<AgentRun> {
  const args = agentArgs(model).map((arg) => arg.replace("{prompt}", prompt));
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
      resolve({ exitCode: null, seconds: 0, turns: null, models: [], output: `Could not start ${config.agent.command}: ${error.message}` });
    });
    child.on("close", (exitCode) => {
      clearTimeout(timer);
      const seconds = Math.round((Date.now() - started) / 1000);
      resolve({ exitCode, seconds, ...readAgentOutput(stdout, stderr) });
    });
  });
}

function readAgentOutput(stdout: string, stderr: string): Pick<AgentRun, "turns" | "models" | "output"> {
  try {
    const parsed = JSON.parse(stdout);
    return {
      turns: typeof parsed.num_turns === "number" ? parsed.num_turns : null,
      models: Object.keys(parsed.modelUsage ?? {}).sort(),
      output: typeof parsed.result === "string" ? parsed.result : stdout,
    };
  } catch {
    return { turns: null, models: [], output: (stdout || stderr).trim() };
  }
}

export async function scoreWorkspace(workspace: string, task: Task, label: string): Promise<Score> {
  const scoringDir = fromRoot(SCORING_DIR, label);
  const playgroundSource = join(PLAYGROUND_DIR, "src");
  rmSync(scoringDir, { recursive: true, force: true });
  cpSync(join(workspace, playgroundSource), scoringDir, { recursive: true });

  const { files } = resolveTargets([relative(root, scoringDir)]);
  const original = (file: string) => join(playgroundSource, relative(scoringDir, file));
  const violations = (await runCheck(files)).map((violation) => ({ ...violation, file: fromRoot(original(violation.file)) }));
  const pagesDir = join(scoringDir, relative(playgroundSource, PAGES_DIR));
  const written = files
    .filter((file) => file.startsWith(pagesDir))
    .map((file) => ({ path: original(file), source: readFileSync(file, "utf8") }));

  rmSync(scoringDir, { recursive: true, force: true });
  const target = join(workspace, task.target);
  const targetExists = existsSync(target);
  const intent = targetExists ? unmetIntent(readFileSync(target, "utf8"), task.intent) : task.intent;
  return { targetExists, files: written, violations, unmetIntent: intent };
}
