import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath, URL } from "url";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({
      languageWorkers: [
        "editorWorkerService",
        "typescript",
        "json",
        "html",
        "css",
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(fileURLToPath(new URL(".", import.meta.url)), "src"),
    },
  },
  build: {
    outDir: "build",
    sourcemap: false,
  },
  server: {
    port: 3001,
    open: true,
    proxy: {
      "/api": "http://localhost:2020",
      "/templates": "http://localhost:2020",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.{idea,git,cache,output,temp}/**",
    ],
  },
});
