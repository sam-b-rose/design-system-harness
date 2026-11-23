import { Button, Card, Heading, Stack, token } from "@ds";

export function EmptyState() {
  return (
    <Card padding="xl">
      <Stack gap="md" align="center">
        <Heading level={2}>No projects yet</Heading>
        <p style={{ margin: 0, color: token("color.text.muted") }}>
          Projects you create will show up here.
        </p>
        <Button variant="primary">Create project</Button>
      </Stack>
    </Card>
  );
}
