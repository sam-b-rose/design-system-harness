# Tokens

## Rules

1. Never write a hex color or a px value in a `style` prop, a `className` (such as `p-[16px]`) or a CSS file.
2. In TSX, use `token("<path>")` from `@ds`. In CSS, use the matching `var(--...)`.
3. Run `ds tokens list` for values, or `ds tokens list --category color` for one category.

## Token paths

<!-- generated:token-paths:start -->
<!-- generated:token-paths:end -->

## Failure mode: hard-coded hex and px instead of tokens

Incorrect:

```tsx
<p style={{ color: "#5c6370", fontSize: 14, marginTop: "8px" }}>Last saved 2 minutes ago</p>
```

Correct:

```tsx
import { token } from "@ds";

<p style={{ color: token("color.text.muted"), fontSize: token("fontSize.sm"), margin: 0 }}>
  Last saved 2 minutes ago
</p>
```

`ds check` reports: `Hard-coded color "#5c6370". Use a color token, e.g. token("color.bg.page") (see: ds tokens list --category color).`
