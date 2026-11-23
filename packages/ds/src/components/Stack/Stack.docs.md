Lays out children in a row or column with consistent spacing between them. `Stack` is the only layout primitive in this design system.

## Usage

Reach for `Stack` whenever elements need space between them. Nest stacks to combine rows and columns.

## Do

- `stack/all-spacing` Use `Stack` for all spacing between elements.
- `stack/nest-for-rows` Nest a horizontal `Stack` inside a vertical one for rows of actions.
- `stack/gap-token` Set `gap` with a `space` token name: `xs`, `sm`, `md`, `lg` or `xl`.

## Don't

- `stack/no-invented-layout` Don't import `Box`, `Flex`, `Grid` or `Container`. They do not exist.
- `stack/no-flex-div` Don't write a `<div>` with `display: flex` or `gap`. Use `Stack`.
- `stack/no-px-gap` Don't pass pixel values to `gap`.
