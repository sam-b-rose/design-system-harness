import config from "../ds.config";
import { formatReport, resolveTargets, runCheck } from "./lib/check";
import { getComponentDoc } from "./lib/docs";
import { formatExports, formatTokens, type TextResult } from "./lib/format";
import { listTemplates, scaffold } from "./lib/scaffold";
import { formatSearch } from "./lib/search";

const cli = config.cliName;

const USAGE = `Usage: ${cli} <command>

  ${cli} docs get <Component>          Print a component's docs: props, examples, Do/Don't
  ${cli} docs search <query>           Find the docs sections that best match a query
  ${cli} exports                       List everything ${config.alias} exports
  ${cli} tokens list [--category <c>]  List design tokens
  ${cli} add <${listTemplates().join("|")}> <name>          Create a starting file in ${config.pagesDir}/
  ${cli} check [path...]               Type-check, lint and audit files (default: ${config.playgroundDir}/)

Run it through pnpm: pnpm ${cli} <command>`;

function fail(message: string, exitCode: number): never {
  console.error(message);
  process.exit(exitCode);
}

function print(result: TextResult): void {
  if (!result.ok) fail(result.message, 1);
  console.log(result.text);
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

  if (command === "docs" && rest[0] === "search") {
    const query = rest.slice(1).join(" ");
    if (!query) fail(`Missing search query.\n\n${USAGE}`, 2);
    print(formatSearch(query));
    return;
  }

  if (command === "exports") {
    console.log(formatExports());
    return;
  }

  if (command === "tokens" && rest[0] === "list") {
    const flag = rest.indexOf("--category");
    if (flag !== -1 && !rest[flag + 1]) fail(`Missing value for --category.\n\n${USAGE}`, 2);
    print(formatTokens(flag === -1 ? undefined : rest[flag + 1]));
    return;
  }

  if (command === "add") {
    print(scaffold(rest[0], rest[1]));
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
