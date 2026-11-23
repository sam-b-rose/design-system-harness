import { Alert, Button, Card, Heading, Stack, TextField } from "@ds";

export function AccountPage() {
  return (
    <Stack gap="lg">
      <Heading level={1}>Account</Heading>
      <Card>
        <form>
          <Stack gap="md">
            <Heading level={2}>Profile</Heading>
            <TextField label="Name" name="name" />
            <Stack direction="horizontal" gap="sm">
              <Button variant="primary" type="submit">
                Save changes
              </Button>
            </Stack>
          </Stack>
        </form>
      </Card>
      <Card>
        <Stack gap="md">
          <Heading level={2}>Danger zone</Heading>
          <Alert tone="danger">Deleting your account cannot be undone.</Alert>
          <Stack direction="horizontal" gap="sm">
            <Button>Delete account</Button>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
