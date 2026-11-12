import type { Rule } from "eslint";
import config from "../../ds.config";

const LAYOUT_DISPLAY = /^(inline-)?(flex|grid)$/;
const GAP_PROPERTY = /^(gap|rowGap|columnGap)$/;
const LAYOUT_CLASS = /(^|\s)(flex|inline-flex|grid|gap-\S+|space-[xy]-\S+)(\s|$)/;

interface JsxAttribute {
  type: string;
  name?: { name?: string };
  value?: { type: string; value?: unknown; expression?: { type: string; properties?: StyleProperty[] } };
}

interface JsxOpeningElement {
  name: { type: string; name: string };
  attributes: JsxAttribute[];
}

interface StyleProperty {
  type: string;
  key?: { type: string; name?: string };
  value?: { type: string; value?: unknown };
}

function hasLayoutStyle(attribute: JsxAttribute): boolean {
  const expression = attribute.value?.expression;
  if (expression?.type !== "ObjectExpression") return false;
  return (expression.properties ?? []).some((property) => {
    const name = property.key?.type === "Identifier" ? property.key.name : undefined;
    if (!name) return false;
    if (GAP_PROPERTY.test(name)) return true;
    return name === "display" && typeof property.value?.value === "string" && LAYOUT_DISPLAY.test(property.value.value);
  });
}

function hasLayoutClass(attribute: JsxAttribute): boolean {
  return typeof attribute.value?.value === "string" && LAYOUT_CLASS.test(attribute.value.value);
}

export const preferStack: Rule.RuleModule = {
  meta: { type: "problem", schema: [] },
  create(context) {
    const layout = config.layoutComponent;
    if (!layout) return {};
    return {
      JSXOpeningElement(node: Rule.Node) {
        const element = node as unknown as JsxOpeningElement;
        const isHostElement = element.name.type === "JSXIdentifier" && /^[a-z]/.test(element.name.name);
        if (!isHostElement) return;
        const usesLayoutStyling = element.attributes.some((attribute) => {
          if (attribute.type !== "JSXAttribute") return false;
          if (attribute.name?.name === "style") return hasLayoutStyle(attribute);
          if (attribute.name?.name === "className") return hasLayoutClass(attribute);
          return false;
        });
        if (usesLayoutStyling) {
          context.report({
            node,
            message: `Raw <${element.name.name}> with flex, grid or gap styling. Use ${layout} for layout and spacing (see: ${config.cliName} docs get ${layout}).`,
          });
        }
      },
    };
  },
};
