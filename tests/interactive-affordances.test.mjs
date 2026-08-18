import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../app/home.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const copy = readFileSync(new URL("../app/site-copy.ts", import.meta.url), "utf8");
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");

test("service cards are real links to the contact section", () => {
  assert.match(page, /<a\s+className="service-card"\s+href="#contact"/);
  assert.doesNotMatch(page, /<article\s+className="service-card"/);
});

test("service card hover keeps the control inside its grid cell", () => {
  const controlHoverRule = css.match(
    /\.service-card:hover\s+\.card-arrow\s*\{([^}]*)\}/,
  )?.[1];

  assert.ok(controlHoverRule, "expected a hover rule for the arrow control");
  assert.doesNotMatch(controlHoverRule, /transform\s*:/);
  assert.match(
    css,
    /\.service-card:hover\s+\.card-arrow-glyph\s*\{[^}]*transform\s*:/,
  );
});

test("hero reveal clipping keeps CJK punctuation fully visible", () => {
  const wrapperRule = css.match(/\.hero-line-wrap\s*\{([^}]*)\}/)?.[1];

  assert.ok(wrapperRule, "expected a clipping wrapper for the hero reveal");
  assert.match(wrapperRule, /overflow:\s*hidden/);
  assert.match(wrapperRule, /padding:\s*0\s+\.12em\s+\.16em\s+0/);
  assert.match(wrapperRule, /margin:\s*0\s+-\.12em\s+-\.16em\s+0/);
});

test("contact CTA performs an action instead of linking back to the top", () => {
  assert.match(page, /<button\s+className="contact-link"/);
  assert.doesNotMatch(page, /className="contact-link"\s+href="#top"/);
});

test("contact section exposes both direct email links", () => {
  assert.match(page, /address: "837911722@qq\.com"/);
  assert.match(page, /address: "wmc837911722@gmail\.com"/);
  assert.match(page, /href={`mailto:\$\{address\}\?subject=/);
});

test("non-interactive capability and process rows do not mimic buttons", () => {
  assert.doesNotMatch(css, /\.capability-card:hover\s*\{/);
  assert.doesNotMatch(css, /\.steps\s+li:hover\s*\{/);
});

test("all seven cases are complete on-site with explicit, safe actions", () => {
  assert.match(page, /<a href="#case-study">\{copy\.header\.caseStudy\}<\/a>/);
  assert.match(page, /id="case-study"/);
  assert.match(page, /className="[^"]*\bcase-carousel\b[^"]*"/);
  assert.match(page, /id="case-carousel-track"/);
  assert.match(page, /copy\.caseStudy\.projects\.map\(\(project(?:,\s*index)?\) =>/);
  assert.match(page, /data-case-id=\{project\.id\}/);
  assert.match(page, /className="case-index-button"/);
  assert.match(page, /aria-pressed=\{index === activeCaseIndex\}/);
  assert.match(page, /className="system-case-role"/);
  assert.match(
    page,
    /className="system-case-cta"\s+href="#contact"/,
  );
  for (const title of [
    "Lynkvis AI 室内设计出图平台",
    "电商选品与内容自动化 Agent",
    "复能助手：企业级 RAG + MCP Agent",
    "大白 AI 心理健康平台",
    "工业合规知识平台",
    "智能 SRE 运维助手",
    "生成式内容调度平台",
  ]) {
    assert.ok(copy.includes(title));
  }
  assert.match(copy, /role: "项目主导者"/);
  assert.doesNotMatch(page, /wude-case-details/);
  for (const source of [page, copy, readme]) {
    assert.doesNotMatch(source, /cs-wude\.github\.io|github\.com\/CS-wude/i);
  }
  assert.equal((copy.match(/role: "项目主导者"/g) ?? []).length, 4);
  assert.equal((copy.match(/role: "Project lead"/g) ?? []).length, 4);
  assert.equal((copy.match(/role: "独立全栈开发"/g) ?? []).length, 1);
  assert.equal((copy.match(/role: "独立开发"/g) ?? []).length, 1);
  assert.equal((copy.match(/role: "全栈开发 \/ AI 应用开发"/g) ?? []).length, 1);
  assert.match(page, /href=\{project\.externalUrl\}/);
  assert.match(page, /rel="noopener noreferrer"/);
  assert.doesNotMatch(copy, /团队项目参与者|Team project contributor/i);
  assert.doesNotMatch(copy, /风雨确认参与|Participation confirmed by Fengyu/i);
  assert.doesNotMatch(copy, /具体职责(?:边界)?、(?:参与)?周期与量化结果(?:尚)?未公开/);
  assert.doesNotMatch(copy, /scope, duration and measured outcomes are not publicly disclosed/i);
});

test("lead case carousel is responsive and prevents fixed-width overflow", () => {
  assert.match(css, /\.case-carousel\s*\{[^}]*min-width:\s*0/s);
  assert.match(css, /\.case-carousel-viewport\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.case-carousel-track\s*\{[^}]*min-width:\s*0/s);
  assert.match(css, /\.system-case\s*\{[^}]*min-width:\s*0/s);
  assert.match(
    css,
    /@media\s*\(max-width:\s*\d+px\)[\s\S]*?\.system-case\s*\{[^}]*grid-template-columns:\s*1fr/s,
  );
  assert.doesNotMatch(
    css,
    /\.(?:case-carousel|case-carousel-viewport|case-carousel-track|system-case|system-case-visual|system-case-content)[^{]*\{[^}]*width:\s*100vw/s,
  );
});

test("language and theme controls are accessible buttons with 44px targets", () => {
  assert.match(page, /className="preference-control language-control"[\s\S]*?type="button"/);
  assert.match(page, /className="preference-control theme-control"[\s\S]*?type="button"/);
  assert.match(page, /aria-pressed=\{theme === "light"\}/);
  assert.match(page, /document\.documentElement\.lang/);
  assert.match(page, /fengyu:locale:v1/);
  assert.match(page, /fengyu:theme:v1/);
  assert.match(css, /\.preference-control\s*\{[^}]*min-width:\s*44px[^}]*min-height:\s*44px/s);
  assert.match(css, /html\[data-theme="light"\]/);
});

test("partner wall presents confirmed collaboration with explicit disclosure boundaries", () => {
  assert.match(page, /id="partners"/);
  assert.match(page, /className="partner-wall"/);
  assert.doesNotMatch(copy, /\bwude\b|WUDE 项目团队|WUDE project team/i);
  assert.match(copy, /宁波复能稀土新材料股份有限公司/);
  assert.match(copy, /温州橙绘科技有限公司/);
  assert.match(copy, /当前并未完整展示全部合作记录/);
  assert.match(copy, /因保密约定不公开名称、Logo、项目资料与业务数据/);
  assert.match(page, /src=\{tile\.logoSrc\}/);
  assert.match(page, /alt=\{tile\.logoAlt\}/);
  assert.match(page, /loading="lazy"/);
  assert.match(page, /brand-tile--cta/);
  assert.match(css, /\.partner-wall\s*\{[^}]*repeat\(3,minmax\(0,1fr\)\)/s);
  assert.match(css, /\.brand-tile--cta\s*\{[^}]*grid-column:\s*span 2/s);
  assert.match(css, /@media \(min-width: 800px\) and \(max-width: 1099px\)\s*\{[^}]*\.partner-wall\s*\{[^}]*repeat\(2,minmax\(0,1fr\)\)/s);
  assert.match(css, /@media \(max-width: 799px\)[\s\S]*\.brand-tile--cta\s*\{[^}]*grid-column:\s*auto/);
  assert.match(css, /@media \(max-width: 799px\)[\s\S]*\.brand-tile--cta small\s*\{[^}]*padding-right:\s*72px/);
});
