import type { Rule } from "eslint";
import config from "../../ds.config";

interface JsxAttribute {
  type: string;
  name?: { name?: string };
  value?: { type: string; value?: unknown } | null;
}

export const textfieldLabel: Rule.RuleModule = {
  meta: { type: "problem", schema: [] },
  create(context) {
    return {
      "JSXOpeningElement[name.name='TextField']"(node: Rule.Node) {
        const { attributes } = node as unknown as { attributes: JsxAttribute[] };
        if (attributes.some((attribute) => attribute.type === "JSXSpreadAttribute")) return;
        const label = attributes.find((attribute) => attribute.name?.name === "label");
        const isEmpty = label?.value?.type === "Literal" && String(label.value.value).trim() === "";
        if (!label || !label.value || isEmpty) {
          context.report({
            node,
            message: `TextField has no label. Add a visible label, e.g. label="Email" (see: ${config.cliName} docs get TextField).`,
          });
        }
      },
    };
  },
};
