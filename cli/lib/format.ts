import config from "../../ds.config";
import { exportNames } from "./exports";
import { listTokens } from "./tokens";

export type TextResult = { ok: true; text: string } | { ok: false; message: string };

function table(rows: string[][]): string {
  const widths = rows[0].map((_, column) => Math.max(...rows.map((row) => row[column].length)));
  return rows.map((row) => row.map((cell, column) => cell.padEnd(widths[column])).join("  ").trimEnd()).join("\n");
}

export function formatExports(): string {
  const notExported = Object.entries(config.knownHallucinations).map(
    ([name, replacement]) => `  ${name} -> use ${replacement}`,
  );
  return [
    `Everything ${config.alias} exports. Nothing else exists.`,
    "",
    `Components: ${exportNames("component").join(", ") || "none yet"}`,
    `Functions:  ${exportNames("value").join(", ")}`,
    `Types:      ${exportNames("type").join(", ")}`,
    "",
    "Not exported (common mistakes):",
    ...(notExported.length > 0 ? notExported : ["  none listed in ds.config.ts"]),
    "",
    `Read a component's docs before using it: ${config.cliName} docs get <Component>`,
  ].join("\n");
}

export function formatTokens(category?: string): TextResult {
  const categories = [...new Set(listTokens().map((entry) => entry.category))];
  if (category && !categories.includes(category)) {
    return { ok: false, message: `Unknown token category "${category}". Categories: ${categories.join(", ")}.` };
  }
  const rows = listTokens(category).map((entry) => [`token("${entry.path}")`, `var(${entry.cssVar})`, entry.value]);
  return { ok: true, text: table([["TSX", "CSS", "VALUE"], ...rows]) };
}
