A page or section title. Renders the matching `<h1>` to `<h3>` element.

## Usage

Choose `level` by document structure, not by size: one level 1 per page, level 2 for sections, level 3 inside sections.

## Do

- Use exactly one `level={1}` heading per page.
- Start each `Card` with a `level={2}` heading.
- Let `Stack` handle the space around headings.

## Don't

- Don't write raw `<h1>` to `<h6>` elements. Use `Heading`.
- Don't set a font size on a heading. `level` sets it.
- Don't skip levels, such as a level 3 directly under a level 1.
