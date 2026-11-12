# ds-agent-starter

A small, working starter for making a design system reliable for coding agents. It shows the full loop: the agent retrieves authoritative docs, generates UI through supported paths, and a deterministic check tells it what to fix. The bundled design system is tiny and meant to be replaced; the toolkit around it is the point.

Companion to the blog post: _link to be added when the post is published_.

## The five essentials

| Essential | Where it lives | Status |
| --- | --- | --- |
| 1. Machine-readable docs, compiled from source | `scripts/build-docs.ts` → `docs/generated/` | `m1`, `m2` |
| 2. A small agent instruction file | `AGENTS.md`, `skills/design-system/` | `m1`, `m2` |
| 3. A reliable retrieval path | `cli/` (`ds docs get`, `docs search`, `exports`, `tokens list`) | `m1`, `m2` |
| 4. A generate → check → fix loop | `cli/templates/` (`ds add`), `cli/lib/check.ts`, `lint/` | `m1`, `m3` |
| 5. A small regression suite | `evals/` | `m1` (full set and CI in `m4`) |

Each milestone is a git tag. `m1-first-loop` is one task (a login form) working end to end. `m2-skill-and-retrieval` adds the remaining components, the skill and the rest of the read-only CLI. `m3-scaffold-and-audit` adds `ds add`, the `prefer-stack` rule and the component audit.

## Quickstart

Requires Node 20+ and pnpm.

```bash
pnpm i
pnpm docs:build
pnpm evals
```

Then try the loop by hand:

```bash
pnpm ds docs get Stack
pnpm ds check
```

Add `import { Box } from "@ds";` to a file in `playground/src/pages/` and run `pnpm ds check` again:

```
playground/src/pages/Example.tsx:1:10  ds/no-unknown-imports
  Box is not exported by @ds. Use Stack (see: ds docs get Stack).
```

## Commands

| Command | What it does |
| --- | --- |
| `pnpm ds docs get <Component>` | Prints a component's generated docs |
| `pnpm ds docs search <query>` | Ranks the generated docs sections that match a query |
| `pnpm ds exports` | Prints the allow-list of real exports |
| `pnpm ds tokens list [--category color]` | Prints design tokens |
| `pnpm ds add <page\|form> <name>` | Creates a canonical starting file in `playground/src/pages/` from `cli/templates/` |
| `pnpm ds check [path...]` | Type-checks, lints and audits `playground/` or the given paths. No LLM involved. |
| `pnpm docs:build` | Compiles `docs/generated/` and `tokens.css` from TSDoc, `*.docs.md`, examples and `tokens.ts` |
| `pnpm docs:check` | Fails if generated files are out of date |
| `pnpm evals` | Asserts good fixtures pass `ds check` and bad fixtures fail with the expected rule |
| `pnpm test` | Unit tests for the lint rules and the agent-facing files |
| `pnpm dev` | Runs the playground |

## What `ds check` runs

| Stage | Rule IDs | Catches |
| --- | --- | --- |
| Type-check | `tsc/TS<code>` | Wrong props, missing imports |
| Lint (`lint/rules/`) | `ds/no-unknown-imports` | Imports that `@ds` does not export, with a tailored message for known hallucinations |
| | `ds/no-raw-values` | Hex colors and px sizes in `style` props and CSS files |
| | `ds/prefer-stack` | Host elements styled with flex, grid or gap |
| Audit (`lint/audit/`) | `audit/textfield-label` | A `TextField` without a visible label |
| | `audit/one-primary-button` | More than one primary `Button` in a file |

Every message says what to do next. Inline `eslint-disable` comments are ignored. The exit code is 0 when there are no problems, 1 when there are, and 2 for a bad path.

## How it fits together

- `ds.config.ts` holds the import alias, the CLI name and the known hallucinations. The lint rules, the generated docs and the evals all read from it.
- `packages/ds/src/index.ts` is the only public entry. The allow-list of real exports is read from it with the TypeScript compiler, never typed by hand.
- `skills/design-system/SKILL.md` routes a task to one of three references. The allow-list and token paths inside the references are generated between markers by `docs:build`; the rules and Incorrect/Correct pairs around them are hand-written.
- Docs have one source: TSDoc on `<Name>Props`, a co-located `<Name>.docs.md`, and real `examples/*.tsx` files that are type-checked.

## Adopting this starter

- Replace: `packages/ds/src` (your components and tokens).
- Keep: `cli/`, `lint/`, `scripts/`, `evals/run.ts`, `skills/`.
- Edit: `cli/templates/` (your canonical page and form; each file becomes a `ds add` kind), `lint/audit/` (checks specific to your components), `ds.config.ts` (alias, CLI name, layout component, your own known hallucinations), the rules in `AGENTS.md`, the routing table and Incorrect/Correct pairs in `skills/design-system/`, and the fixtures in `evals/`.

If you change the alias in `ds.config.ts`, change `paths` in `tsconfig.json` to match. A test fails if they disagree.
