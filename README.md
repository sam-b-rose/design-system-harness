# ds-agent-starter

A small, working starter for making a design system reliable for coding agents. It shows the full loop: the agent retrieves authoritative docs, generates UI through supported paths, and a deterministic check tells it what to fix. The bundled design system is tiny and meant to be replaced; the toolkit around it is the point.

Companion to the blog post: _link to be added when the post is published_.

## The five essentials

1. **Machine-readable docs, compiled from source.** `llms.txt` and per-component Markdown are built from TSDoc, one `*.docs.md` per component and real example files. Nothing agent-facing is written twice.
2. **A small agent instruction file.** `AGENTS.md` is a router under 60 lines: numbered rules, the commands, and a link to a skill that loads detail on demand.
3. **A reliable retrieval path.** The `ds` CLI prints docs, the allow-list of real exports and the tokens as plain text, so any agent with a shell can use it.
4. **A generate → check → fix loop.** `ds add` scaffolds from real components, and `ds check` runs deterministic validators whose messages say what to do next.
5. **A small regression suite.** Known-good and known-bad outputs for representative tasks assert that the validators catch each failure mode.

The loop is drawn in [docs/loop.md](docs/loop.md).

## Where each one lives

| Essential | In the repo | Tag |
| --- | --- | --- |
| 1. Machine-readable docs | `scripts/build-docs.ts` → `docs/generated/` | `m1-first-loop`, `m2-skill-and-retrieval` |
| 2. Instruction file | `AGENTS.md`, `skills/design-system/` | `m1-first-loop`, `m2-skill-and-retrieval` |
| 3. Retrieval path | `cli/` | `m2-skill-and-retrieval` |
| 4. Generate → check → fix | `cli/templates/`, `cli/lib/check.ts`, `lint/` | `m3-scaffold-and-audit` |
| 5. Regression suite | `evals/`, `tests/`, `.github/workflows/ci.yml` | `m4-evals-and-ci` |

`ds.config.ts` ties them together. It holds the import alias, the CLI name and the known hallucinations, and the lint rules, generated docs and evals all read from it.

## Quickstart

Requires Node 20+ and pnpm.

```bash
pnpm i
pnpm docs:build
pnpm evals
```

Then walk the loop by hand:

```bash
pnpm ds docs get Stack
pnpm ds add form login
pnpm ds check
```

Now break it. Change the import in `playground/src/pages/LoginForm.tsx` to `import { Box } from "@ds";` and run `pnpm ds check` again:

```
playground/src/pages/LoginForm.tsx:1:10  ds/no-unknown-imports
  Box is not exported by @ds. Use Stack (see: ds docs get Stack).
```

`pnpm dev` runs the playground and lists every page in `playground/src/pages/`.

## Adopting this starter

Run `pnpm starter:reset`. It removes the sample components, eval tasks, templates and demo results, replaces the sample-specific instructions with TODOs, and leaves scaffolding where every check still passes. Then:

- **Replace** `packages/ds/src` with your components and tokens. Each component needs `<Name>.tsx` exporting `<Name>Props`, a `<Name>.docs.md`, and `examples/*.tsx`. Export it from `index.ts`.
- **Keep** `cli/`, `lint/rules/`, `scripts/`, `evals/run.ts`, `tests/`.
- **Edit**:
  - `ds.config.ts`: the alias, CLI name, layout component, and your own known hallucinations. Each entry feeds the lint message, the generated allow-list and a bad eval fixture.
  - `AGENTS.md` and `skills/design-system/`: your rules, routing table and Incorrect/Correct pairs.
  - `cli/templates/`: your canonical page and form. Each file becomes a `ds add` kind.
  - `lint/audit/`: checks specific to your components.
  - `evals/tasks/` and `evals/fixtures/`: your representative tasks, with one good output and a bad output per failure mode.

If you change the alias, change `paths` in `tsconfig.json` to match. A test fails if they disagree.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm ds docs get <Component>` | Prints a component's generated docs |
| `pnpm ds docs search <query>` | Ranks the generated docs sections that match a query |
| `pnpm ds exports` | Prints the allow-list of real exports |
| `pnpm ds tokens list [--category color]` | Prints design tokens |
| `pnpm ds add <page\|form> <name>` | Creates a starting file in `playground/src/pages/` |
| `pnpm ds check [path...]` | Type-checks, lints and audits `playground/` or the given paths |
| `pnpm docs:build` / `pnpm docs:check` | Compiles the generated files / fails if they are out of date |
| `pnpm evals` | Asserts good fixtures pass `ds check` and bad fixtures fail with the expected rule |
| `pnpm test` | Tests for the lint rules, the CLI and the agent-facing files |
| `pnpm demo:compare [task]` | Runs an agent on one task with and without the toolkit |
| `pnpm starter:reset` | Removes the sample content |

## What `ds check` runs

| Stage | Rule IDs | Catches |
| --- | --- | --- |
| Type-check | `tsc/TS<code>` | Guessed props, missing imports |
| Lint (`lint/rules/`) | `ds/no-unknown-imports` | Imports that `@ds` does not export, with a tailored message for known hallucinations |
| | `ds/no-raw-values` | Hex colors and px sizes in `style` props and CSS files |
| | `ds/prefer-stack` | Host elements styled with flex, grid or gap |
| Audit (`lint/audit/`) | `audit/textfield-label` | A `TextField` without a visible label |
| | `audit/one-primary-button` | More than one primary `Button` in a file |

Every message says what to do next. Inline `eslint-disable` comments are ignored. The exit code is 0 for no problems, 1 for problems, 2 for a bad path. No LLM is involved.

## The regression suite

`evals/tasks/*.json` holds five tasks: login form, settings card, empty state, sign-up form with errors, and account page. Each has a prompt, a target file and fixtures in `evals/fixtures/`:

- `good/<task>.tsx` must pass `ds check`.
- `bad/<task>.<failure>.tsx` must fail with the rule named in the task file.
- For every entry in `knownHallucinations`, the runner swaps the real component for the hallucinated one in the good fixture and asserts that the message names the replacement.

CI runs `docs:check`, `typecheck`, `lint`, `test` and `evals`, plus a second job that runs `starter:reset` and repeats the checks.

## Before and after

`pnpm demo:compare` gives the same prompt to an agent in two temporary copies of the repo: a baseline with only the design system source and the playground, and the full toolkit. It scores both with `ds check` and writes the reports to [demo/results/](demo/results/README.md). One real run is committed there.

The agent command is set in `ds.config.ts` under `agent`. It defaults to the `claude` CLI.
