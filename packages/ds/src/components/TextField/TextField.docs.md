A single-line text input with a built-in label and error message.

## Usage

`TextField` renders its own `<label>` and wires it to the input, so pass `label` instead of writing a label element. Pass `error` to show a validation message.

## Do

- Always pass `label`.
- Use `type="email"` and `type="password"` for those fields.
- Put fields in a `Stack` to space them.

## Don't

- Don't use a raw `<input>` or `<label>`. Use `TextField`.
- Don't use `placeholder` as the label.
- Don't render your own error text under the field. Pass `error`.
