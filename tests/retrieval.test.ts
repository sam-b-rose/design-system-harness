import assert from "node:assert/strict";
import { test } from "node:test";
import config from "../ds.config";
import { listComponents } from "../cli/lib/components";
import { getComponentDoc } from "../cli/lib/docs";
import { formatExports, formatTokens } from "../cli/lib/format";
import { searchDocs } from "../cli/lib/search";
import { listTokens } from "../cli/lib/tokens";

const [component] = listComponents();
const [hallucination] = Object.entries(config.knownHallucinations);

test("docs get returns generated Markdown for a real component, in any case", { skip: !component }, () => {
  const result = getComponentDoc(component.toLowerCase());
  assert.ok(result.ok && result.markdown.includes(`# ${component}`));
});

test("docs get redirects a known hallucination to its replacement", { skip: !hallucination }, () => {
  const [name, replacement] = hallucination;
  const result = getComponentDoc(name);
  assert.ok(!result.ok && result.message.includes(`ds docs get ${replacement}`));
});

test("docs get rejects an unknown name", () => {
  assert.equal(getComponentDoc("NoSuchComponent").ok, false);
});

test("docs search ranks the component named in the query first", { skip: !component }, () => {
  assert.equal(searchDocs(component)[0].title, component);
});

test("docs search returns nothing for a term that appears nowhere", () => {
  assert.deepEqual(searchDocs("no-such-term-anywhere"), []);
});

test("exports lists every known hallucination", () => {
  const text = formatExports();
  assert.match(text, /^Components:/m);
  for (const name of Object.keys(config.knownHallucinations)) assert.ok(text.includes(name));
});

test("tokens list filters by category and rejects unknown categories", () => {
  const [first] = listTokens();
  const other = listTokens().find((entry) => entry.category !== first.category);
  const filtered = formatTokens(first.category);
  assert.ok(filtered.ok && filtered.text.includes(first.usage));
  assert.ok(filtered.ok && (!other || !filtered.text.includes(other.usage)));
  assert.equal(formatTokens("no-such-category").ok, false);
});
