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

test("anonymized project experience keeps the three-row marquee accessible", () => {
  assert.match(page, /id="partners"/);
  assert.match(page, /const \[isPartnerMarqueePaused, setIsPartnerMarqueePaused\] = useState\(false\)/);
  assert.doesNotMatch(page, /featuredPartnerTiles|tile\.kind === "brand"/);
  assert.match(page, /className="partner-marquee-shell"/);
  assert.match(page, /className=\{`partner-marquee\$\{isPartnerMarqueePaused \? " is-paused" : ""\}`\}/);
  assert.match(page, /className="partner-ribbon-stack"/);
  assert.match(page, /id="experience-ribbon-stack"/);
  assert.match(page, /copy\.partners\.rows\.map\(\(row, rowIndex\) => \(/);
  assert.match(page, /rowIndex === 1 \? " partner-ribbon-lane--reverse" : ""/);
  assert.match(page, /role="group"/);
  assert.match(page, /aria-label=\{row\.label\}/);
  assert.doesNotMatch(page, /aria-hidden=\{rowIndex > 0/);
  assert.doesNotMatch(page, /inert=\{rowIndex > 0/);
  assert.match(page, /\{\[0, 1\]\.map\(\(groupIndex\) => \(/);
  assert.match(page, /aria-hidden=\{groupIndex === 1 \? true : undefined\}/);
  assert.match(page, /inert=\{groupIndex === 1 \? true : undefined\}/);
  assert.match(page, /row\.items\.map\(\(tile\) => \(/);
  assert.match(page, /className="partner-ribbon-item"/);
  assert.match(page, /<PartnerRibbonTile tile=\{tile\} \/>/);
  assert.match(page, /className="partner-ribbon-tile"/);
  assert.match(page, /className="partner-ribbon-mark">\{tile\.mark\}<\/strong>/);
  assert.match(page, /className="partner-ribbon-name">\{tile\.name\}<\/span>/);
  assert.match(page, /className="sr-only">\{tile\.note\}<\/span>/);
  assert.doesNotMatch(page, /copy\.partners\.ribbons|tile\.logoSrc|tile\.logoAlt/);
  assert.doesNotMatch(page, /partner-ribbon-(?:logo|strip|strip-item|item--featured)/);
  assert.match(page, /className="partner-marquee-toggle"/);
  assert.match(page, /type="button"/);
  assert.match(page, /aria-controls="experience-ribbon-stack"/);
  assert.match(page, /aria-pressed=\{isPartnerMarqueePaused\}/);
  assert.match(page, /setIsPartnerMarqueePaused\(\(paused\) => !paused\)/);
  assert.match(page, />\s*\{copy\.partners\.pauseMotion\}\s*<\/button>/);
  assert.doesNotMatch(page, /copy\.partners\.resumeMotion/);
  assert.match(page, /className="partner-wall-footer"/);
  assert.doesNotMatch(copy, /\bwude\b|WUDE 项目团队|WUDE project team/i);
  assert.match(copy, /未经相关权利方事先书面许可/);
  assert.match(copy, /不指向或暗示任何特定企业/);
  assert.match(copy, /不代表任何企业.*推荐或背书/);
  assert.match(copy, /prior written permission/i);
  assert.match(copy, /does not identify or imply any specific organization/i);
  assert.match(copy, /does not represent any organization.*endorsement.*recommendation/i);
  assert.doesNotMatch(copy, /宁波复能稀土新材料股份有限公司|温州橙绘科技有限公司|\/brands\/partner-ribbons|lynkvis-ai-logo/i);
  assert.doesNotMatch(copy, /星洋智慧|starocean(?:wisdom)?|VISUAL PLACEHOLDER|纯视觉占位/i);
  assert.match(page, /brand-tile--cta/);
  assert.match(css, /\.partner-marquee\s*\{[^}]*overflow:\s*(?:hidden|clip)/s);
  assert.match(css, /\.partner-ribbon-stack\s*\{[^}]*(?:gap|row-gap):\s*21px/s);
  assert.match(css, /\.partner-ribbon-lane\s*\{(?=[^}]*height:\s*63px)(?=[^}]*overflow:\s*(?:hidden|clip))[^}]*\}/s);
  assert.match(css, /\.partner-ribbon-track\s*\{(?=[^}]*min-width:\s*200%)(?=[^}]*display:\s*flex)(?=[^}]*width:\s*max-content)[^}]*\}/s);
  assert.match(css, /\.partner-ribbon-group\s*\{(?=[^}]*flex:\s*0\s+0\s+50%)(?=[^}]*min-width:\s*max-content)[^}]*\}/s);
  assert.match(css, /\.partner-ribbon-item\s*\{(?=[^}]*flex:\s*0\s+0)(?=[^}]*height:\s*63px)[^}]*\}/s);
  assert.doesNotMatch(css, /\.partner-ribbon-(?:logo|strip|strip-item|item--featured)/);
  assert.match(css, /\.partner-ribbon-track\s*\{[^}]*animation:\s*partner-ribbon-right\s+30s\s+linear\s+infinite/s);
  assert.match(css, /\.partner-ribbon-lane--reverse\s+\.partner-ribbon-track\s*\{[^}]*animation-name:\s*partner-ribbon-left/s);
  assert.match(css, /@keyframes partner-ribbon-left\s*\{[\s\S]*translate3d\(-50%,\s*0,\s*0\)/);
  assert.match(css, /@keyframes partner-ribbon-right\s*\{[\s\S]*from\s*\{[^}]*translate3d\(-50%,\s*0,\s*0\)[^}]*\}[\s\S]*to\s*\{[^}]*translate3d\(0,\s*0,\s*0\)/);
  assert.match(css, /\.partner-marquee\.is-paused\s+\.partner-ribbon-track\s*\{[^}]*animation-play-state:\s*paused/s);
  assert.match(css, /\.partner-marquee:hover\s+\.partner-ribbon-track\s*\{[^}]*animation-play-state:\s*paused/s);
  assert.match(css, /\.partner-marquee-toggle\s*\{[^}]*min-width:\s*44px[^}]*min-height:\s*44px/s);
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.partner-ribbon-track\s*\{[^}]*animation:\s*none\s*!important[^}]*transform:\s*none\s*!important/s,
  );
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.partner-ribbon-lane\s*\{[^}]*overflow-x:\s*auto/s,
  );
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.partner-ribbon-track\s*\{[^}]*min-width:\s*max-content/s,
  );
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.partner-ribbon-group\s*\{[^}]*flex:\s*none/s,
  );
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.partner-ribbon-group\[aria-hidden="true"\][^}]*\{[^}]*display:\s*none/s,
  );
  assert.doesNotMatch(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.partner-ribbon-lane\[aria-hidden="true"\]/s,
  );
  assert.doesNotMatch(
    css,
    /\.(?:partner-marquee|partner-ribbon-track|partner-ribbon-group|partner-ribbon-lane)[^{]*\{[^}]*width:\s*100vw/s,
  );
});
