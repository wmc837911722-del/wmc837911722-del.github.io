import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const narrativeSource = await read("app/case-narratives.ts");
const compiled = ts.transpileModule(narrativeSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { getCaseNarrative } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const detailedCases = ["interior-design-ai-platform", "enterprise-rag-mcp-assistant"];

test("the two expanded narratives have complete, matching bilingual sections", () => {
  for (const id of detailedCases) {
    const zh = getCaseNarrative("zh", id);
    const en = getCaseNarrative("en", id);
    assert.ok(zh);
    assert.ok(en);
    assert.deepEqual(Object.keys(zh), Object.keys(en));
    for (const narrative of [zh, en]) {
      assert.ok(narrative.problem.body.length > 50);
      assert.ok(narrative.problem.focus.length > 30);
      assert.equal(narrative.scope.items.length, 3);
      assert.equal(narrative.decisions.items.length, 3);
      assert.equal(narrative.evidence.deliverables.length, 3);
      assert.equal(narrative.evidence.available.length, 2);
      assert.ok(narrative.evidence.measurementNote);
      assert.ok(narrative.boundaries.body);
    }
  }

  for (const locale of ["zh", "en"]) {
    for (const id of ["ecommerce-research-agent", "mental-health-platform", "industrial-compliance-platform", "sre-copilot", "content-orchestration", "missing", "__proto__"]) {
      assert.equal(getCaseNarrative(locale, id), undefined, `${id} must retain its existing detail presentation`);
    }
  }
});

test("case narratives distinguish independent delivery, team contribution and evaluation limits", () => {
  const interiorZh = getCaseNarrative("zh", detailedCases[0]);
  const interiorEn = getCaseNarrative("en", detailedCases[0]);
  const ragZh = getCaseNarrative("zh", detailedCases[1]);
  const ragEn = getCaseNarrative("en", detailedCases[1]);

  assert.match(JSON.stringify(interiorZh.scope), /个人独立全栈交付/);
  assert.match(JSON.stringify(interiorEn.scope), /independent full-stack delivery/);
  assert.match(ragZh.scope.heading, /团队中的参与范围/);
  assert.match(ragEn.scope.heading, /contribution within the team/);
  assert.match(ragZh.evidence.measurementNote, /5,000.*LoRA 微调.*不是独立评测集/);
  assert.match(ragEn.evidence.measurementNote, /5,000.*LoRA fine-tuning, not an independent evaluation set/);
  assert.match(JSON.stringify(interiorZh.evidence.available), /匿名化实机截图/);
  assert.match(JSON.stringify(interiorEn.evidence.available), /anonymized live screenshot/);
  assert.match(JSON.stringify(ragZh.evidence.available), /概念视觉.*不是真实产品截图/);
  assert.match(JSON.stringify(ragEn.evidence.available), /concept visual.*not a real product screenshot/);
  assert.doesNotMatch(narrativeSource, /90\s?%|5\s?分钟|five minutes|5-minute/i);
});

test("expanded narratives are rendered in both published case pages with contextual contact links", async () => {
  for (const id of detailedCases) {
    const html = await read(`dist-github-pages/cases/${id}/index.html`);
    for (const sectionId of ["case-detail-problem", "case-detail-facts", "case-detail-decisions", "case-detail-role", "case-detail-evidence"]) {
      assert.match(html, new RegExp(`id="${sectionId}"`));
    }
    assert.match(html, /class="case-narrative-measurement"/);
    assert.match(html, /class="case-narrative-scope"/);
    const ctas = [...html.matchAll(/<a class="(?:nav-cta|primary-button)" href="([^"]+)"/g)];
    assert.equal(ctas.length, 2);
    assert.equal(ctas[0][1], ctas[1][1]);
    assert.ok(ctas[0][1].includes(id), "both case CTAs must preserve the project context");
    assert.ok(ctas[0][1].endsWith("#contact"));
    assert.doesNotMatch(html, /90\s?%|5\s?分钟|five minutes|5-minute/i);
  }
});

test("other published cases keep the standard details without invented narratives", async () => {
  const html = await read("dist-github-pages/cases/ecommerce-research-agent/index.html");
  assert.match(html, /id="case-detail-facts"/);
  assert.match(html, /id="case-detail-role"/);
  assert.doesNotMatch(html, /id="case-detail-problem"|id="case-detail-evidence"/);
});
