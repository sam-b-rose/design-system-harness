import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import config from "./ds.config";

export default defineConfig({
  root: config.playgroundDir,
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: new RegExp(`^${config.alias}$`),
        replacement: resolve(import.meta.dirname, config.entry),
      },
    ],
  },
  build: { outDir: "../dist", emptyOutDir: true },
});
