import { Button, Stack } from "@ds";

export function Horizontal() {
  return (
    <Stack direction="horizontal" gap="sm" align="center">
      <Button variant="primary">Save</Button>
      <Button>Cancel</Button>
    </Stack>
  );
}
