import config from "../ds.config";
import { formatReport, resolveTargets, runCheck } from "./lib/check";
import { getComponentDoc } from "./lib/docs";

const cli = config.cliName;

const USAGE = `Usage: ${cli} <command>

  ${cli} docs get <Component>   Print a component's docs: props, examples, Do/Don't
  ${cli} check [path...]        Type-check and lint files (default: ${config.playgroundDir}/)

Run it through pnpm: pnpm ${cli} <command>`;

function fail(message: string, exitCode: number): never {
  console.error(message);
  process.exit(exitCode);
}

async function main(args: string[]): Promise<void> {
  const [command, ...rest] = args;

  if (command === "docs" && rest[0] === "get") {
    if (!rest[1]) fail(`Missing component name.\n\n${USAGE}`, 2);
    const result = getComponentDoc(rest[1]);
    if (!result.ok) fail(result.message, 1);
    console.log(result.markdown.trimEnd());
    return;
  }

  if (command === "check") {
    const { files, missing } = resolveTargets(rest);
    if (missing.length > 0) fail(`Path not found: ${missing.join(", ")}`, 2);
    const violations = await runCheck(files);
    console.log(formatReport(violations, files.length));
    process.exit(violations.length === 0 ? 0 : 1);
  }

  fail(USAGE, command === undefined || command === "help" || command === "--help" ? 0 : 2);
}

await main(process.argv.slice(2));
