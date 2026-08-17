import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "github-pages",
  base: "/",
  publicDir: "../public",
  plugins: [react()],
  build: {
    outDir: "../dist-github-pages",
    emptyOutDir: true,
  },
});
