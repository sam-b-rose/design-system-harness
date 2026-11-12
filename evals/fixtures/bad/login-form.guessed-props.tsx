import { Button, Stack, TextField } from "@ds";

export function LoginForm() {
  return (
    <form>
      <Stack spacing={4}>
        <TextField label="Email" name="email" type="email" variant="outlined" fullWidth />
        <TextField label="Password" name="password" type="password" variant="outlined" fullWidth />
        <Button color="primary" size="large" type="submit">
          Sign in
        </Button>
      </Stack>
    </form>
  );
}
