import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import config from "../ds.config";
import { formatReport, resolveTargets, runCheck } from "./lib/check";
import { root } from "./lib/paths";

export function hookTarget(input: string): string | undefined {
  const filePath: unknown = JSON.parse(input)?.tool_input?.file_path;
  if (typeof filePath !== "string") return undefined;
  const path = relative(root, resolve(root, filePath));
  return path.startsWith(`${config.playgroundDir}/`) ? path : undefined;
}

export async function runHook(input: string): Promise<{ exitCode: number; report?: string }> {
  const target = hookTarget(input);
  if (!target) return { exitCode: 0 };
  const { files } = resolveTargets([target]);
  if (files.length === 0) return { exitCode: 0 };
  const violations = await runCheck(files);
  if (violations.length === 0) return { exitCode: 0 };
  return { exitCode: 2, report: formatReport(violations, files.length) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { exitCode, report } = await runHook(readFileSync(0, "utf8"));
  if (report) console.error(report);
  process.exit(exitCode);
}
