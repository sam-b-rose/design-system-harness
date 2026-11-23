<h1><img src="docs/logo.svg" alt="design system harness" width="356" height="64"></h1>

A working example of a design system harness: the scaffolding that lets a coding agent build UI with your design system and keeps it on-system. Each piece of the harness is in this repo, small enough to read in one sitting, and tested.

It follows the model in Robin Di Capua's [A design system harness](https://brandstructure.design/articles/a-design-system-harness/). The design system provides the *what*: tokens, component contracts and usage rules. The harness provides the *how*: it delivers that knowledge to the agent, constrains its choices and verifies its output.

Companion to the blog post: _link to be added when the post is published_.

[docs/harness.md](docs/harness.md) draws the whole harness in one diagram and covers its two mechanisms, progressive disclosure and guardrails.

## Try it

Requires Node 20+ and pnpm.

```bash
pnpm i
pnpm test
```

Walk the loop an agent follows:

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

## The pieces

### The system: `packages/ds/`

Six React components, typed tokens, and one `<Name>.docs.md` per component with usage notes and Do/Don't rules. The harness reads everything from here. Nothing agent-facing is written twice.

Every Do and Don't rule has an ID, such as `button/one-primary`. That makes rules addressable: checks cite them in their messages, review findings cite them, and eval tasks name the rule each intent check measures. `tests/guidance.test.ts` fails if anything cites a rule that no longer exists.

### Map: `AGENTS.md` and `llms.txt`

`AGENTS.md` is under 60 lines: four rules, the commands, and which skill to read for the task. A test keeps it that short. `docs/generated/llms.txt` indexes the generated docs and lists every export, plus the names agents commonly invent that do not exist.

### Recipes: `skills/`

- `build-ui` covers scaffolding, retrieving docs, writing the code and checking it. Its routing table sends the agent to the one reference or command a task needs.
- `review-ui` runs `ds check`, then reviews the rest against the component rules and cites a rule ID for every finding. Anything that looks wrong without a rule to cite goes in a separate list, which shows where the design system needs a new rule.

### Ingredients: `docs/generated/`

`scripts/build-docs.ts` compiles per-component Markdown from the prop types (TSDoc), the `*.docs.md` files and the example files. It also writes the tokens reference, `llms.txt`, and the allow-list and token paths in the skill references. `pnpm docs:check` fails in CI when a generated file is out of date.

### Equipment: the `ds` CLI, the MCP server and the edit hook

- **`ds` CLI (`cli/`):** prints docs, the allow-list of exports and the tokens as plain text, so any agent with a shell can retrieve them. `ds add` scaffolds a page or form from a template that already passes the checks.
- **MCP server (`mcp/server.ts`):** exposes the same four read-only commands as tools for agents without a shell. Each tool calls the same function as the CLI, so the two cannot drift.
- **Edit hook (`.claude/settings.json` → `cli/hook.ts`):** a Claude Code `PostToolUse` hook that runs `ds check` on every file the agent writes in `playground/`. A clean file produces no output. A file with problems sends the report back to the agent, which fixes it in the same session. For another agent, call `runHook` from `cli/hook.ts` with that agent's hook payload, or run `pnpm ds check <file>` from its hook.

To use the MCP server with Claude Code:

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

### Verification, tier 1: deterministic checks (`checks/`)

`ds check` type-checks, lints and audits files, then reports each problem with what to do next. No LLM is involved.

| Stage | Rule IDs | Catches |
| --- | --- | --- |
| Type-check | `tsc/TS<code>` | Guessed props, missing imports |
| Lint (`checks/rules/`) | `ds/no-unknown-imports` | Imports `@ds` does not export, with the replacement for known hallucinations |
| | `ds/no-raw-values` | Hex colors and px sizes in `style`, `className` and CSS files |
| | `ds/prefer-stack` | Host elements styled with flex, grid or gap |
| Audit (`checks/audit/`) | `audit/textfield-label` | A `TextField` without a visible label |
| | `audit/one-primary-button` | More than one primary `Button` in a file |
| Browser (`--visual`) | `visual/render-error` | A page that throws or renders nothing |
| | `a11y/<axe rule>` | Accessibility violations found by axe-core on the rendered page |

Inline `eslint-disable` comments are ignored. The exit code is 0 for no problems, 1 for problems, and 2 when the check could not run.

`--visual` starts the playground, opens each checked page in headless Chromium, runs axe-core and saves a screenshot to `playground/.screenshots/`. It needs Playwright, which is not a dependency:

```bash
pnpm add -D playwright && pnpm exec playwright install chromium
```

`tests/guardrails.test.ts` keeps the checks honest. Each eval task has a good fixture that must pass, and a bad fixture per failure mode that must be caught by the right rule. The test also writes each known hallucination from `ds.config.ts` into a fixture and checks that the error names the real component.

### Verification, tier 2: evals (`evals/`)

`pnpm evals` gives a real agent each task prompt in a temporary copy of the repo. It scores the result two ways:

- **`ds check`:** did the agent follow the rules?
- **Intent checks:** did it make the right choices? Each task in `evals/tasks/` lists the JSX the result should contain. For example, the account page needs exactly one `<Heading level={1}>` and exactly one primary `Button`, so "Delete account" must not be a second primary action. Most intent checks name the guidance rule they measure.

Results go to `evals/results/`. `pnpm evals --save-baseline` records the team baseline in `evals/baseline.json`. Later runs report each task that regressed or improved against it, which shows where the system or the harness needs work. No baseline is committed yet.

`pnpm evals --no-harness` runs the same tasks without the harness: the agent gets the playground and the design system as a compiled package in `node_modules`, the way most apps consume one. `pnpm evals:compare [task]` runs one task both ways and writes a side-by-side report with the code the agent wrote to [evals/compare/](evals/compare/README.md).

Neither command runs in CI, because both need an agent CLI and credentials. `ds.config.ts` sets the agent command, which defaults to the `claude` CLI. `--model <id>` picks the model.

## Results so far

One run of each combination, from before the edit hook and the intent checks existed, so the agents ran `ds check` only because the instructions told them to:

| Model | With the harness | Without | Rules broken without |
| --- | --- | --- | --- |
| `claude-fable-5-2` | 5 of 5 | 5 of 5 | none |
| `claude-haiku-5-5` | 5 of 5 | 3 of 5 | `ds/prefer-stack` once (a flex `div` to center content), `ds/no-raw-values` twice (`maxWidth` of `420px` and `400px`) |

Read these as single runs, not rates: agents are not deterministic, and five tasks on six components is a small sample. In the committed comparison on the empty state task, both setups met all four intent checks, and only the run without the harness broke rules.

## What this example leaves out

- **Visual regression.** `--visual` catches pages that break, not pages that look wrong. It does not compare screenshots against a reference.
- **Composition and journey rules.** The rules cover single components. Rules for how components combine into templates and flows have no format here yet.
- **An LLM grader.** Intent checks are deterministic matches on JSX. They can't judge copy or visual hierarchy.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm ds docs get <Component>` | Prints a component's docs, including its rule IDs |
| `pnpm ds docs search <query>` | Ranks the docs sections that match a query |
| `pnpm ds exports` | Prints the allow-list of exports |
| `pnpm ds tokens list [--category color]` | Prints design tokens |
| `pnpm ds add <page\|form> <name>` | Creates a starting file in `playground/src/pages/` |
| `pnpm ds check [path...] [--visual]` | Runs the tier 1 checks on `playground/` or the given paths |
| `pnpm mcp` | Starts the read-only MCP server on stdio |
| `pnpm docs:build` / `pnpm docs:check` | Compiles the generated docs / fails if they are out of date |
| `pnpm test` | Tests the checks, the guardrail fixtures, rule IDs, the CLI, the MCP server, the hook and the agent-facing files |
| `pnpm typecheck` / `pnpm lint` | `tsc --noEmit` over the repo / `ds check` on `playground/` |
| `pnpm evals [--no-harness] [--save-baseline] [--model <id>] [task...]` | Runs the tier 2 evals with a real agent |
| `pnpm evals:compare [--model <id>] [task]` | Runs one task with and without the harness |
| `pnpm dev` / `pnpm build` | Runs / builds the playground with Vite |

CI runs `docs:check`, `typecheck`, `lint` and `test`.

## Further reading

- Robin Di Capua, [A design system harness](https://brandstructure.design/articles/a-design-system-harness/) (branDStructure, 7 November 2026). The model this repo follows: the map, recipes, ingredients and equipment; progressive disclosure and guardrails; deterministic checks and evals against team baselines.
- Kaelig Deloumeau-Prigent, [State of AI in Design Systems](https://state-of-ai-in-design-systems.netlify.app/) (July 2026 snapshot, CC BY 4.0). A survey of how 21 design systems ship tooling for agents. This repo follows several of its findings: docs compiled from the same sources as human docs, short instruction files written as rules with an allow-list, tool-gating through the CLI, and validation loops that make the agent fix failures.
