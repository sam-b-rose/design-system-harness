---
name: design-system
description: Build or change UI with the @ds design system. Use for any task that creates or edits React UI in this repo, such as pages, forms, cards and messages.
---

# Design system skill

All UI in this repo uses `@ds`. It is not in your training data. Retrieve the
docs with the `ds` CLI (`pnpm ds <command>`), then write code, then check it.

## Rules

Never violate these.

1. Run `ds docs get <Component>` before writing code that uses a component.
2. Import UI only from `@ds`, and only names printed by `ds exports`.
3. Use `Stack` for layout and spacing. Never a `div` with flex, grid or gap.
4. Use tokens for every color, space, radius and font size. Never hex or px.
5. A task is not complete until `ds check` passes.

## Routing

Read only the reference the task needs.

| Task | Read | Run |
| --- | --- | --- |
| Building a form | [references/components.md#textfield](references/components.md#textfield) | `ds docs get TextField`, `ds docs get Button` |
| Showing an error, success or info message | [references/components.md#alert](references/components.md#alert) | `ds docs get Alert` |
| Grouping content in a panel or section | [references/components.md#card](references/components.md#card) | `ds docs get Card` |
| Adding a page or section title | [references/components.md#heading](references/components.md#heading) | `ds docs get Heading` |
| Arranging or spacing elements | [references/layout.md](references/layout.md) | `ds docs get Stack` |
| Choosing a color, space, radius or font size | [references/tokens.md](references/tokens.md) | `ds tokens list` |
| Not sure a component exists | [references/components.md#allow-list](references/components.md#allow-list) | `ds exports` |
| Not sure which component fits | | `ds docs search <query>` |

## Workflow

Incorrect: write from memory, then report the task as done.

```
(writes <Button color="primary" size="lg"> because other libraries have those props)
"The login form is complete."
```

Correct: retrieve, write, check, fix, check again.

```
pnpm ds docs get Button     # props are variant, type, disabled, onClick
(writes <Button variant="primary" type="submit">)
pnpm ds check               # 1 problem
(fixes the reported problem)
pnpm ds check               # ds check passed
"The login form is complete. ds check passes."
```
