import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the locale dictionary covers the full commercial page in both languages", async () => {
  const copy = await read("app/site-copy.ts");

  assert.match(copy, /export type Locale = "zh" \| "en"/);
  assert.match(copy, /zh:\s*\{/);
  assert.match(copy, /en:\s*\{/);
  assert.match(copy, /Fengyu \| FDE for AI Product Delivery/);
  assert.match(copy, /AI use-case discovery & roadmap/);
  assert.match(copy, /Anonymized project experience/);
  assert.match(copy, /prior written permission/);
  assert.match(copy, /no specific organization or brand endorsement is implied/i);
  assert.doesNotMatch(copy, /\bwude\b|WUDE 项目团队|WUDE project team/i);
  assert.match(copy, /Dabai AI Mental Health Platform/);
  assert.match(copy, /Industrial Compliance Knowledge Platform/);
  assert.match(copy, /Intelligent SRE Operations Assistant/);
  assert.match(copy, /Generative Content Orchestration Platform/);
  assert.equal((copy.match(/role: "Project lead"/g) ?? []).length, 4);
  assert.doesNotMatch(
    copy,
    /specific responsibilities, duration and measured outcomes are not publicly disclosed/i,
  );
  assert.match(copy, /AI delivery project \| Initial use-case discussion/);
});

test("theme restores safely while language choices navigate to indexable routes", async () => {
  const [page, layout, githubHtml] = await Promise.all([
    read("app/home.tsx"),
    read("app/root-document.tsx"),
    read("github-pages/index.html"),
  ]);

  assert.match(page, /initialLocale\s*=\s*"zh"/);
  assert.match(page, /useState<Locale>\(initialLocale\)/);
  assert.match(page, /useState<Theme>\("dark"\)/);
  assert.doesNotMatch(page, /useState\(\(\)\s*=>[\s\S]{0,100}localStorage/);
  assert.doesNotMatch(page, /savedLocale === "zh" \|\| savedLocale === "en"/);
  assert.match(page, /window\.localStorage\.setItem\(LOCALE_STORAGE_KEY/);
  assert.match(page, /window\.localStorage\.setItem\(THEME_STORAGE_KEY/);
  assert.match(page, /window\.location\.assign\(`\$\{localePaths\[nextLocale\]\}/);
  assert.match(layout, /data-theme="dark"/);
  assert.match(layout, /prefers-color-scheme: light/);
  assert.match(githubHtml, /data-theme="dark"/);
  assert.match(githubHtml, /prefers-color-scheme: light/);
});

test("the public project never sends visitors to the source owner's pages", async () => {
  const sources = await Promise.all([
    read("app/home.tsx"),
    read("app/site-copy.ts"),
    read("README.md"),
  ]);

  for (const source of sources) {
    assert.doesNotMatch(source, /cs-wude\.github\.io|github\.com\/CS-wude/i);
  }
});
