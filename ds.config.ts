export interface DsConfig {
  name: string;
  alias: string;
  cliName: string;
  entry: string;
  componentsDir: string;
  generatedDir: string;
  playgroundDir: string;
  knownHallucinations: Record<string, string>;
}

const config: DsConfig = {
  name: "Starter DS",
  alias: "@ds",
  cliName: "ds",
  entry: "packages/ds/src/index.ts",
  componentsDir: "packages/ds/src/components",
  generatedDir: "docs/generated",
  playgroundDir: "playground",
  knownHallucinations: {
    Box: "Stack",
    Container: "Stack",
    Flex: "Stack",
    Grid: "Stack",
  },
};

export default config;
