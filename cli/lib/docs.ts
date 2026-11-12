import { existsSync, readFileSync } from "node:fs";
import config from "../../ds.config";
import { listComponents } from "./components";
import { fromRoot } from "./paths";

export function componentDocPath(name: string): string {
  return `${config.generatedDir}/components/${name.toLowerCase()}.md`;
}

export type DocResult = { ok: true; markdown: string } | { ok: false; message: string };

export function getComponentDoc(requested: string): DocResult {
  const components = listComponents();
  const name = components.find((entry) => entry.toLowerCase() === requested.toLowerCase());

  if (!name) {
    const replacement = config.knownHallucinations[requested];
    const hint = replacement
      ? `Use ${replacement} (see: ${config.cliName} docs get ${replacement}).`
      : `Real components: ${components.join(", ")}.`;
    return { ok: false, message: `${requested} is not a component in ${config.alias}. ${hint}` };
  }

  const file = fromRoot(componentDocPath(name));
  if (!existsSync(file)) {
    return { ok: false, message: `Docs for ${name} are not built. Run: pnpm docs:build` };
  }
  return { ok: true, markdown: readFileSync(file, "utf8") };
}
