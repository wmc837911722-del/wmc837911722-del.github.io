import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

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

test("participation case is discoverable and uses safe external links", () => {
  assert.match(page, /<a href="#case-study">案例<\/a>/);
  assert.match(page, /id="case-study"/);
  assert.match(page, /<strong>项目参与者<\/strong>/);
  assert.match(page, /href="https:\/\/cs-wude\.github\.io\/"/);
  assert.match(
    page,
    /href="https:\/\/github\.com\/CS-wude\/CS-wude\.github\.io"/,
  );
  assert.match(page, /target="_blank"\s+rel="noopener noreferrer"/);
  assert.doesNotMatch(page, /独立完成|独立开发 WUDE|主导 WUDE/);
});

test("participation case layout prevents fixed-width overflow", () => {
  assert.match(css, /\.case-feature\s*\{[^}]*minmax\(0,1\.06fr\)[^}]*minmax\(0,\.94fr\)/s);
  assert.match(css, /\.case-info\s*\{[^}]*min-width:\s*0/s);
  assert.match(css, /\.case-preview-link\s*\{[^}]*overflow:\s*hidden/s);
  assert.doesNotMatch(css, /\.case-(?:feature|info|preview-link)[^{]*\{[^}]*width:\s*100vw/s);
});
