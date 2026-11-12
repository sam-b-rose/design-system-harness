import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { formatExports } from "../cli/lib/format";
import { createServer } from "../mcp/server";

async function connect(): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await createServer().connect(serverTransport);
  const client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(clientTransport);
  return client;
}

const textOf = (result: unknown) => (result as { content: { text: string }[] }).content[0].text;

test("the MCP server exposes the four read-only retrieval tools", async () => {
  const client = await connect();
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((tool) => tool.name).sort(), ["docs_get", "docs_search", "exports", "tokens_list"]);
  assert.ok(tools.every((tool) => tool.annotations?.readOnlyHint === true));
  const docsGet = tools.find((tool) => tool.name === "docs_get");
  assert.match(docsGet?.description ?? "", /Call `docs_get` before writing any component code\./);
});

test("MCP tools return the same text as the CLI library", async () => {
  const client = await connect();
  const exportsResult = await client.callTool({ name: "exports", arguments: {} });
  assert.equal(textOf(exportsResult), formatExports());

  const missing = await client.callTool({ name: "docs_get", arguments: { component: "NoSuchComponent" } });
  assert.equal(missing.isError, true);
});
