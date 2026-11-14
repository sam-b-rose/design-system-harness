import type { Rule } from "eslint";
import config from "../../ds.config";
import { exampleToken } from "../../cli/lib/tokens";

export const HEX_COLOR = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/i;
export const PX_VALUE = /\b(?!0+px)\d*\.?\d+px\b/;

const TOKENIZED_NUMERIC_PROPERTY = /^(padding|margin|gap|rowGap|columnGap|fontSize|borderRadius)/;
const TOKENS_COMMAND = `${config.cliName} tokens list`;

export function rawValueMessage(text: string): string | undefined {
  const color = text.match(HEX_COLOR);
  if (color) {
    return `Hard-coded color "${color[0]}". Use a color token, e.g. ${exampleToken(["color"])} (see: ${TOKENS_COMMAND} --category color).`;
  }
  const size = text.match(PX_VALUE);
  if (size) {
    return `Hard-coded size "${size[0]}". Use a space, radius or fontSize token, e.g. ${exampleToken(["space"])} (see: ${TOKENS_COMMAND}).`;
  }
  return undefined;
}

const IN_STYLE = "JSXAttribute[name.name='style']";
const IN_CLASS_NAME = "JSXAttribute[name.name='className']";

export const noRawValues: Rule.RuleModule = {
  meta: { type: "problem", schema: [] },
  create(context) {
    const reportText = (node: Rule.Node, text: string) => {
      const message = rawValueMessage(text);
      if (message) context.report({ node, message });
    };

    return {
      [`${IN_STYLE} Literal`](node: Rule.Node) {
        if (node.type !== "Literal") return;
        if (typeof node.value === "string") {
          reportText(node, node.value);
          return;
        }
        const parent = node.parent;
        const isTokenizedProperty =
          parent.type === "Property" &&
          parent.value === node &&
          parent.key.type === "Identifier" &&
          TOKENIZED_NUMERIC_PROPERTY.test(parent.key.name);
        if (typeof node.value === "number" && node.value !== 0 && isTokenizedProperty) {
          reportText(node, `${node.value}px`);
        }
      },
      [`${IN_STYLE} TemplateElement`](node: Rule.Node) {
        if (node.type === "TemplateElement") reportText(node, node.value.raw);
      },
      [`${IN_CLASS_NAME} Literal`](node: Rule.Node) {
        if (node.type === "Literal" && typeof node.value === "string") reportText(node, node.value);
      },
      [`${IN_CLASS_NAME} TemplateElement`](node: Rule.Node) {
        if (node.type === "TemplateElement") reportText(node, node.value.raw);
      },
    };
  },
};
