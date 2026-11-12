import assert from "node:assert/strict";
import { test } from "node:test";
import config from "../ds.config";
import { getComponentDoc } from "../cli/lib/docs";
import { formatExports, formatTokens } from "../cli/lib/format";
import { searchDocs } from "../cli/lib/search";

test("docs get returns generated Markdown for a real component, in any case", () => {
  const result = getComponentDoc("textfield");
  assert.ok(result.ok && result.markdown.includes("# TextField"));
});

test("docs get redirects a known hallucination to its replacement", () => {
  const [name, replacement] = Object.entries(config.knownHallucinations)[0];
  const result = getComponentDoc(name);
  assert.ok(!result.ok && result.message.includes(`${config.cliName} docs get ${replacement}`));
});

test("docs search ranks the component named in the query first", () => {
  assert.equal(searchDocs("textfield label")[0].title, "TextField");
  assert.deepEqual(searchDocs("no-such-term-anywhere"), []);
});

test("exports lists real exports and known hallucinations", () => {
  const text = formatExports();
  assert.match(text, /Components: .*Stack/);
  for (const name of Object.keys(config.knownHallucinations)) assert.ok(text.includes(name));
});

test("tokens list filters by category and rejects unknown categories", () => {
  const space = formatTokens("space");
  assert.ok(space.ok && space.text.includes(`token("space.md")`) && !space.text.includes("color."));
  assert.equal(formatTokens("nope").ok, false);
});
