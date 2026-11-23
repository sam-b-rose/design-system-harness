A short, colored message that tells the user about the result of an action or the state of the page.

## Usage

Pick `tone` by meaning: `info` for neutral notes, `success` after something worked, `danger` for errors. A `danger` alert is announced to screen readers immediately.

## Do

- `alert/form-error` Use `tone="danger"` for form-level errors, above the fields.
- `alert/short` Keep the message to one or two sentences.
- `alert/title` Use `title` for a short summary when the message needs one.

## Don't

- `alert/no-custom-message` Don't color a `<div>` or `<p>` to make a message. Use `Alert`.
- `alert/not-field-error` Don't use `Alert` for a single field's validation. Pass `error` to `TextField`.
- `alert/one-per-event` Don't stack several alerts for one event. Show one.
