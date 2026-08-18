import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const projects = [
  {
    id: "lynkvis-ai",
    zh: "Lynkvis AI 室内设计出图平台",
    en: "Lynkvis AI Interior Design Platform",
  },
  {
    id: "ecommerce-research-agent",
    zh: "电商选品与内容自动化 Agent",
    en: "E-commerce Research & Content Agent",
  },
  {
    id: "enterprise-rag-mcp-assistant",
    zh: "复能助手：企业级 RAG + MCP Agent",
    en: "复能助手 — Enterprise RAG + MCP Assistant",
  },
  {
    id: "mental-health-platform",
    zh: "大白 AI 心理健康平台",
    en: "Dabai AI Mental Health Platform",
  },
  {
    id: "industrial-compliance-platform",
    zh: "工业合规知识平台",
    en: "Industrial Compliance Knowledge Platform",
  },
  {
    id: "sre-copilot",
    zh: "智能 SRE 运维助手",
    en: "Intelligent SRE Operations Assistant",
  },
  {
    id: "content-orchestration",
    zh: "生成式内容调度平台",
    en: "Generative Content Orchestration Platform",
  },
];

const caseSection = (html) => {
  const start = html.indexOf('id="case-study"');
  const end = html.indexOf('id="process"', start);

  assert.notEqual(start, -1, "expected the rendered case-study section");
  assert.notEqual(end, -1, "expected the process section after the cases");
  return html.slice(start, end);
};

test("case data contains seven bilingual projects with explicit role attribution", async () => {
  const copy = await read("app/site-copy.ts");

  for (const project of projects) {
    assert.ok(copy.includes(`id: "${project.id}"`));
    assert.ok(copy.includes(project.zh));
    assert.ok(copy.includes(project.en));
  }

  assert.equal((copy.match(/role: "项目主导者"/g) ?? []).length, 4);
  assert.equal((copy.match(/role: "Project lead"/g) ?? []).length, 4);
  assert.equal((copy.match(/role: "独立全栈开发"/g) ?? []).length, 1);
  assert.equal((copy.match(/role: "独立开发"/g) ?? []).length, 1);
  assert.equal((copy.match(/role: "全栈开发 \/ AI 应用开发"/g) ?? []).length, 1);
  assert.equal((copy.match(/role: "Independent full-stack developer"/g) ?? []).length, 1);
  assert.equal((copy.match(/role: "Independent developer"/g) ?? []).length, 1);
  assert.equal((copy.match(/role: "Full-stack \/ AI application developer"/g) ?? []).length, 1);
  assert.doesNotMatch(copy, /团队项目参与者|Team project contributor/i);
  assert.doesNotMatch(copy, /风雨确认参与|Participation confirmed by Fengyu/i);
  assert.doesNotMatch(copy, /具体职责(?:边界)?、(?:参与)?周期与量化结果(?:尚)?未公开/);
  assert.doesNotMatch(
    copy,
    /scope, duration and measured outcomes are not publicly disclosed/i,
  );
});

test("the rendered GitHub Pages case section stays on-site", async () => {
  const html = caseSection(await read("dist-github-pages/index.html"));

  for (const project of projects) {
    assert.match(html, new RegExp(`data-case-id="${project.id}"`));
    assert.ok(html.includes(project.zh));
  }

  assert.equal((html.match(/data-case-id=/g) ?? []).length, projects.length);
  assert.equal(
    (html.match(/class="system-case-cta" href="#contact"/g) ?? []).length,
    projects.length,
  );
  assert.equal((html.match(/>项目主导者</g) ?? []).length, 4);
  assert.match(html, />独立全栈开发</);
  assert.match(html, />独立开发</);
  assert.match(html, />全栈开发 \/ AI 应用开发</);
  assert.doesNotMatch(html, /\bsrc="https?:\/\//i);
  assert.match(html, /href="https:\/\/linktelai\.com\/"/i);
  assert.doesNotMatch(html, /cs-wude\.github\.io|github\.com\/CS-wude|wude-case-details/i);
});
