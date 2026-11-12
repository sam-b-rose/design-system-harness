import { mkdirSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { createServer } from "vite";
import config from "../../ds.config";
import type { Violation } from "./check";
import { fromRoot, root } from "./paths";

interface Page {
  on(event: "pageerror", listener: (error: Error) => void): void;
  on(event: "console", listener: (message: { type(): string; text(): string }) => void): void;
  goto(url: string, options: { waitUntil: "networkidle" }): Promise<unknown>;
  locator(selector: string): { count(): Promise<number> };
  screenshot(options: { path: string; fullPage: boolean }): Promise<unknown>;
  close(): Promise<void>;
}

interface Playwright {
  chromium: { launch(): Promise<{ newPage(): Promise<Page>; close(): Promise<void> }> };
}

export type VisualResult =
  | { ok: true; violations: Violation[]; screenshots: string[] }
  | { ok: false; message: string };

const SCREENSHOTS_DIR = join(config.playgroundDir, ".screenshots");
const PLAYWRIGHT_PACKAGE = "playwright";

async function loadPlaywright(): Promise<Playwright | undefined> {
  try {
    return await import(PLAYWRIGHT_PACKAGE);
  } catch {
    return undefined;
  }
}

export async function runVisualCheck(files: string[]): Promise<VisualResult> {
  const playwright = await loadPlaywright();
  if (!playwright) {
    return {
      ok: false,
      message: `${config.cliName} check --visual needs Playwright, which is not installed.\nInstall it with: pnpm add -D playwright && pnpm exec playwright install chromium`,
    };
  }

  const pagesDir = fromRoot(config.pagesDir);
  const pageFiles = files.filter((file) => file.startsWith(pagesDir) && file.endsWith(".tsx"));
  const violations: Violation[] = [];
  const screenshots: string[] = [];
  mkdirSync(fromRoot(SCREENSHOTS_DIR), { recursive: true });

  const browser = await playwright.chromium.launch().catch(() => undefined);
  if (!browser) {
    return {
      ok: false,
      message: `${config.cliName} check --visual could not start Chromium.\nInstall it with: pnpm exec playwright install chromium`,
    };
  }
  const server = await createServer({ configFile: fromRoot("vite.config.ts"), logLevel: "silent" });
  await server.listen();
  const baseUrl = server.resolvedUrls?.local[0];

  try {
    for (const file of pageFiles) {
      const name = basename(file, ".tsx");
      const errors: string[] = [];
      const page = await browser.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });

      await page.goto(`${baseUrl}?page=${name}`, { waitUntil: "networkidle" });
      const rendered = (await page.locator("#root > *").count()) > 0;
      if (!rendered) errors.push("nothing was rendered");

      const screenshot = join(SCREENSHOTS_DIR, `${name}.png`);
      await page.screenshot({ path: fromRoot(screenshot), fullPage: true });
      await page.close();
      screenshots.push(screenshot);

      if (errors.length > 0) {
        violations.push({
          file,
          line: 1,
          column: 1,
          rule: "visual/render-error",
          message: `${name} does not render cleanly in the browser: ${errors[0]} Fix the runtime error, then run \`${config.cliName} check --visual\` again (screenshot: ${relative(root, fromRoot(screenshot))}).`,
        });
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }
  return { ok: true, violations, screenshots };
}
