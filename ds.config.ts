export interface DsConfig {
  alias: string;
  layoutComponent: string;
  knownHallucinations: Record<string, string>;
  agent: {
    command: string;
    args: string[];
    instructionFileCopies: string[];
  };
}

const config: DsConfig = {
  alias: "@ds",
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
