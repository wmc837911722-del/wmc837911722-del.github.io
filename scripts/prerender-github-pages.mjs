import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createElement, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const { default: Home } = await server.ssrLoadModule("/app/page.tsx");
  const outputPath = resolve("dist-github-pages/index.html");
  const template = await readFile(outputPath, "utf8");
  const markup = renderToString(
    createElement(StrictMode, null, createElement(Home)),
  );
  const placeholder = '<div id="root"></div>';

  if (!template.includes(placeholder)) {
    throw new Error("GitHub Pages build is missing the root placeholder");
  }

  await writeFile(
    outputPath,
    template.replace(placeholder, `<div id="root">${markup}</div>`),
    "utf8",
  );
} finally {
  await server.close();
}
