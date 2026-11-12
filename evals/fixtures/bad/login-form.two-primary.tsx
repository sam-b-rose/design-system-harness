import { Button, Stack, TextField } from "@ds";

export function LoginForm() {
  return (
    <form>
      <Stack gap="md">
        <TextField label="Email" name="email" type="email" required />
        <TextField label="Password" name="password" type="password" required />
        <Stack direction="horizontal" gap="sm">
          <Button variant="primary" type="submit">
            Sign in
          </Button>
          <Button variant="primary">Create account</Button>
        </Stack>
      </Stack>
    </form>
  );
}
