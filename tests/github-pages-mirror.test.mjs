import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("GitHub Pages entry reuses the existing portfolio", async () => {
  const entry = await read("github-pages/src/main.tsx");

  assert.match(entry, /import Home from "\.\.\/\.\.\/app\/home"/);
  assert.match(entry, /import "\.\.\/\.\.\/app\/globals\.css"/);
});

test("GitHub Pages metadata and assets have no blocked external dependency", async () => {
  const html = await read("github-pages/index.html");

  assert.match(html, /<html lang="zh-CN"/);
  assert.match(html, /data-theme="dark"/);
  assert.match(html, /fengyu:theme:v1/);
  assert.match(html, /<title>风雨｜FDE · AI 产品落地与系统交付<\/title>/);
  assert.match(
    html,
    /<meta property="og:title" content="风雨｜FDE · AI 产品落地与系统交付" \/>/,
  );
  assert.match(
    html,
    /<meta name="twitter:title" content="风雨｜FDE · AI 产品落地与系统交付" \/>/,
  );
  assert.match(html, /rel="canonical" href="https:\/\/wmc837911722-del\.github\.io\/"/);
  assert.match(html, /rel="icon" href="\/favicon\.svg"/);
  assert.doesNotMatch(html, /rel="icon" href="\.\/favicon\.svg"/);
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
  const [html, englishHtml] = await Promise.all([
    read("dist-github-pages/index.html"),
    read("dist-github-pages/en/index.html"),
  ]);

  assert.match(html, /把业务难题/);
  assert.match(html, /id="services"/);
  assert.match(html, /class="capability-section"/);
  assert.match(html, /id="partners"/);
  assert.match(html, /宁波复能稀土新材料股份有限公司/);
  assert.match(html, /温州橙绘科技有限公司/);
  assert.match(html, /当前并未完整展示全部合作记录/);
  assert.doesNotMatch(html, /\bwude\b/i);
  assert.doesNotMatch(englishHtml, /\bwude\b/i);
  assert.match(html, /id="case-study"/);
  assert.match(html, /Lynkvis AI 室内设计出图平台/);
  assert.match(html, /电商选品与内容自动化 Agent/);
  assert.match(html, /复能助手：企业级 RAG \+ MCP Agent/);
  assert.match(html, /大白 AI 心理健康平台/);
  assert.match(html, /工业合规知识平台/);
  assert.match(html, /智能 SRE 运维助手/);
  assert.match(html, /生成式内容调度平台/);
  assert.equal((html.match(/data-case-id=/g) ?? []).length, 7);
  assert.equal((html.match(/class="system-case-cta" href="#contact"/g) ?? []).length, 7);
  assert.equal((html.match(/>项目主导者</g) ?? []).length, 4);
  assert.match(html, />独立全栈开发</);
  assert.match(html, />独立开发</);
  assert.match(html, />全栈开发 \/ AI 应用开发</);
  assert.doesNotMatch(html, /团队项目参与者|风雨确认参与/);
  assert.doesNotMatch(html, /wude-case-details/);
  assert.match(html, /class="preference-control language-control"/);
  assert.match(html, /class="preference-control theme-control"/);
  assert.doesNotMatch(html, /cs-wude\.github\.io|github\.com\/CS-wude/i);
  assert.match(html, /id="process"/);
  assert.match(html, /id="contact"/);
  assert.doesNotMatch(html, /chatgpt\.site/);
});
