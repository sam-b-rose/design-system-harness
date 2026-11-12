import { Alert, Button, Card, Heading, Stack, TextField } from "@ds";

export function SettingsCard() {
  return (
    <Card>
      <form>
        <Stack gap="md">
          <Heading level={2}>Profile</Heading>
          <Alert tone="success">Your changes were saved.</Alert>
          <TextField label="Display name" name="displayName" />
          <Stack direction="horizontal" gap="sm">
            <Button variant="primary" type="submit">
              Save changes
            </Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
}
