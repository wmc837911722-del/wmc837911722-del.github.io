import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("localized portfolio metadata stays static for edge hosting", async () => {
  const layouts = await Promise.all([
    readFile(new URL("../app/(zh)/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/layout.tsx", import.meta.url), "utf8"),
  ]);

  for (const layout of layouts) {
    assert.doesNotMatch(layout, /from ["']next\/headers["']/, "request headers force a private dynamic render on the edge");
    assert.doesNotMatch(layout, /generateMetadata/, "metadata should not require a fresh server render");
    assert.match(layout, /export const metadata\s*:\s*Metadata\s*=/, "layout should export static metadata");
    assert.match(layout, /metadataBase:\s*new URL\(/, "relative social assets need a stable public metadata base");
    assert.match(layout, /icons:\s*\{\s*icon:\s*"\/favicon\.svg"\s*\}/);
  }
});

test("localized root layouts declare their document language before hydration", async () => {
  const [rootDocument, chineseLayout, englishLayout] = await Promise.all([
    readFile(new URL("../app/root-document.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(rootDocument, /lang:\s*"zh-CN"\s*\|\s*"en"/);
  assert.match(rootDocument, /<html[\s\S]*?lang=\{lang\}/);
  assert.match(chineseLayout, /<RootDocument lang="zh-CN">/);
  assert.match(englishLayout, /<RootDocument lang="en">/);
  assert.doesNotMatch(rootDocument, /document\.documentElement\.lang\s*=/);
});
