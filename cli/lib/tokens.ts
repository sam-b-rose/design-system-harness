import { cssVarName, tokens } from "../../packages/ds/src/tokens/tokens";

export interface FlatToken {
  path: string;
  category: string;
  cssVar: string;
  value: string;
}

type TokenTree = { readonly [key: string]: string | TokenTree };

function flatten(tree: TokenTree, prefix: string[]): FlatToken[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const segments = [...prefix, key];
    if (typeof value !== "string") return flatten(value, segments);
    const path = segments.join(".");
    return [{ path, category: segments[0], cssVar: cssVarName(path), value }];
  });
}

export function listTokens(category?: string): FlatToken[] {
  const all = flatten(tokens, []);
  return category ? all.filter((entry) => entry.category === category) : all;
}

export function exampleToken(categories: string[]): string {
  const match = listTokens().find((entry) => categories.includes(entry.category));
  return match ? `token("${match.path}")` : "a design token";
}
