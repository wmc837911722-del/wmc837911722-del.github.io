import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete FDE portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN" data-theme="dark" data-motion="pending">/);
  assert.match(html, /<title>风雨 — Forward Deployed Engineer<\/title>/);
  assert.match(html, /深入业务现场/);
  assert.match(html, /id="services"/);
  assert.match(html, /id="partners"/);
  assert.match(html, /合作品牌/);
  assert.match(html, /WUDE 项目团队/);
  assert.match(html, /id="case-study"/);
  assert.match(html, /WUDE \/ PERSONAL SITE/);
  assert.match(html, /项目参与者/);
  assert.match(html, /id="wude-case-details"/);
  assert.doesNotMatch(html, /cs-wude\.github\.io|github\.com\/CS-wude/i);
  assert.match(html, /id="process"/);
  assert.match(html, /id="about"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /聊聊合作/);
  assert.match(html, /我是风雨，一名前沿部署工程师/);
  assert.match(html, /class="preference-control language-control"/);
  assert.match(html, /class="preference-control theme-control"/);
  assert.doesNotMatch(html, /FENGYU|Feng Yu/);
  assert.doesNotMatch(html, /This page couldn.t load|id="__next_error__"/i);
  assert.doesNotMatch(html, /codex-preview/);
});

test("loads GSAP after mount and cleans up responsive animations", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(
    page,
    /^import .* from ["'](?:@gsap\/react|gsap(?:\/ScrollTrigger)?)["'];?$/m,
  );
  assert.match(page, /useEffect\(\(\) =>/);
  assert.match(page, /import\("gsap"\)/);
  assert.match(page, /import\("gsap\/ScrollTrigger"\)/);
  assert.match(page, /mobile:\s*"\(max-width:\s*799px\)"/);
  assert.match(page, /media\.revert\(\)/);
  assert.match(page, /startAnimations\(\)\.catch/);
  assert.match(page, /removeEventListener\("pointermove"/);
  assert.match(css, /html\[data-motion="pending"\]/);
  assert.match(css, /animation:\s*motion-fallback/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
