import { Button, Card, Heading, Stack, TextField } from "@ds";

export function SettingsCard() {
  return (
    <Card>
      <form>
        <Stack gap="md">
          <Heading level={2}>Profile</Heading>
          <p style={{ background: "#e7f6ec", color: "#17663a", padding: "12px 16px", borderRadius: 8 }}>
            Your changes were saved.
          </p>
          <TextField label="Display name" name="displayName" />
          <Button variant="primary" type="submit">
            Save changes
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
