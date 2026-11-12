A bordered surface that groups related content, such as a form or a settings section.

## Usage

`Card` only draws the surface. Put a `Stack` inside it to space the content, and start it with a `Heading`.

## Do

- Use `Card` to group one topic: a form, a settings section, an empty state.
- Put a `Stack` directly inside the card to space its content.
- Set `padding` with a `space` token name.

## Don't

- Don't build a card from a `<div>` with a border and background. Use `Card`.
- Don't nest a `Card` inside another `Card`.
- Don't import `Container` or `Box` for grouping. They do not exist.
