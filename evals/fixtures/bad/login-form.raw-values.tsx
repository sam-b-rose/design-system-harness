import { Button, Stack, TextField } from "@ds";

export function LoginForm() {
  return (
    <form style={{ padding: 24, background: "#ffffff", borderRadius: "8px" }}>
      <Stack gap="md">
        <TextField label="Email" name="email" type="email" required />
        <TextField label="Password" name="password" type="password" required />
        <Button variant="primary" type="submit">
          Sign in
        </Button>
      </Stack>
    </form>
  );
}
