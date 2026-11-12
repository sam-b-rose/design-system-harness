export interface DsConfig {
  name: string;
  alias: string;
  cliName: string;
  entry: string;
  componentsDir: string;
  generatedDir: string;
  playgroundDir: string;
  pagesDir: string;
  layoutComponent?: string;
  knownHallucinations: Record<string, string>;
  agent: {
    command: string;
    args: string[];
    instructionFileCopies: string[];
  };
}

const config: DsConfig = {
  name: "Starter DS",
  alias: "@ds",
  cliName: "ds",
  entry: "packages/ds/src/index.ts",
  componentsDir: "packages/ds/src/components",
  generatedDir: "docs/generated",
  playgroundDir: "playground",
  pagesDir: "playground/src/pages",
  layoutComponent: "Stack",
  knownHallucinations: {
    Box: "Stack",
    Container: "Stack",
    Flex: "Stack",
    Grid: "Stack",
  },
  agent: {
    command: "claude",
    args: [
      "-p",
      "{prompt}",
      "--output-format",
      "json",
      "--permission-mode",
      "acceptEdits",
      "--allowedTools",
      "Bash(pnpm *)",
      "--setting-sources",
      "project",
      "--strict-mcp-config",
      "--disable-slash-commands",
    ],
    instructionFileCopies: ["CLAUDE.md"],
  },
};

export default config;
