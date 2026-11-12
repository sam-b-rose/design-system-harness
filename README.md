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
| 3. Retrieval path | `cli/`, optional `mcp/` | `m2-skill-and-retrieval`, `m5-stretch` |
| 4. Generate → check → fix | `cli/templates/`, `cli/lib/check.ts`, `lint/` | `m3-scaffold-and-audit` |
| 5. Regression suite | `evals/`, `tests/`, `.github/workflows/ci.yml` | `m4-evals-and-ci`, `m5-stretch` |

`ds.config.ts` ties them together. It holds the import alias, the CLI name and the known hallucinations, and the lint rules, generated docs and evals all read from it.

Each milestone is a git tag, so you can read the repo at each stage:

| Tag | What it adds |
| --- | --- |
| `m1-first-loop` | One task end to end: three components, tokens, `docs:build`, `AGENTS.md`, `ds docs get`, `ds check` with two rules, the login form eval |
| `m2-skill-and-retrieval` | The remaining components, the skill and its references, `ds docs search`, `ds exports`, `ds tokens list` |
| `m3-scaffold-and-audit` | `ds add`, the `prefer-stack` rule, the component audit |
| `m4-evals-and-ci` | The full eval set, CI, `starter:reset`, `demo:compare` |
| `m5-stretch` | The MCP server, `ds check --visual`, `evals:agent` |

## Quickstart

Requires Node 20+ and pnpm. TypeScript is pinned to 6.x because the docs generator and the allow-list use the TypeScript compiler API.

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

Run `pnpm starter:reset`. It removes the sample components, eval tasks and results, templates and demo results, replaces the sample-specific instructions with TODOs, and leaves scaffolding where every check still passes. Then:

- **Replace** `packages/ds/src` with your components and tokens.
  - Each component needs `<Name>.tsx` exporting `<Name>Props` with TSDoc on each prop, a `<Name>.docs.md`, and `examples/*.tsx`. Export it from `index.ts`.
  - `tokens/tokens.ts` must export `tokens` (a nested object of string values) and `cssVarName`.
- **Keep** `cli/`, `lint/rules/`, `scripts/`, `mcp/`, `tests/`, `demo/compare.ts` and the runners in `evals/` (`run.ts`, `agent.ts`, `agent-run.ts`).
- **Edit**:
  - `ds.config.ts`: see the table below. Each known hallucination feeds the lint message, the generated allow-list and a bad eval fixture.
  - `AGENTS.md` and `skills/design-system/`: your rules, routing table and Incorrect/Correct pairs.
  - `cli/templates/`: your canonical page and form. Each file becomes a `ds add` kind.
  - `lint/audit/`: checks specific to your components.
  - `evals/tasks/` and `evals/fixtures/`: your representative tasks, with one good output and a bad output per failure mode.

| `ds.config.ts` field | What it sets |
| --- | --- |
| `name` | The design system's name in the generated docs |
| `alias` | The import path, `@ds`. Change `paths` in `tsconfig.json` to match; a test fails if they disagree. |
| `cliName` | The CLI's name in usage text and error messages |
| `entry` | The only public entry file. The allow-list is read from it. |
| `componentsDir`, `generatedDir`, `playgroundDir`, `pagesDir` | Where components, generated docs, the playground and scaffolded pages live |
| `layoutComponent` | The component `ds/prefer-stack` tells agents to use. Leave it out to turn the rule off. |
| `knownHallucinations` | Names agents invent, each mapped to the real export to use instead |
| `agent` | The agent CLI that `evals:agent` and `demo:compare` run |

## Commands

| Command | What it does |
| --- | --- |
| `pnpm ds docs get <Component>` | Prints a component's generated docs |
| `pnpm ds docs search <query>` | Ranks the generated docs sections that match a query |
| `pnpm ds exports` | Prints the allow-list of real exports |
| `pnpm ds tokens list [--category color]` | Prints design tokens |
| `pnpm ds add <page\|form> <name>` | Creates a starting file in `playground/src/pages/` |
| `pnpm ds check [path...] [--visual]` | Type-checks, lints and audits `playground/` or the given paths. `--visual` also renders each page in a browser. |
| `pnpm mcp` | Starts the optional read-only MCP server on stdio |
| `pnpm docs:build` / `pnpm docs:check` | Compiles the generated files / fails if they are out of date |
| `pnpm evals` | Asserts good fixtures pass `ds check` and bad fixtures fail with the expected rule |
| `pnpm test` | Tests for the lint rules, the CLI, the MCP server and the agent-facing files |
| `pnpm typecheck` | Runs `tsc --noEmit` over the whole repo |
| `pnpm lint` | Runs `ds check` on `playground/` |
| `pnpm evals:agent [--baseline] [--model <id>] [task...]` | Runs an agent on every task and scores it with `ds check` |
| `pnpm demo:compare [--model <id>] [task]` | Runs an agent on one task with and without the toolkit |
| `pnpm dev` / `pnpm build` | Runs / builds the playground with Vite |
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
| Visual (`--visual` only) | `visual/render-error` | A page that throws or renders nothing in a real browser |

Every message says what to do next. Inline `eslint-disable` comments are ignored. The exit code is 0 for no problems, 1 for problems, and 2 when the check could not run (a bad path, or `--visual` without Playwright). No LLM is involved.

### The `--visual` flag

```bash
pnpm ds check --visual
```

With `--visual`, `ds check` runs the stages above and then starts the playground, opens each checked page from `playground/src/pages/` in headless Chromium and saves a full-page screenshot to `playground/.screenshots/<Page>.png` (git-ignored). A page fails with `visual/render-error` if it throws, logs a console error or renders nothing:

```
playground/src/pages/BrokenPage.tsx:1:1  visual/render-error
  BrokenPage does not render cleanly in the browser: Cannot read properties of undefined (reading 'text') Fix the runtime error, then run `ds check --visual` again (screenshot: playground/.screenshots/BrokenPage.png).
```

It is off by default because it needs Playwright, which is not a dependency of this repo. Install it once:

```bash
pnpm add -D playwright
```

```bash
pnpm exec playwright install chromium
```

Limits: it does not compare screenshots against a reference, so it catches pages that break, not pages that look wrong. A page file must export a component with the same name as the file, which `ds add` does for you.

## Optional: MCP

`mcp/server.ts` exposes the four read-only retrieval commands as MCP tools: `docs_get`, `docs_search`, `exports` and `tokens_list`. Each tool calls the same library function as the CLI command, so the two cannot drift. The CLI is the primary path; use MCP for agents without a shell.

```json
{
  "mcpServers": {
    "design-system": {
      "command": "pnpm",
      "args": ["exec", "tsx", "mcp/server.ts"]
    }
  }
}
```

## The regression suite

`evals/tasks/*.json` holds five tasks: login form, settings card, empty state, sign-up form with errors, and account page. Each has a prompt, a target file and fixtures in `evals/fixtures/`:

- `good/<task>.tsx` must pass `ds check`.
- `bad/<task>.<failure>.tsx` must fail with the rule named in the task file.
- For every entry in `knownHallucinations`, the runner swaps the real component for the hallucinated one in the good fixture and asserts that the message names the replacement.

CI runs `docs:check`, `typecheck`, `lint`, `test` and `evals`, plus a second job that runs `starter:reset` and repeats the checks.

## Agent evals

`pnpm evals:agent` runs a real agent on each task prompt in a temporary copy of the repo, scores what it wrote with `ds check`, and records pass or fail, turns, the model and every rule violation to `evals/results/`. It is not part of CI, because it needs an agent CLI and credentials.

- `--baseline` runs without the toolkit: the agent gets the playground and the design system as a compiled package in `node_modules` (JavaScript and type declarations), the way most apps consume one. No source, `AGENTS.md`, skill, CLI or generated docs.
- `--model <id>` passes a model to the agent CLI. Without it the CLI's default is used.
- The agent command is set in `ds.config.ts` under `agent`. It defaults to the `claude` CLI.

One run of each combination is committed in `evals/results/`:

| Model | With the toolkit | Baseline | Baseline violations |
| --- | --- | --- | --- |
| `claude-fable-5-2` (the CLI default) | 5 of 5 | 5 of 5 | none |
| `claude-haiku-5-5` | 5 of 5 | 3 of 5 | `ds/prefer-stack` once (a flex `div` used to center content), `ds/no-raw-values` twice (`maxWidth` of `420px` and `400px`) |

Read these as single runs, not rates. Agents are not deterministic, and five tasks on a six-component design system is a small sample. Neither model imported a component that does not exist. The two `no-raw-values` failures are container widths, which this design system has no token for.

## Before and after

`pnpm demo:compare` gives one prompt to an agent in the same two setups, scores both with `ds check` and writes Markdown reports, including the code the agent wrote, to [demo/results/](demo/results/README.md). The committed run used `claude-haiku-5-5` on the empty state task, chosen because the Haiku baseline failed it in the agent evals. The baseline failed again with `ds/prefer-stack` and `ds/no-raw-values`; the toolkit run passed. On the login form task, both setups passed with both models.

## Further reading

- Robin Di Capua, [A design system harness](https://brandstructure.design/articles/a-design-system-harness/) (branDStructure, 7 November 2026). It describes a harness that guides, constrains and verifies an agent. In this repo, `AGENTS.md` and `llms.txt` are the map, the skill is the recipe, the generated docs are the ingredients, and the `ds` CLI and MCP server are the equipment. `ds check` is the deterministic tier of verification, and the agent evals compare against a baseline.
- Kaelig Deloumeau-Prigent, [State of AI in Design Systems](https://state-of-ai-in-design-systems.netlify.app/) (July 2026 snapshot, CC BY 4.0). It surveys how 21 design systems ship tooling for agents. This repo follows several of its findings: docs compiled from the same sources as human docs, short instruction files written as rules with an allow-list, tool-gating through the CLI, and validation loops that make the agent fix failures.
