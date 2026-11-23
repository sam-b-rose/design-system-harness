import parser from "@typescript-eslint/parser";
import { ESLint } from "eslint";
import { root } from "../cli/lib/paths";
import { onePrimaryButton } from "./audit/one-primary-button";
import { textfieldLabel } from "./audit/textfield-label";
import { scanCss } from "./css-raw-values";
import { noRawValues } from "./rules/no-raw-values";
import { noUnknownImports } from "./rules/no-unknown-imports";
import { preferStack } from "./rules/prefer-stack";

export interface LintFinding {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
}

export const rules = {
  "no-unknown-imports": noUnknownImports,
  "no-raw-values": noRawValues,
  "prefer-stack": preferStack,
};

export const audits = {
  "textfield-label": textfieldLabel,
  "one-primary-button": onePrimaryButton,
};

const enable = (namespace: string, group: Record<string, unknown>) =>
  Object.keys(group).map((name) => [`${namespace}/${name}`, "error"]);

export async function lintFiles(files: string[]): Promise<LintFinding[]> {
  const sources = files.filter((file) => /\.tsx?$/.test(file));
  const stylesheets = files.filter((file) => file.endsWith(".css"));

  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    allowInlineConfig: false,
    overrideConfig: [
      {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
        plugins: { ds: { rules }, audit: { rules: audits } },
        rules: Object.fromEntries([...enable("ds", rules), ...enable("audit", audits)]),
      },
    ],
  });

  const results = sources.length > 0 ? await eslint.lintFiles(sources) : [];
  const fromSources = results.flatMap((result) =>
    result.messages.map((message) => ({
      file: result.filePath,
      line: message.line,
      column: message.column,
      rule: message.ruleId ?? "eslint/parse-error",
      message: message.message,
    })),
  );
  const fromStylesheets = stylesheets.flatMap((file) =>
    scanCss(file).map((finding) => ({ file, rule: "ds/no-raw-values", ...finding })),
  );
  return [...fromSources, ...fromStylesheets];
}
