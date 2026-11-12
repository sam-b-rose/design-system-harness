Triggers an action, such as submitting a form or opening a dialog.

## Usage

Use `variant="primary"` for the single most important action in a view and the default `secondary` variant for everything else.

## Do

- Use one `primary` button per view.
- Use `type="submit"` for the main action inside a `<form>`.
- Write labels as verbs: "Sign in", "Save changes".

## Don't

- Don't style a raw `<button>` element. Use `Button`.
- Don't pass `style` or `className`. `Button` does not accept them.
- Don't use a `Button` for navigation. Use a link.
