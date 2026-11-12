import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import config from "../../ds.config";
import type { TextResult } from "./format";
import { fromRoot, root } from "./paths";

const TEMPLATES_DIR = fromRoot("cli/templates");
const COMPONENT_PLACEHOLDER = "Template";
const TITLE_PLACEHOLDER = "Template title";

export function listTemplates(): string[] {
  return readdirSync(TEMPLATES_DIR)
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => basename(file, ".tsx"))
    .sort();
}

function toWords(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

const capitalize = (word: string) => word[0].toUpperCase() + word.slice(1);

export function nameParts(kind: string, name: string): { componentName: string; title: string } {
  const words = toWords(name);
  if (words.at(-1) !== kind) words.push(kind);
  return {
    componentName: words.map(capitalize).join(""),
    title: capitalize(words.slice(0, -1).join(" ") || kind),
  };
}

export function renderTemplate(kind: string, name: string): { componentName: string; source: string } {
  const { componentName, title } = nameParts(kind, name);
  const source = readFileSync(join(TEMPLATES_DIR, `${kind}.tsx`), "utf8")
    .replace(TITLE_PLACEHOLDER, title)
    .replace(new RegExp(`\\b${COMPONENT_PLACEHOLDER}\\b`, "g"), componentName);
  return { componentName, source };
}

export function scaffold(kind: string | undefined, name: string | undefined, targetDir = config.pagesDir): TextResult {
  const cli = config.cliName;
  const kinds = listTemplates();
  if (!kind || !kinds.includes(kind) || !name || toWords(name).length === 0 || !/^[A-Za-z]/.test(name)) {
    return { ok: false, message: `Usage: ${cli} add <${kinds.join("|")}> <name>, e.g. ${cli} add form login` };
  }

  const { componentName, source } = renderTemplate(kind, name);
  const file = join(fromRoot(targetDir), `${componentName}.tsx`);
  const shown = relative(root, file);
  if (existsSync(file)) {
    return { ok: false, message: `${shown} already exists. Edit it, or pick another name.` };
  }
  mkdirSync(fromRoot(targetDir), { recursive: true });
  writeFileSync(file, source);

  return {
    ok: true,
    text: [
      `Created ${shown} (exports ${componentName}).`,
      "",
      "Next:",
      `  1. Read the docs for each component you add: ${cli} docs get <Component>`,
      `  2. Edit ${shown}`,
      `  3. Run: ${cli} check`,
    ].join("\n"),
  };
}
