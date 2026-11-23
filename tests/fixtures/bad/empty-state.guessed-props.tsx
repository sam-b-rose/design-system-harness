import { Button, Card, Heading, Stack } from "@ds";

export function EmptyState() {
  return (
    <Card padding="xl">
      <Stack gap="md" alignItems="center" justifyContent="center">
        <Heading level={2} size="lg">
          No projects yet
        </Heading>
        <Button variant="contained" startIcon="plus">
          Create project
        </Button>
      </Stack>
    </Card>
  );
}
