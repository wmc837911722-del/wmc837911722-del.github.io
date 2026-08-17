import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("GitHub Pages entry reuses the existing portfolio", async () => {
  const entry = await read("github-pages/src/main.tsx");

  assert.match(entry, /import Home from "\.\.\/\.\.\/app\/page"/);
  assert.match(entry, /import "\.\.\/\.\.\/app\/globals\.css"/);
});

test("GitHub Pages metadata and assets have no blocked external dependency", async () => {
  const html = await read("github-pages/index.html");

  assert.match(html, /<html lang="zh-CN"/);
  assert.match(html, /风雨 — Forward Deployed Engineer/);
  assert.match(html, /rel="canonical" href="https:\/\/wmc837911722-del\.github\.io\/"/);
  assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic|unpkg|jsdelivr/i);
});

test("GitHub Actions deploys the dedicated static build", async () => {
  const workflow = await read(".github/workflows/deploy-pages.yml");

  assert.match(workflow, /npm run build:github-pages/);
  assert.match(workflow, /actions\/configure-pages@v6/);
  assert.match(workflow, /actions\/upload-pages-artifact@v5/);
  assert.match(workflow, /path: dist-github-pages/);
  assert.match(workflow, /actions\/deploy-pages@v5/);
});

test("GitHub Pages output contains pre-rendered portfolio content", async () => {
  const html = await read("dist-github-pages/index.html");

  assert.match(html, /深入业务现场/);
  assert.match(html, /id="services"/);
  assert.match(html, /class="capability-section"/);
  assert.match(html, /id="process"/);
  assert.match(html, /id="contact"/);
  assert.doesNotMatch(html, /chatgpt\.site/);
});
