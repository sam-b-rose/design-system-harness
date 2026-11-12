import { Heading, Stack } from "@ds";

export function PageTitle() {
  return (
    <Stack gap="sm">
      <Heading level={1}>Settings</Heading>
      <Heading level={2}>Profile</Heading>
    </Stack>
  );
}
