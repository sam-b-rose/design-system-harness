# Layout

## Rules

1. `Stack` is the only layout primitive. `Box`, `Container`, `Flex` and `Grid` do not exist.
2. Never write a `div` with `display: flex`, `display: grid`, `gap`, or margin and padding utilities to space elements.
3. Vertical is the default. Use `direction="horizontal"` for rows.
4. Nest stacks to combine rows and columns.
5. Use `Card` to group content on a surface, with a `Stack` inside it.

Run `ds docs get Stack` for the props.

## Failure mode: raw `div` and spacing utilities instead of `Stack`

Incorrect:

```tsx
<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
  <TextField label="Email" name="email" />
  <div className="flex gap-2 mt-4">
    <Button variant="primary">Save</Button>
    <Button>Cancel</Button>
  </div>
</div>
```

Correct:

```tsx
<Stack gap="md">
  <TextField label="Email" name="email" />
  <Stack direction="horizontal" gap="sm">
    <Button variant="primary">Save</Button>
    <Button>Cancel</Button>
  </Stack>
</Stack>
```

`ds check` reports: `Raw <div> with flex, grid or gap styling. Use Stack for layout and spacing (see: ds docs get Stack).`

## Common layouts

A page: one vertical `Stack` with a `Heading level={1}` first. `ds add page <name>` creates this.

A form: `<form>` containing one vertical `Stack` of `TextField`s, with the submit `Button` last. `ds add form <name>` creates this.

A row of actions: a horizontal `Stack` with `gap="sm"`, primary action first.
