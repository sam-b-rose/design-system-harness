import { Alert, Button, Card, Heading, Stack, TextField } from "@ds";

export function AccountPage() {
  return (
    <Stack gap="lg">
      <Heading as="h1">Account</Heading>
      <Card>
        <Stack gap="md">
          <Heading level={2}>Profile</Heading>
          <TextField label="Name" name="name" />
          <Button variant="primary" type="submit">
            Save changes
          </Button>
        </Stack>
      </Card>
      <Card variant="outlined">
        <Stack gap="md">
          <Heading level={2}>Danger zone</Heading>
          <Alert tone="warning">Deleting your account cannot be undone.</Alert>
          <Button variant="danger">Delete account</Button>
        </Stack>
      </Card>
    </Stack>
  );
}
