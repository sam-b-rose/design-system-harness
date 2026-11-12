import { Button, Card, Heading, Stack, TextField } from "@ds";

export function Template() {
  return (
    <Card>
      <form>
        <Stack gap="md">
          <Heading level={2}>Template title</Heading>
          <TextField label="Name" name="name" required />
          <Stack direction="horizontal" gap="sm">
            <Button variant="primary" type="submit">
              Save
            </Button>
            <Button>Cancel</Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
}
