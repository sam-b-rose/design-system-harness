import type { Rule } from "eslint";
import config from "../../ds.config";

export const onePrimaryButton: Rule.RuleModule = {
  meta: { type: "problem", schema: [] },
  create(context) {
    const primaryButtons: Rule.Node[] = [];
    return {
      "JSXOpeningElement[name.name='Button'] > JSXAttribute[name.name='variant'][value.value='primary']"(
        node: Rule.Node,
      ) {
        if (node.parent) primaryButtons.push(node.parent);
      },
      "Program:exit"() {
        for (const extra of primaryButtons.slice(1)) {
          context.report({
            node: extra,
            message: `This file has ${primaryButtons.length} primary Buttons (rule button/one-primary). A view gets one. Keep the main action primary and remove variant="primary" from the others (see: ds docs get Button).`,
          });
        }
      },
    };
  },
};
