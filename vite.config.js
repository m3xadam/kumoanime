import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/kumoanime/" : "/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
      },
    },
  },
  preview: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        detail: resolve(import.meta.dirname, "detail.html"),
        recent: resolve(import.meta.dirname, "recent.html"),
        watch: resolve(import.meta.dirname, "watch.html"),
      },
    },
  },
});
