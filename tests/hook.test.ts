import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { test } from "node:test";
import { hookTarget, runHook } from "../cli/hook";
import { fromRoot, PLAYGROUND_DIR } from "../cli/lib/paths";

const TEMP_DIR = `${PLAYGROUND_DIR}/.hook-test`;

function toolInput(filePath: string): string {
  return JSON.stringify({ tool_name: "Write", tool_input: { file_path: filePath } });
}

test("the hook only targets files in the playground", () => {
  assert.equal(hookTarget(toolInput(fromRoot(`${TEMP_DIR}/Page.tsx`))), `${TEMP_DIR}/Page.tsx`);
  assert.equal(hookTarget(toolInput(fromRoot("README.md"))), undefined);
  assert.equal(hookTarget(JSON.stringify({ tool_name: "Bash", tool_input: { command: "ls" } })), undefined);
});

test("the hook is silent on a clean file and reports problems with exit code 2", async () => {
  rmSync(fromRoot(TEMP_DIR), { recursive: true, force: true });
  mkdirSync(fromRoot(TEMP_DIR), { recursive: true });
  try {
    const clean = fromRoot(`${TEMP_DIR}/Clean.tsx`);
    writeFileSync(clean, "export function Clean() {\n  return <p>Hello</p>;\n}\n");
    assert.deepEqual(await runHook(toolInput(clean)), { exitCode: 0 });

    const raw = fromRoot(`${TEMP_DIR}/Raw.tsx`);
    writeFileSync(raw, 'export function Raw() {\n  return <p style={{ color: "#ff0000" }}>Hello</p>;\n}\n');
    const result = await runHook(toolInput(raw));
    assert.equal(result.exitCode, 2);
    assert.match(result.report ?? "", /ds\/no-raw-values/);

    assert.deepEqual(await runHook(toolInput(fromRoot(`${TEMP_DIR}/Deleted.tsx`))), { exitCode: 0 });
  } finally {
    rmSync(fromRoot(TEMP_DIR), { recursive: true, force: true });
  }
});
