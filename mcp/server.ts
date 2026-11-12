import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import config from "../ds.config";
import { getComponentDoc } from "../cli/lib/docs";
import { formatExports, formatTokens } from "../cli/lib/format";
import { formatSearch } from "../cli/lib/search";

const READ_ONLY = { readOnlyHint: true, idempotentHint: true, openWorldHint: false };

function reply(ok: boolean, text: string) {
  return { content: [{ type: "text" as const, text }], isError: !ok };
}

export function createServer(): McpServer {
  const server = new McpServer({ name: `${config.cliName}-design-system`, version: "0.1.0" });

  server.registerTool(
    "docs_get",
    {
      description: `Get one ${config.alias} component's docs: props, examples and Do/Don't. Call \`docs_get\` before writing any component code.`,
      inputSchema: { component: z.string().describe("Component name, e.g. Stack") },
      annotations: READ_ONLY,
    },
    async ({ component }) => {
      const result = getComponentDoc(component);
      return reply(result.ok, result.ok ? result.markdown : result.message);
    },
  );

  server.registerTool(
    "docs_search",
    {
      description: `Find the ${config.alias} docs sections that best match a query. Use it when you do not know which component fits, then call \`docs_get\`.`,
      inputSchema: { query: z.string().describe("Words to search for, e.g. form error") },
      annotations: READ_ONLY,
    },
    async ({ query }) => {
      const result = formatSearch(query);
      return reply(result.ok, result.ok ? result.text : result.message);
    },
  );

  server.registerTool(
    "exports",
    {
      description: `List everything ${config.alias} exports, and the common names that do not exist. Call \`exports\` before importing a name you have not seen in \`docs_get\` output.`,
      annotations: READ_ONLY,
    },
    async () => reply(true, formatExports()),
  );

  server.registerTool(
    "tokens_list",
    {
      description: "List design tokens with their TSX and CSS forms. Call `tokens_list` before writing any color, space, radius or font size.",
      inputSchema: { category: z.string().optional().describe("Limit to one category, e.g. color") },
      annotations: READ_ONLY,
    },
    async ({ category }) => {
      const result = formatTokens(category);
      return reply(result.ok, result.ok ? result.text : result.message);
    },
  );

  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await createServer().connect(new StdioServerTransport());
}
