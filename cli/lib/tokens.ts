import config from "../../ds.config";
import { cssVarName, tokens } from "../../packages/ds/src/tokens/tokens";

export interface FlatToken {
  path: string;
  category: string;
  cssVar: string;
  usage: string[];
  value: string;
}

const tokenUsage = config.tokenUsage ?? ((path: string) => [`token("${path}")`]);

type TokenTree = { readonly [key: string]: string | TokenTree };

function flatten(tree: TokenTree, prefix: string[]): FlatToken[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const segments = [...prefix, key];
    if (typeof value !== "string") return flatten(value, segments);
    const path = segments.join(".");
    return [{ path, category: segments[0], cssVar: cssVarName(path), usage: tokenUsage(path), value }];
  });
}

export function listTokens(category?: string): FlatToken[] {
  const all = flatten(tokens, []);
  return category ? all.filter((entry) => entry.category === category) : all;
}

export function exampleToken(categories: string[]): string {
  const match = listTokens().find((entry) => categories.includes(entry.category));
  return match?.usage[0] ?? "a design token";
}
