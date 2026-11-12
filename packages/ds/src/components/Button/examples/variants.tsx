import { Button, Stack } from "@ds";

export function Variants() {
  return (
    <Stack direction="horizontal" gap="sm">
      <Button variant="primary">Save changes</Button>
      <Button>Cancel</Button>
    </Stack>
  );
}
