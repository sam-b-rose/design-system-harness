import { test } from "node:test";
import parser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import config from "../ds.config";
import { exportNames } from "../cli/lib/exports";
import { onePrimaryButton } from "../checks/audit/one-primary-button";
import { textfieldLabel } from "../checks/audit/textfield-label";
import { noRawValues } from "../checks/rules/no-raw-values";
import { noUnknownImports } from "../checks/rules/no-unknown-imports";
import { preferStack } from "../checks/rules/prefer-stack";

const ruleTester = new RuleTester({
  languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
});

const { alias, knownHallucinations, layoutComponent } = config;

test("ds/no-unknown-imports", () => {
  ruleTester.run("no-unknown-imports", noUnknownImports, {
    valid: [
      `import { ${exportNames().join(", ")} } from "${alias}";`,
      `import { Widget } from "another-library";`,
    ],
    invalid: [
      ...Object.entries(knownHallucinations).map(([name, replacement]) => ({
        code: `import { ${name} } from "${alias}";`,
        errors: [
          { message: `${name} is not exported by ${alias}. Use ${replacement} (see: ds docs get ${replacement}).` },
        ],
      })),
      {
        code: `import { Widget } from "${alias}";`,
        errors: [{ message: new RegExp(`^Widget is not exported by ${alias}\\. Real exports: .* \\(see: ds exports\\)\\.$`) }],
      },
      {
        code: `import * as DS from "${alias}";`,
        errors: [{ message: /^Use named imports/ }],
      },
      {
        code: `import { Widget } from "${alias}/components/Widget";`,
        errors: [{ message: /^Deep import/ }],
      },
    ],
  });
});

test("ds/no-raw-values", () => {
  ruleTester.run("no-raw-values", noRawValues, {
    valid: [
      `const a = <div style={{ color: token("color.text.muted"), padding: token("space.md") }} />;`,
      `const a = <div style={{ margin: 0, padding: "0px", opacity: 0.5, flex: 1, maxWidth: "24rem" }} />;`,
      `const a = <a href="#fff">anchor</a>;`,
      `const a = <div className="max-w-[24rem] w-1/2" />;`,
    ],
    invalid: [
      {
        code: `const a = <div style={{ color: "#fff" }} />;`,
        errors: [{ message: /^Hard-coded color "#fff"\. Use a color token/ }],
      },
      {
        code: `const a = <div style={{ padding: "12px 16px" }} />;`,
        errors: [{ message: /^Hard-coded size "12px"/ }],
      },
      {
        code: `const a = <div style={{ padding: 16 }} />;`,
        errors: [{ message: /^Hard-coded size "16px"/ }],
      },
      {
        code: "const a = <div style={{ border: `1px solid ${color}` }} />;",
        errors: [{ message: /^Hard-coded size "1px"/ }],
      },
      {
        code: `const a = <div className="mt-[12px]" />;`,
        errors: [{ message: /^Hard-coded size "12px"/ }],
      },
      {
        code: "const a = <p className={`text-[#5c6370] ${extra}`} />;",
        errors: [{ message: /^Hard-coded color "#5c6370"/ }],
      },
    ],
  });
});

test("ds/prefer-stack", () => {
  const message = `Raw <div> with flex, grid or gap styling (rule stack/no-flex-div). Use ${layoutComponent} for layout and spacing (see: ds docs get ${layoutComponent}).`;
  ruleTester.run("prefer-stack", preferStack, {
    valid: [
      `const a = <Stack gap="md"><p>text</p></Stack>;`,
      `const a = <div style={{ display: "block" }} className="flexible" />;`,
    ],
    invalid: [
      { code: `const a = <div style={{ display: "flex" }} />;`, errors: [{ message }] },
      { code: `const a = <div style={{ gap: token("space.md") }} />;`, errors: [{ message }] },
      { code: `const a = <div className="mt-4 flex gap-2" />;`, errors: [{ message }] },
      { code: `const a = <ul className="grid" />;`, errors: [{ message: /^Raw <ul>/ }] },
    ],
  });
});

test("audit/textfield-label", () => {
  ruleTester.run("textfield-label", textfieldLabel, {
    valid: [`const a = <TextField label="Email" name="email" />;`, `const a = <TextField {...fieldProps} />;`],
    invalid: [
      { code: `const a = <TextField name="email" />;`, errors: [{ message: /^TextField has no label/ }] },
      { code: `const a = <TextField label=" " name="email" />;`, errors: [{ message: /^TextField has no label/ }] },
    ],
  });
});

test("audit/one-primary-button", () => {
  ruleTester.run("one-primary-button", onePrimaryButton, {
    valid: [`const a = <><Button variant="primary">Save</Button><Button>Cancel</Button></>;`],
    invalid: [
      {
        code: `const a = <><Button variant="primary">Save</Button><Button variant="primary">Send</Button></>;`,
        errors: [{ message: /^This file has 2 primary Buttons/ }],
      },
    ],
  });
});
