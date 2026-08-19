import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function sectionById(html, id) {
  const section = html.match(new RegExp(`<section[^>]*id="${id}"[\\s\\S]*?<\\/section>`))?.[0];
  assert.ok(section, `expected #${id} section`);
  return section;
}

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
  const partnerHtml = sectionById(html, "partners");
  const englishPartnerHtml = sectionById(englishHtml, "partners");
  for (const section of [partnerHtml, englishPartnerHtml]) {
    assert.equal(
      (section.match(/class="partner-ribbon-lane(?: partner-ribbon-lane--reverse)?"/g) ?? []).length,
      3,
    );
    assert.equal((section.match(/class="partner-ribbon-tile"/g) ?? []).length, 48);
    assert.equal((section.match(/data-kind="anonymous"/g) ?? []).length, 48);
    assert.equal((section.match(/role="group"/g) ?? []).length, 4);
    assert.doesNotMatch(section, /<img\b|data-kind="brand"|partner-ribbons|lynkvis-ai-logo/i);
    assert.doesNotMatch(
      section,
      /宁波复能稀土新材料股份有限公司|温州橙绘科技有限公司|Lynkvis AI|万科|中国工商银行|华润置地|Vanke|ICBC|CR Land/i,
    );
  }
  assert.match(partnerHtml, /匿名项目经验/);
  assert.match(partnerHtml, /未经相关权利方事先书面许可/);
  assert.match(partnerHtml, /不指向或暗示任何特定企业/);
  assert.match(partnerHtml, /不代表任何企业[\s\S]*推荐或背书/);
  assert.match(englishPartnerHtml, /Anonymized project experience/i);
  assert.match(englishPartnerHtml, /prior written permission/i);
  assert.match(englishPartnerHtml, /does not identify or imply any specific organization/i);
  assert.match(englishPartnerHtml, /does not represent any organization[\s\S]*endorsement[\s\S]*recommendation/i);
  assert.doesNotMatch(html, /\bwude\b/i);
  assert.doesNotMatch(englishHtml, /\bwude\b/i);
  assert.doesNotMatch(html, /星洋智慧|starocean(?:wisdom)?|VISUAL PLACEHOLDER|纯视觉占位/i);
  assert.doesNotMatch(englishHtml, /starocean(?:wisdom)?|VISUAL PLACEHOLDER/i);
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
