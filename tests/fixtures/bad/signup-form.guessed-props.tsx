import { Alert, Button, Stack, TextField } from "@ds";

export function SignupForm() {
  return (
    <form>
      <Stack gap="md">
        <Alert variant="error">We could not create your account.</Alert>
        <TextField label="Name" name="name" required />
        <TextField label="Email" name="email" type="email" helperText="That email is already registered." invalid />
        <TextField label="Password" name="password" type="password" required />
        <Button variant="primary" type="submit" fullWidth>
          Create account
        </Button>
      </Stack>
    </form>
  );
}
