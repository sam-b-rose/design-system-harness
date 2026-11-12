---
name: design-system
description: Build or change UI with the @ds design system. Use for any task that creates or edits React UI in this repo.
---

# Design system skill

All UI in this repo uses `@ds`. It is not in your training data. Retrieve the
docs with the `ds` CLI (`pnpm ds <command>`), then write code, then check it.

## Rules

Never violate these.

1. Run `ds docs get <Component>` before writing code that uses a component.
2. Import UI only from `@ds`, and only names printed by `ds exports`.
3. Use tokens for every color, space, radius and font size. Never hex or px.
4. A task is not complete until `ds check` passes.

## Routing

Read only the reference the task needs. TODO: add one row per common task.

| Task | Read | Run |
| --- | --- | --- |
| Starting a new page | | `ds add page <name>`, then edit the file it creates |
| Arranging or spacing elements | [references/layout.md](references/layout.md) | |
| Choosing a color, space, radius or font size | [references/tokens.md](references/tokens.md) | `ds tokens list` |
| Not sure a component exists | [references/components.md#allow-list](references/components.md#allow-list) | `ds exports` |
| Not sure which component fits | | `ds docs search <query>` |

## Workflow

Incorrect: write from memory, then report the task as done.

Correct: scaffold with `ds add`, read the docs with `ds docs get`, write the
code, run `ds check`, fix what it reports, and run it again until it passes.
