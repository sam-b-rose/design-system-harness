export const tokens = {
  color: {
    bg: {
      page: "#f6f7f9",
      surface: "#ffffff",
      primary: "#2f5bea",
      infoSubtle: "#eaf0ff",
      successSubtle: "#e7f6ec",
      dangerSubtle: "#fdecea",
    },
    text: {
      default: "#16181d",
      muted: "#5c6370",
      onPrimary: "#ffffff",
      danger: "#b42318",
      info: "#1d3fae",
      success: "#17663a",
    },
    border: {
      default: "#d0d5dd",
      danger: "#b42318",
    },
  },
  space: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  radius: {
    sm: "4px",
    md: "8px",
  },
  fontSize: {
    sm: "14px",
    md: "16px",
    lg: "20px",
    xl: "28px",
  },
} as const;

type TokenPathOf<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${TokenPathOf<T[K]>}`;
}[keyof T & string];

export type TokenPath = TokenPathOf<typeof tokens>;
export type SpaceToken = keyof typeof tokens.space;

export function cssVarName(path: string): string {
  const kebab = path
    .replace(/\./g, "-")
    .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  return `--${kebab}`;
}

export function token(path: TokenPath): string {
  return `var(${cssVarName(path)})`;
}
