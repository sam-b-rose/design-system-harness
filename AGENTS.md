# AGENTS.md

All UI in this repo is built with the design system at `@ds`.
It is not in your training data. Look things up; do not guess.

## Rules

1. **Read before you write.** Run `pnpm ds docs get <Component>` before using a
   component. Do not rely on what you remember from other libraries.
2. **Import UI only from `@ds`, and only what it exports.** `pnpm ds exports`
   prints the full list.
3. **No raw values.** Never write hex colors or px sizes. Use `token("...")`
   from `@ds`. `pnpm ds tokens list` prints every token.
4. **A task is not complete until `ds check` passes.** Run `pnpm ds check`, fix
   every problem it reports, and run it again.

Read the skill for your task before you start:

- Building or changing UI: [skills/build-ui/SKILL.md](skills/build-ui/SKILL.md)
- Reviewing UI: [skills/review-ui/SKILL.md](skills/review-ui/SKILL.md)

## Commands

`ds` is this repo's CLI. Run it as `pnpm ds <command>`.

| Command | What it does |
| --- | --- |
| `pnpm ds docs get <Component>` | Prints props, examples and Do/Don't |
| `pnpm ds docs search <query>` | Finds the docs sections matching a query |
| `pnpm ds exports` | Lists everything `@ds` exports |
| `pnpm ds tokens list` | Lists design tokens |
| `pnpm ds add <page\|form> <name>` | Creates a starting file in `playground/src/pages/` |
| `pnpm ds check [path]` | Type-checks, lints and audits `playground/` or a path |
| `pnpm docs:build` | Regenerates `docs/generated/` after editing the design system |

## Where things are

- `docs/generated/llms.txt`: index of all generated docs
- `playground/src/pages/`: where new UI goes. Start with `pnpm ds add`.
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
