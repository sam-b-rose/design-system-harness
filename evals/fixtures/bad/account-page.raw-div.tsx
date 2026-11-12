import { Alert, Button, Card, Heading, Stack, TextField } from "@ds";

export function AccountPage() {
  return (
    <div className="flex flex-col space-y-6">
      <Heading level={1}>Account</Heading>
      <Card>
        <Stack gap="md">
          <Heading level={2}>Profile</Heading>
          <TextField label="Name" name="name" />
          <Button variant="primary" type="submit">
            Save changes
          </Button>
        </Stack>
      </Card>
      <Card>
        <Stack gap="md">
          <Heading level={2}>Danger zone</Heading>
          <Alert tone="danger">Deleting your account cannot be undone.</Alert>
          <Button>Delete account</Button>
        </Stack>
      </Card>
    </div>
  );
}
