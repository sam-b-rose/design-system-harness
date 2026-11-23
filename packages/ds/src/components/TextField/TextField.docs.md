A single-line text input with a built-in label and error message.

## Usage

`TextField` renders its own `<label>` and wires it to the input, so pass `label` instead of writing a label element. Pass `error` to show a validation message.

## Do

- `textfield/label` Always pass `label`.
- `textfield/input-types` Use `type="email"` and `type="password"` for those fields.
- `textfield/stack-spacing` Put fields in a `Stack` to space them.

## Don't

- `textfield/no-raw-input` Don't use a raw `<input>` or `<label>`. Use `TextField`.
- `textfield/no-placeholder-label` Don't use `placeholder` as the label.
- `textfield/error-prop` Don't render your own error text under the field. Pass `error`.
