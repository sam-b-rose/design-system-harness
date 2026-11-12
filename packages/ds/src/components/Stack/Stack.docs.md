Lays out children in a row or column with consistent spacing between them. `Stack` is the only layout primitive in this design system.

## Usage

Reach for `Stack` whenever elements need space between them. Nest stacks to combine rows and columns.

## Do

- Use `Stack` for all spacing between elements.
- Nest a horizontal `Stack` inside a vertical one for rows of actions.
- Set `gap` with a `space` token name: `xs`, `sm`, `md`, `lg` or `xl`.

## Don't

- Don't import `Box`, `Flex`, `Grid` or `Container`. They do not exist.
- Don't write a `<div>` with `display: flex` or `gap`. Use `Stack`.
- Don't pass pixel values to `gap`.
