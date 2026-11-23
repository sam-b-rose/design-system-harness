A bordered surface that groups related content, such as a form or a settings section.

## Usage

`Card` only draws the surface. Put a `Stack` inside it to space the content, and start it with a `Heading`.

## Do

- `card/one-topic` Use `Card` to group one topic: a form, a settings section, an empty state.
- `card/stack-inside` Put a `Stack` directly inside the card to space its content.
- `card/padding-token` Set `padding` with a `space` token name.

## Don't

- `card/no-div-card` Don't build a card from a `<div>` with a border and background. Use `Card`.
- `card/no-nesting` Don't nest a `Card` inside another `Card`.
- `card/no-invented-containers` Don't import `Container` or `Box` for grouping. They do not exist.
