import { Button, Card, Heading, Stack, TextField } from "@ds";

export function SettingsSection() {
  return (
    <Card>
      <Stack gap="md">
        <Heading level={2}>Profile</Heading>
        <TextField label="Display name" name="displayName" />
        <Stack direction="horizontal" gap="sm">
          <Button variant="primary" type="submit">
            Save changes
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
