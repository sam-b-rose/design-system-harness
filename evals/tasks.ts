import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { fromRoot } from "../cli/lib/paths";

export interface IntentCheck {
  element: string;
  props?: Record<string, string | number | true>;
  count?: number;
  rule?: string;
}

export interface Task {
  id: string;
  prompt: string;
  target: string;
  intent: IntentCheck[];
}

type PropValue = string | number | true | "expression";

interface JsxElement {
  name: string;
  props: Map<string, PropValue>;
}

const TASKS_DIR = fromRoot("evals/tasks");

export function loadTasks(): Task[] {
  return readdirSync(TASKS_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(readFileSync(join(TASKS_DIR, file), "utf8")));
}

function propValue(initializer: ts.JsxAttributeValue | undefined): PropValue {
  if (!initializer) return true;
  if (ts.isStringLiteral(initializer)) return initializer.text;
  const expression = ts.isJsxExpression(initializer) ? initializer.expression : undefined;
  if (expression && ts.isStringLiteral(expression)) return expression.text;
  if (expression && ts.isNumericLiteral(expression)) return Number(expression.text);
  return "expression";
}

function jsxElements(source: string): JsxElement[] {
  const file = ts.createSourceFile("intent.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const elements: JsxElement[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const props = new Map<string, PropValue>();
      for (const attribute of node.attributes.properties) {
        if (ts.isJsxAttribute(attribute)) props.set(attribute.name.getText(file), propValue(attribute.initializer));
      }
      elements.push({ name: node.tagName.getText(file), props });
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return elements;
}

function matches(element: JsxElement, check: IntentCheck): boolean {
  if (element.name !== check.element) return false;
  return Object.entries(check.props ?? {}).every(([name, wanted]) => {
    const actual = element.props.get(name);
    return wanted === true ? actual !== undefined : actual === wanted;
  });
}

export function unmetIntent(source: string, checks: IntentCheck[]): IntentCheck[] {
  const elements = jsxElements(source);
  return checks.filter((check) => {
    const found = elements.filter((element) => matches(element, check)).length;
    return check.count === undefined ? found === 0 : found !== check.count;
  });
}

export function describeIntent(check: IntentCheck): string {
  const props = Object.entries(check.props ?? {}).map(([name, value]) =>
    value === true ? name : typeof value === "string" ? `${name}="${value}"` : `${name}={${value}}`,
  );
  const times = check.count === undefined ? "" : check.count === 1 ? " exactly once" : ` exactly ${check.count} times`;
  const rule = check.rule ? ` (rule ${check.rule})` : "";
  return `<${[check.element, ...props].join(" ")}>${times}${rule}`;
}
