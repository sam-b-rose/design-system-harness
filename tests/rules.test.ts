import { test } from "node:test";
import parser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import { noRawValues } from "../lint/rules/no-raw-values";
import { noUnknownImports } from "../lint/rules/no-unknown-imports";

const ruleTester = new RuleTester({
  languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
});

test("ds/no-unknown-imports", () => {
  ruleTester.run("no-unknown-imports", noUnknownImports, {
    valid: [
      `import { Button, Stack, token, type ButtonProps } from "@ds";`,
      `import { Box } from "another-library";`,
    ],
    invalid: [
      {
        code: `import { Box } from "@ds";`,
        errors: [{ message: "Box is not exported by @ds. Use Stack (see: ds docs get Stack)." }],
      },
      {
        code: `import { Widget } from "@ds";`,
        errors: [{ message: /^Widget is not exported by @ds\. Real exports: .*Stack/ }],
      },
      {
        code: `import * as DS from "@ds";`,
        errors: [{ message: /^Use named imports/ }],
      },
      {
        code: `import { Button } from "@ds/components/Button/Button";`,
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
    ],
  });
});
