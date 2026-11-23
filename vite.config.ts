import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import config from "./ds.config.ts";
import { ENTRY, PLAYGROUND_DIR } from "./cli/lib/paths.ts";

export default defineConfig({
  root: PLAYGROUND_DIR,
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: new RegExp(`^${config.alias}$`),
        replacement: resolve(import.meta.dirname, ENTRY),
      },
    ],
  },
  build: { outDir: "../dist", emptyOutDir: true },
});
