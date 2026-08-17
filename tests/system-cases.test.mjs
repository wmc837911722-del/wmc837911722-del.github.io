import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const projects = [
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

test("case data contains exactly four bilingual system projects with contributor disclosure", async () => {
  const copy = await read("app/site-copy.ts");

  for (const project of projects) {
    assert.match(copy, new RegExp(`id: "${project.id}"`));
    assert.match(copy, new RegExp(project.zh));
    assert.match(copy, new RegExp(project.en));
  }

  assert.equal((copy.match(/role: "团队项目参与者"/g) ?? []).length, 4);
  assert.equal((copy.match(/role: "Team project contributor"/g) ?? []).length, 4);
  assert.match(copy, /具体职责、周期与量化结果未公开/);
  assert.match(copy, /scope, duration and measured outcomes are not publicly disclosed/);
});

test("the rendered GitHub Pages case section stays on-site", async () => {
  const html = caseSection(await read("dist-github-pages/index.html"));

  for (const project of projects) {
    assert.match(html, new RegExp(`data-case-id="${project.id}"`));
    assert.match(html, new RegExp(project.zh));
  }

  assert.equal((html.match(/data-case-id=/g) ?? []).length, projects.length);
  assert.equal(
    (html.match(/class="system-case-cta" href="#contact"/g) ?? []).length,
    projects.length,
  );
  assert.doesNotMatch(html, /\b(?:href|src)="https?:\/\//i);
  assert.doesNotMatch(html, /cs-wude\.github\.io|github\.com\/CS-wude|wude-case-details/i);
});
