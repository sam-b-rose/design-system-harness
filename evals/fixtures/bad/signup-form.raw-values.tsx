import { Button, Stack, TextField } from "@ds";

export function SignupForm() {
  return (
    <form>
      <Stack gap="md">
        <div style={{ border: "1px solid #b42318", color: "#b42318", padding: 12 }}>
          We could not create your account.
        </div>
        <TextField label="Name" name="name" required />
        <TextField label="Email" name="email" type="email" error="That email is already registered." required />
        <TextField label="Password" name="password" type="password" required />
        <Button variant="primary" type="submit">
          Create account
        </Button>
      </Stack>
    </form>
  );
}
