import type { ReactNode } from "react";
import { token, type SpaceToken } from "../../tokens/tokens";

export interface StackProps {
  /** The elements to lay out. */
  children: ReactNode;
  /**
   * The axis children are placed along.
   * @default "vertical"
   */
  direction?: "vertical" | "horizontal";
  /**
   * Space between children, as a `space` token name.
   * @default "md"
   */
  gap?: SpaceToken;
  /**
   * Alignment on the cross axis.
   * @default "stretch"
   */
  align?: "start" | "center" | "end" | "stretch";
}

const alignItems = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
} as const;

export function Stack({
  children,
  direction = "vertical",
  gap = "md",
  align = "stretch",
}: StackProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction === "vertical" ? "column" : "row",
        gap: token(`space.${gap}`),
        alignItems: alignItems[align],
      }}
    >
      {children}
    </div>
  );
}
