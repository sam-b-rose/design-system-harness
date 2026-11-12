import { TextField } from "@ds";

export function WithError() {
  return (
    <TextField
      label="Password"
      name="password"
      type="password"
      error="Enter at least 8 characters."
      required
    />
  );
}
