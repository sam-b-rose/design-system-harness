A page or section title. Renders the matching `<h1>` to `<h3>` element.

## Usage

Choose `level` by document structure, not by size: one level 1 per page, level 2 for sections, level 3 inside sections.

## Do

- `heading/one-h1` Use exactly one `level={1}` heading per page.
- `heading/card-starts-h2` Start each `Card` with a `level={2}` heading.
- `heading/stack-spacing` Let `Stack` handle the space around headings.

## Don't

- `heading/no-raw-headings` Don't write raw `<h1>` to `<h6>` elements. Use `Heading`.
- `heading/no-font-size` Don't set a font size on a heading. `level` sets it.
- `heading/no-skipped-levels` Don't skip levels, such as a level 3 directly under a level 1.
