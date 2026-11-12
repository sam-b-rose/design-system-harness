import ts from "typescript";
import config from "../../ds.config";
import { listComponents } from "./components";
import { fromRoot } from "./paths";
import { loadCompilerOptions } from "./typescript";

export interface DsExport {
  name: string;
  kind: "component" | "value" | "type";
}

let cached: DsExport[] | undefined;

export function getExports(): DsExport[] {
  if (cached) return cached;

  const entry = fromRoot(config.entry);
  const program = ts.createProgram([entry], loadCompilerOptions());
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  const moduleSymbol = source && checker.getSymbolAtLocation(source);
  if (!moduleSymbol) {
    cached = [];
    return cached;
  }

  const components = new Set(listComponents());
  cached = checker
    .getExportsOfModule(moduleSymbol)
    .map((symbol): DsExport => {
      const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      const isValue = (target.flags & ts.SymbolFlags.Value) !== 0;
      const kind = components.has(symbol.name) ? "component" : isValue ? "value" : "type";
      return { name: symbol.name, kind };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  return cached;
}

export function exportNames(kind?: DsExport["kind"]): string[] {
  return getExports()
    .filter((entry) => !kind || entry.kind === kind)
    .map((entry) => entry.name);
}
