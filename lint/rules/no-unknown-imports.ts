import type { Rule } from "eslint";
import config from "../../ds.config";
import { exportNames } from "../../cli/lib/exports";

function notExportedMessage(name: string): string {
  const prefix = `${name} is not exported by ${config.alias}.`;
  const replacement = config.knownHallucinations[name];
  if (replacement) {
    return `${prefix} Use ${replacement} (see: ${config.cliName} docs get ${replacement}).`;
  }
  const real = [...exportNames("component"), ...exportNames("value")].join(", ");
  return `${prefix} Real exports: ${real}.`;
}

export const noUnknownImports: Rule.RuleModule = {
  meta: { type: "problem", schema: [] },
  create(context) {
    const allowed = new Set(exportNames());
    return {
      ImportDeclaration(node) {
        const source = String(node.source.value);
        if (source.startsWith(`${config.alias}/`)) {
          context.report({
            node: node.source,
            message: `Deep import "${source}" is not supported. Import from "${config.alias}" only.`,
          });
          return;
        }
        if (source !== config.alias) return;

        for (const specifier of node.specifiers) {
          if (specifier.type !== "ImportSpecifier") {
            context.report({
              node: specifier,
              message: `Use named imports from "${config.alias}", e.g. import { ${[...allowed][0]} } from "${config.alias}", so each import can be checked.`,
            });
            continue;
          }
          const name = specifier.imported.type === "Identifier" ? specifier.imported.name : String(specifier.imported.value);
          if (!allowed.has(name)) {
            context.report({ node: specifier, message: notExportedMessage(name) });
          }
        }
      },
    };
  },
};
