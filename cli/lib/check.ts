import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import ts from "typescript";
import config from "../../ds.config";
import { lintFiles } from "../../lint/index";
import { root } from "./paths";
import { loadCompilerOptions } from "./typescript";

export interface Violation {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
}

const CHECKED_EXTENSIONS = /\.(ts|tsx|css)$/;
const SKIPPED_DIRECTORIES = new Set(["node_modules", "dist", ".git"]);

function collectFiles(target: string): string[] {
  if (statSync(target).isFile()) return CHECKED_EXTENSIONS.test(target) ? [target] : [];
  return readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return SKIPPED_DIRECTORIES.has(entry.name) ? [] : collectFiles(join(target, entry.name));
    }
    return CHECKED_EXTENSIONS.test(entry.name) ? [join(target, entry.name)] : [];
  });
}

function typecheck(files: string[]): Violation[] {
  const sources = files.filter((file) => /\.tsx?$/.test(file));
  if (sources.length === 0) return [];
  const checked = new Set(sources);
  const program = ts.createProgram(sources, loadCompilerOptions());

  return ts.getPreEmitDiagnostics(program).flatMap((diagnostic) => {
    const fileName = diagnostic.file && resolve(diagnostic.file.fileName);
    if (!fileName || !checked.has(fileName) || diagnostic.start === undefined) return [];
    const position = diagnostic.file!.getLineAndCharacterOfPosition(diagnostic.start);
    return [
      {
        file: fileName,
        line: position.line + 1,
        column: position.character + 1,
        rule: `tsc/TS${diagnostic.code}`,
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
      },
    ];
  });
}

export function resolveTargets(targets: string[]): { files: string[]; missing: string[] } {
  const requested = targets.length > 0 ? targets : [config.playgroundDir];
  const absolute = requested.map((target) => resolve(root, target));
  return {
    files: absolute.filter(existsSync).flatMap(collectFiles),
    missing: requested.filter((_, index) => !existsSync(absolute[index])),
  };
}

export async function runCheck(files: string[]): Promise<Violation[]> {
  const lint = await lintFiles(files);
  const position = (violation: Violation) => `${violation.file}:${violation.line}:${violation.column}`;
  const explainedByLint = new Set(lint.filter((finding) => finding.rule === "ds/no-unknown-imports").map(position));
  const types = typecheck(files).filter((violation) => !explainedByLint.has(position(violation)));

  return [...types, ...lint].sort(
    (a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column || a.rule.localeCompare(b.rule),
  );
}

export function formatReport(violations: Violation[], fileCount: number): string {
  const cli = config.cliName;
  if (violations.length === 0) {
    return `${cli} check passed: ${fileCount} files, 0 problems.`;
  }
  const blocks = violations.map(
    (violation) =>
      `${relative(root, violation.file)}:${violation.line}:${violation.column}  ${violation.rule}\n  ${violation.message}`,
  );
  const noun = violations.length === 1 ? "problem" : "problems";
  return `${blocks.join("\n\n")}\n\n${cli} check failed: ${violations.length} ${noun}. Fix each one, then run \`${cli} check\` again.`;
}
