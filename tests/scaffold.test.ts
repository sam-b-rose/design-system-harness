import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { test } from "node:test";
import { resolveTargets, runCheck } from "../cli/lib/check";
import { fromRoot } from "../cli/lib/paths";
import { listTemplates, renderTemplate, scaffold } from "../cli/lib/scaffold";

const TEMP_DIR = "evals/.tmp/scaffold";

test("component names are PascalCase and end with the template kind", () => {
  assert.equal(renderTemplate("form", "login").componentName, "LoginForm");
  assert.equal(renderTemplate("form", "LoginForm").componentName, "LoginForm");
  assert.equal(renderTemplate("page", "user-settings").componentName, "UserSettingsPage");
});

test("every template scaffolds a file that passes ds check, and never overwrites", async () => {
  rmSync(fromRoot(TEMP_DIR), { recursive: true, force: true });
  try {
    for (const kind of listTemplates()) {
      assert.ok(scaffold(kind, "sample", TEMP_DIR).ok);
      assert.equal(scaffold(kind, "sample", TEMP_DIR).ok, false);
    }
    const { files } = resolveTargets([TEMP_DIR]);
    assert.equal(files.length, listTemplates().length);
    assert.deepEqual(await runCheck(files), []);
  } finally {
    rmSync(fromRoot(TEMP_DIR), { recursive: true, force: true });
  }
  assert.ok(!existsSync(fromRoot(TEMP_DIR)));
});

test("unknown template kinds and missing names are rejected", () => {
  assert.equal(scaffold("widget", "sample", TEMP_DIR).ok, false);
  assert.equal(scaffold("page", undefined, TEMP_DIR).ok, false);
});
