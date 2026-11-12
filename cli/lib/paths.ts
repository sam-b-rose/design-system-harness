import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export function fromRoot(...segments: string[]): string {
  return resolve(root, ...segments);
}
