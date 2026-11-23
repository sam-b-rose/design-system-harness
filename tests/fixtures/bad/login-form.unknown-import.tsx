import { Box, Button, TextField } from "@ds";

export function LoginForm() {
  return (
    <form>
      <Box>
        <TextField label="Email" name="email" type="email" required />
        <TextField label="Password" name="password" type="password" required />
        <Button variant="primary" type="submit">
          Sign in
        </Button>
      </Box>
    </form>
  );
}
