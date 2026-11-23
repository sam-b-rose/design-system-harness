import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const ENTRY = "packages/ds/src/index.ts";
export const COMPONENTS_DIR = "packages/ds/src/components";
export const GENERATED_DIR = "docs/generated";
export const PLAYGROUND_DIR = "playground";
export const PAGES_DIR = "playground/src/pages";

export function fromRoot(...segments: string[]): string {
  return resolve(root, ...segments);
}
