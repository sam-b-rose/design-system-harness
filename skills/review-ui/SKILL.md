---
name: review-ui
description: Review React UI in this repo against the @ds design system. Use when asked to review, audit or check a page, form or component, or a diff that changes UI.
---

# Review UI skill

A review has two passes. `ds check` reports what a machine can decide. You
judge the rest against the design system's rules and cite each one by its ID.

## Rules

1. Every finding cites a rule ID, such as `button/one-primary`. Take IDs from
   `ds docs get` output. Never invent one.
2. Do not repeat what `ds check` already reports.
3. Do not edit files unless asked.

## Workflow

1. Run `pnpm ds check <path>` and copy its report.
2. List the `@ds` components the file imports. Run `pnpm ds docs get <Component>`
   for each.
3. Read the file against each component's Do and Don't rules. Each rule starts
   with its ID.
4. When something looks wrong but no rule covers it, put it under "No rule
   covers this". That list shows where the design system needs a new rule.

## Report

```
playground/src/pages/AccountPage.tsx

ds check: passed

Findings
- line 14, `heading/card-starts-h2`: the "Danger zone" card starts with a level 3 heading. Use level={2}.
- line 22, `alert/not-field-error`: the email error is an Alert. Pass it to TextField as error.

No rule covers this
- line 30: "Delete account" has no confirmation step.
```
