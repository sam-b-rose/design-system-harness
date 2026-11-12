import { Alert, Button, Card, Stack, TextField } from "@ds";

export function SettingsCard() {
  return (
    <Card title="Profile" elevation={2}>
      <form>
        <Stack gap="md">
          <Alert severity="success">Your changes were saved.</Alert>
          <TextField label="Display name" name="displayName" />
          <Button variant="primary" type="submit">
            Save changes
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
