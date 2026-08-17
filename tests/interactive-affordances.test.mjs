import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const copy = readFileSync(new URL("../app/site-copy.ts", import.meta.url), "utf8");
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const profileReadme = readFileSync(
  new URL("../work/github-profile/README.md", import.meta.url),
  "utf8",
);

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

test("all four participation cases are complete on-site and never link to the source site", () => {
  assert.match(page, /<a href="#case-study">\{copy\.header\.caseStudy\}<\/a>/);
  assert.match(page, /id="case-study"/);
  assert.match(page, /className="case-grid"/);
  assert.match(page, /copy\.caseStudy\.projects\.map\(\(project\) =>/);
  assert.match(page, /data-case-id=\{project\.id\}/);
  assert.match(page, /className="system-case-role"/);
  assert.match(
    page,
    /className="system-case-cta"\s+href="#contact"/,
  );
  for (const title of [
    "大白 AI 心理健康平台",
    "工业合规知识平台",
    "智能 SRE 运维助手",
    "生成式内容调度平台",
  ]) {
    assert.match(copy, new RegExp(title));
  }
  assert.match(copy, /role: "团队项目参与者"/);
  assert.match(copy, /具体职责、周期与量化结果未公开/);
  assert.doesNotMatch(page, /wude-case-details/);
  for (const source of [page, copy, readme, profileReadme]) {
    assert.doesNotMatch(source, /cs-wude\.github\.io|github\.com\/CS-wude/i);
  }
  assert.equal((copy.match(/role: "团队项目参与者"/g) ?? []).length, 4);
  assert.equal((copy.match(/role: "Team project contributor"/g) ?? []).length, 4);
  assert.doesNotMatch(copy, /role:\s*"(?:独立开发者|项目负责人|Project owner|Sole owner)"/i);
});

test("participation case grid is responsive and prevents fixed-width overflow", () => {
  assert.match(css, /\.case-grid\s*\{[^}]*repeat\(2,minmax\(0,1fr\)\)/s);
  assert.match(css, /\.system-case\s*\{[^}]*min-width:\s*0/s);
  assert.match(css, /\.system-case-visual\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(
    css,
    /@media\s*\(max-width:\s*\d+px\)[\s\S]*?\.case-grid\s*\{[^}]*grid-template-columns:\s*1fr/s,
  );
  assert.doesNotMatch(
    css,
    /\.(?:case-grid|system-case|system-case-visual|system-case-content)[^{]*\{[^}]*width:\s*100vw/s,
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

test("partner wall only presents confirmed or explicitly unfilled disclosure", () => {
  assert.match(page, /id="partners"/);
  assert.match(page, /className="partner-wall"/);
  assert.match(copy, /WUDE 项目团队/);
  assert.match(copy, /公司客户名称与 Logo 仅在获得授权后加入/);
  assert.match(page, /brand-tile--cta/);
  assert.match(css, /\.partner-wall\s*\{[^}]*repeat\(3,minmax\(0,1fr\)\)/s);
});
