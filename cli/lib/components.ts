import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import config from "../../ds.config";
import { fromRoot } from "./paths";

export function componentDir(name: string): string {
  return fromRoot(config.componentsDir, name);
}

export function componentFile(name: string): string {
  return join(componentDir(name), `${name}.tsx`);
}

export function listComponents(): string[] {
  const dir = fromRoot(config.componentsDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(componentFile(entry.name)))
    .map((entry) => entry.name)
    .sort();
}
