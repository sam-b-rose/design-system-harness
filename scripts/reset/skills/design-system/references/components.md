# Components

## Rules

1. Only the components in the allow-list below exist. If a name is not on it, do not import it.
2. Before using a component, run `ds docs get <Component>` and use only the props it prints.

## Allow-list

<!-- generated:allow-list:start -->
<!-- generated:allow-list:end -->

## Failure mode: importing a component that does not exist

TODO: add an Incorrect/Correct pair using a name from `knownHallucinations` in `ds.config.ts`.

## Failure mode: relying on trained knowledge instead of `ds docs get`

TODO: add an Incorrect/Correct pair showing guessed props next to the real ones.

## Failure mode: skipping `ds check` before declaring a task done

Incorrect: "I've added the settings page." (no check was run)

Correct: run `pnpm ds check`, fix every problem it prints, run it again, and report the passing result. A task is not complete until `ds check` passes.
