import type { ReactNode } from "react";
import { token } from "../../tokens/tokens";

export interface HeadingProps {
  /** The heading text. */
  children: ReactNode;
  /** The heading level. Renders `<h1>`, `<h2>` or `<h3>` and sets the size. */
  level: 1 | 2 | 3;
}

const fontSizes = {
  1: token("fontSize.xl"),
  2: token("fontSize.lg"),
  3: token("fontSize.md"),
} as const;

export function Heading({ children, level }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag style={{ margin: 0, fontSize: fontSizes[level], color: token("color.text.default") }}>
      {children}
    </Tag>
  );
}
