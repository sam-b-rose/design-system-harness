import type { ReactNode } from "react";
import { token } from "../../tokens/tokens";

export interface AlertProps {
  /** The message body. */
  children: ReactNode;
  /**
   * The meaning of the message. Sets the color.
   * @default "info"
   */
  tone?: "info" | "success" | "danger";
  /** Short bold summary shown above the message. */
  title?: string;
}

const toneStyles = {
  info: { background: token("color.bg.infoSubtle"), color: token("color.text.info") },
  success: { background: token("color.bg.successSubtle"), color: token("color.text.success") },
  danger: { background: token("color.bg.dangerSubtle"), color: token("color.text.danger") },
} as const;

export function Alert({ children, tone = "info", title }: AlertProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      style={{
        ...toneStyles[tone],
        padding: token("space.md"),
        borderRadius: token("radius.md"),
        fontSize: token("fontSize.sm"),
      }}
    >
      {title ? <strong style={{ display: "block", marginBottom: token("space.xs") }}>{title}</strong> : null}
      {children}
    </div>
  );
}
