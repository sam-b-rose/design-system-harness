import { Button, Card, Heading, token } from "@ds";

export function EmptyState() {
  return (
    <Card padding="xl">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: token("space.md") }}>
        <Heading level={2}>No projects yet</Heading>
        <p style={{ margin: 0, color: token("color.text.muted") }}>
          Projects you create will show up here.
        </p>
        <Button variant="primary">Create project</Button>
      </div>
    </Card>
  );
}
