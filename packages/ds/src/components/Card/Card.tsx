import type { ReactNode } from "react";
import { token, type SpaceToken } from "../../tokens/tokens";

export interface CardProps {
  /** The card content. */
  children: ReactNode;
  /**
   * Inner padding, as a `space` token name.
   * @default "lg"
   */
  padding?: SpaceToken;
}

export function Card({ children, padding = "lg" }: CardProps) {
  return (
    <section
      style={{
        padding: token(`space.${padding}`),
        background: token("color.bg.surface"),
        border: `1px solid ${token("color.border.default")}`,
        borderRadius: token("radius.md"),
      }}
    >
      {children}
    </section>
  );
}
