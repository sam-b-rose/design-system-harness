Triggers an action, such as submitting a form or opening a dialog.

## Usage

Use `variant="primary"` for the single most important action in a view and the default `secondary` variant for everything else.

## Do

- `button/one-primary` Use one `primary` button per view.
- `button/submit-type` Use `type="submit"` for the main action inside a `<form>`.
- `button/verb-labels` Write labels as verbs: "Sign in", "Save changes".

## Don't

- `button/no-raw-button` Don't style a raw `<button>` element. Use `Button`.
- `button/no-style-props` Don't pass `style` or `className`. `Button` does not accept them.
- `button/not-navigation` Don't use a `Button` for navigation. Use a link.
