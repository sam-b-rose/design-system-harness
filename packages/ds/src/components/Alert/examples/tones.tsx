import { Alert, Stack } from "@ds";

export function Tones() {
  return (
    <Stack gap="sm">
      <Alert>Your trial ends in 3 days.</Alert>
      <Alert tone="success" title="Saved">
        Your changes are live.
      </Alert>
      <Alert tone="danger" title="Sign in failed">
        The email or password is incorrect.
      </Alert>
    </Stack>
  );
}
