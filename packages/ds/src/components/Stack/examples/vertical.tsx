import { Stack, TextField } from "@ds";

export function Vertical() {
  return (
    <Stack gap="md">
      <TextField label="First name" name="firstName" />
      <TextField label="Last name" name="lastName" />
    </Stack>
  );
}
