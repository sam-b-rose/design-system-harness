import { Alert, Button, Card, Heading, TextField } from "@ds";

export function SettingsCard() {
  return (
    <Card>
      <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Heading level={2}>Profile</Heading>
        <Alert tone="success">Your changes were saved.</Alert>
        <TextField label="Display name" name="displayName" />
        <Button variant="primary" type="submit">
          Save changes
        </Button>
      </form>
    </Card>
  );
}
