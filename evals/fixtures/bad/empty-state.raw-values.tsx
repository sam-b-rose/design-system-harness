import { Button, Card, Heading, Stack } from "@ds";

export function EmptyState() {
  return (
    <Card padding="xl">
      <Stack gap="md" align="center">
        <Heading level={2}>No projects yet</Heading>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>Projects you create will show up here.</p>
        <Button variant="primary">Create project</Button>
      </Stack>
    </Card>
  );
}
