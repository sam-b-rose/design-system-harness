# The loop

An agent is only as reliable as the context it retrieves and the checks it cannot skip.

```mermaid
flowchart LR
    task([UI task]) --> retrieve
    retrieve["<b>Retrieve</b><br/>ds docs get<br/>ds exports<br/>ds tokens list"] --> generate
    generate["<b>Generate</b><br/>ds add page or form<br/>then edit the file"] --> check
    check{"<b>Check</b><br/>ds check"}
    check -- problems --> fix["<b>Fix</b><br/>do what each<br/>message says"]
    fix --> check
    fix -. needs docs .-> retrieve
    check -- passes --> done([Done])
```

| Step | Command | Source of truth |
| --- | --- | --- |
| Retrieve | `ds docs get <Component>`, `ds docs search <query>`, `ds exports`, `ds tokens list` | `docs/generated/`, compiled from TSDoc, `*.docs.md`, examples and `tokens.ts` |
| Generate | `ds add page <name>`, `ds add form <name>` | `cli/templates/`, real type-checked files |
| Check | `ds check [path]` | `tsc`, `lint/rules/`, `lint/audit/`. Deterministic, no LLM. |
| Fix | Follow the message, then run `ds check` again | Every message names the replacement and the command to read next |
