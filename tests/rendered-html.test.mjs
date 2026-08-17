import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(path, "http://localhost/"), {
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

test("server-renders the English route with an English root document", async () => {
  const response = await render("/en/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="en" data-theme="dark" data-motion="pending">/);
  assert.match(html, /<main[^>]*lang="en"/);
  assert.match(html, /<title>Fengyu \| FDE for AI Product Delivery<\/title>/);
  assert.match(html, /Turn real problems/);
  assert.doesNotMatch(html, /document\.documentElement\.lang\s*=/);
});

test("server-renders the complete FDE portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN" data-theme="dark" data-motion="pending">/);
  assert.match(html, /<title>风雨｜FDE · AI 产品落地与系统交付<\/title>/);
  assert.match(html, /把业务难题/);
  assert.match(html, /id="services"/);
  assert.match(html, /id="partners"/);
  assert.match(html, /合作品牌/);
  assert.match(html, /WUDE 项目团队/);
  assert.match(html, /这里只展示获得许可的合作信息/);
  assert.match(html, /id="case-study"/);
  assert.match(html, /大白 AI 心理健康平台/);
  assert.match(html, /工业合规知识平台/);
  assert.match(html, /智能 SRE 运维助手/);
  assert.match(html, /生成式内容调度平台/);
  assert.equal((html.match(/data-case-id=/g) ?? []).length, 4);
  assert.equal((html.match(/class="system-case-cta" href="#contact"/g) ?? []).length, 4);
  assert.equal((html.match(/>项目主导者</g) ?? []).length, 4);
  assert.doesNotMatch(html, /团队项目参与者|风雨确认参与/);
  assert.doesNotMatch(html, /具体职责(?:边界)?、(?:参与)?周期与量化结果(?:尚)?未公开/);
  assert.doesNotMatch(html, /wude-case-details/);
  assert.doesNotMatch(html, /cs-wude\.github\.io|github\.com\/CS-wude/i);
  assert.match(html, /id="process"/);
  assert.match(html, /id="about"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /聊聊合作/);
  assert.match(html, /我是风雨，前沿部署工程师/);
  assert.match(html, /class="preference-control language-control"/);
  assert.match(html, /class="preference-control theme-control"/);
  assert.doesNotMatch(html, /FENGYU|Feng Yu/);
  assert.doesNotMatch(html, /This page couldn.t load|id="__next_error__"/i);
  assert.doesNotMatch(html, /codex-preview/);
});

test("loads GSAP after mount and cleans up responsive animations", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/home.tsx", import.meta.url), "utf8"),
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
