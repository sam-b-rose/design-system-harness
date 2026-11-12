import { Button, TextField } from "@ds";

export function LoginForm() {
  return (
    <form>
      <div className="flex flex-col gap-4">
        <TextField label="Email" name="email" type="email" required />
        <TextField label="Password" name="password" type="password" required />
        <Button variant="primary" type="submit">
          Sign in
        </Button>
      </div>
    </form>
  );
}
