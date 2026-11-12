import ts from "typescript";
import { fromRoot, root } from "./paths";

export function loadCompilerOptions(): ts.CompilerOptions {
  const configPath = fromRoot("tsconfig.json");
  const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);
  if (error) {
    throw new Error(ts.flattenDiagnosticMessageText(error.messageText, "\n"));
  }
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  return { ...parsed.options, noEmit: true };
}
