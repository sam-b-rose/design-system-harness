import { readFileSync } from "node:fs";
import { rawValueMessage } from "./rules/no-raw-values";

export interface CssFinding {
  line: number;
  column: number;
  message: string;
}

export function scanCss(file: string): CssFinding[] {
  const withoutComments = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, (comment) =>
    comment.replace(/[^\n]/g, " "),
  );
  return withoutComments.split("\n").flatMap((text, index) => {
    const message = rawValueMessage(text);
    if (!message) return [];
    return [{ line: index + 1, column: text.search(/\S/) + 1, message }];
  });
}
