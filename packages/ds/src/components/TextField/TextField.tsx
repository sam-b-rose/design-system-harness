import { useId } from "react";
import { token } from "../../tokens/tokens";

export interface TextFieldProps {
  /** Visible label. Every field must have one. */
  label: string;
  /** Field name submitted with the form. */
  name: string;
  /**
   * Native input type.
   * @default "text"
   */
  type?: "text" | "email" | "password";
  /** Controlled value. Omit for an uncontrolled field. */
  value?: string;
  /** Called with the new value on every change. */
  onChange?: (value: string) => void;
  /** Hint shown while the field is empty. Not a replacement for `label`. */
  placeholder?: string;
  /** Validation message. When set, the field is shown in an error state. */
  error?: string;
  /**
   * Marks the field as required.
   * @default false
   */
  required?: boolean;
}

export function TextField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: token("space.xs") }}>
      <label htmlFor={id} style={{ fontSize: token("fontSize.sm"), color: token("color.text.default") }}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange?.(event.target.value)}
        style={{
          padding: token("space.sm"),
          borderRadius: token("radius.sm"),
          border: `1px solid ${token(error ? "color.border.danger" : "color.border.default")}`,
          background: token("color.bg.surface"),
          color: token("color.text.default"),
          fontSize: token("fontSize.md"),
        }}
      />
      {error ? (
        <span id={errorId} style={{ fontSize: token("fontSize.sm"), color: token("color.text.danger") }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
