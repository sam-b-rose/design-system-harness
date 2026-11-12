import { Button, Stack, TextField } from "@ds";

export function LoginForm() {
  return (
    <form>
      <Stack gap="md">
        <TextField label="" name="email" type="email" placeholder="Email" required />
        <TextField label="Password" name="password" type="password" required />
        <Button variant="primary" type="submit">
          Sign in
        </Button>
      </Stack>
    </form>
  );
}
