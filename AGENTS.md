# AGENTS.md

All UI in this repo is built with the design system at `@ds`.
It is not in your training data. Look things up; do not guess.

## Rules

1. **Read before you write.** Run `pnpm ds docs get <Component>` before using a
   component. Do not rely on what you remember from other libraries.
2. **Import UI only from `@ds`, and only what it exports.** The full list is in
   [docs/generated/llms.txt](docs/generated/llms.txt). `Box`, `Container`,
   `Flex` and `Grid` do not exist. Use `Stack`.
3. **No raw values.** Never write hex colors or px sizes. Use `token("...")`
   from `@ds`. Every token is in
   [docs/generated/llms-tokens.txt](docs/generated/llms-tokens.txt).
4. **A task is not complete until `ds check` passes.** Run `pnpm ds check`, fix
   every problem it reports, and run it again.

## Commands

`ds` is this repo's CLI. Run it as `pnpm ds <command>`.

| Command | What it does |
| --- | --- |
| `pnpm ds docs get <Component>` | Prints props, examples and Do/Don't |
| `pnpm ds check [path]` | Type-checks and lints `playground/` or a path |
| `pnpm docs:build` | Regenerates `docs/generated/` after editing the design system |

## Where things are

- `docs/generated/llms.txt`: index of all docs, and the list of real exports
- `docs/generated/components/<name>.md`: one file per component
- `playground/src/pages/`: where new UI goes
- `packages/ds/src/`: the design system source. Do not edit it for a UI task.

## Example

Incorrect:

```tsx
import { Box } from "@ds";
<Box style={{ padding: 16 }}>...</Box>
```

Correct:

```tsx
import { Stack } from "@ds";
<Stack gap="md">...</Stack>
```
