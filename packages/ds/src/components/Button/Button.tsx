import type { ReactNode } from "react";
import { token } from "../../tokens/tokens";

export interface ButtonProps {
  /** The button label. */
  children: ReactNode;
  /**
   * Visual emphasis. Use at most one `primary` button per view.
   * @default "secondary"
   */
  variant?: "primary" | "secondary";
  /**
   * Native button type. Use `submit` for the main action of a form.
   * @default "button"
   */
  type?: "button" | "submit";
  /**
   * Prevents interaction and dims the button.
   * @default false
   */
  disabled?: boolean;
  /** Called when the button is activated. */
  onClick?: () => void;
}

export function Button({
  children,
  variant = "secondary",
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: `${token("space.sm")} ${token("space.md")}`,
        borderRadius: token("radius.md"),
        border: `1px solid ${token(isPrimary ? "color.bg.primary" : "color.border.default")}`,
        background: token(isPrimary ? "color.bg.primary" : "color.bg.surface"),
        color: token(isPrimary ? "color.text.onPrimary" : "color.text.default"),
        fontSize: token("fontSize.md"),
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
