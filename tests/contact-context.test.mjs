import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function moduleUrl(name, dependencies = {}) {
  const source = await readFile(new URL(`../app/${name}.ts`, import.meta.url), "utf8");
  let output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  for (const [path, url] of Object.entries(dependencies)) {
    output = output.replaceAll(`from "${path}"`, `from "${url}"`);
  }
  return `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`;
}
const copyUrl = await moduleUrl("site-copy");
const seoUrl = await moduleUrl("seo", { "./site-copy": copyUrl });
const contextUrl = await moduleUrl("contact-context", { "./site-copy": copyUrl, "./seo": seoUrl });
const { contactPath, contactBrief, readContactContext, resolveContactContext, restoreInitialContactAnchor } = await import(contextUrl);
const { siteCopy } = await import(copyUrl);

test("initial contact fragment is restored after layout without overriding newer navigation or user scrolling", () => {
  const initialUrl = "https://wmc837911722-del.github.io/?case=enterprise-rag-mcp-assistant#contact";
  const calls = [];
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  globalThis.window = { location: { href: initialUrl, hash: "#contact" }, scrollY: 0 };
  globalThis.document = { getElementById: (id) => ({
    scrollIntoView: (options) => calls.push([id, "scroll", options]),
    focus: (options) => calls.push([id, "focus", options]),
  }) };
  try {
    restoreInitialContactAnchor(initialUrl);
    assert.deepEqual(calls, [
      ["contact", "scroll", { behavior: "instant", block: "start" }],
      ["contact-title", "focus", { preventScroll: true }],
    ]);
    calls.length = 0;
    window.scrollY = 282;
    restoreInitialContactAnchor(initialUrl);
    assert.equal(calls.length, 2, "partial native smooth scrolling must still reach contact");
    calls.length = 0;
    restoreInitialContactAnchor(initialUrl, true);
    window.scrollY = 0;
    window.location.href = "https://wmc837911722-del.github.io/#services";
    restoreInitialContactAnchor(initialUrl);
    window.location.href = initialUrl;
    window.location.hash = "";
    restoreInitialContactAnchor(initialUrl);
    assert.deepEqual(calls, []);
  } finally {
    if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
    if (oldDocument === undefined) delete globalThis.document; else globalThis.document = oldDocument;
  }
});

test("each case and service produces a valid, localized contact URL and brief", () => {
  for (const locale of ["zh", "en"]) {
    const copy = siteCopy[locale];
    for (const [kind, items] of [["case", copy.caseStudy.projects], ["service", copy.services]]) {
      for (const item of items) {
        const context = { kind, id: item.id };
        const url = new URL(contactPath(locale, context), "https://wmc837911722-del.github.io");
        assert.equal(url.pathname, locale === "zh" ? "/" : "/en/");
        assert.equal(url.hash, "#contact");
        assert.deepEqual(readContactContext(url.search), context);
        const source = resolveContactContext(locale, context);
        const brief = contactBrief(locale, context);
        assert.ok(brief.includes(item.title));
        assert.ok(brief.includes(source.url));
        assert.ok(brief.endsWith(copy.contact.mailTemplate));
        const mail = new URL(`mailto:837911722@qq.com?subject=${encodeURIComponent(copy.contact.mailSubject)}&body=${encodeURIComponent(brief)}`);
        assert.equal(mail.searchParams.get("body"), brief);
        if (kind === "case") assert.equal(source.url, `https://wmc837911722-del.github.io/cases/${item.id}/`);
      }
    }
  }
});

test("unknown, malicious and ambiguous context safely fall back to a generic enquiry", () => {
  for (const search of ["", "?case=unknown", "?service=unknown", "?case=javascript:alert(1)", "?case=interior-design-ai-platform&case=ecommerce-research-agent", "?case=interior-design-ai-platform&service=delivery", "?case=%3Cscript%3E"]) {
    assert.equal(readContactContext(search), null);
  }
  assert.deepEqual(readContactContext("?service=delivery&unrelated=hello"), { kind: "service", id: "delivery" });
  for (const locale of ["zh", "en"]) {
    assert.equal(contactBrief(locale, null), siteCopy[locale].contact.mailTemplate);
    assert.equal(contactBrief(locale, { kind: "case", id: "unknown" }), siteCopy[locale].contact.mailTemplate);
    assert.equal(contactPath(locale, null), `${locale === "zh" ? "/" : "/en/"}#contact`);
  }
});

test("brief starts with the scenario, pain and desired change; logistics are optional", () => {
  const zh = siteCopy.zh.contact.mailTemplate;
  assert.match(zh, /业务场景与使用者：\n当前问题：\n希望改善的结果：/);
  for (const field of ["已有数据或系统", "计划时间", "预算范围"]) assert.ok(zh.includes(`${field}（可选）`));
  const en = siteCopy.en.contact.mailTemplate;
  assert.match(en, /Business context and users:\nCurrent problem:\nDesired improvement:/);
  for (const field of ["Existing data or systems", "Target timeline", "Budget range"]) assert.ok(en.includes(`${field} (optional)`));
});

test("homepage renders early selected work, native compact guide, and contact source controls", async () => {
  for (const path of ["index.html", "en/index.html"]) {
    const html = await readFile(new URL(`../dist-github-pages/${path}`, import.meta.url), "utf8");
    assert.ok(html.indexOf('id="featured-work"') < html.indexOf('id="services"'));
    assert.equal((html.match(/class="featured-work-card"/g) ?? []).length, 3);
    assert.match(html, /href="#featured-work"/);
    assert.match(html, /<details class="fde-learning-details">/);
    assert.doesNotMatch(html, /<details class="fde-learning-details"[^>]*\bopen/);
    assert.match(html, /<details class="contact-brief-preview">/);
  }
  const source = await readFile(new URL("../app/home.tsx", import.meta.url), "utf8");
  assert.match(source, /addEventListener\("popstate", synchronizeContact\)/);
  assert.match(source, /window\.location\.search/);
  assert.match(source, /copy\.contact\.clearContext/);
  assert.match(source, /contactBrief\(locale, contactContext\)/);
  assert.match(source, /fde-learning-details" onToggle=\{refreshScrollLayout\}/);
  assert.match(source, /contact-brief-preview" onToggle=\{refreshScrollLayout\}/);
  assert.match(source, /ScrollTrigger\.refresh\(true\)/);
  assert.match(source, /ScrollTrigger\.addEventListener\("refresh", scheduleContactLanding\)/);
  assert.match(source, /window\.addEventListener\("load", scheduleContactLanding\)/);
  assert.match(source, /window\.addEventListener\("pageshow", scheduleContactLanding\)/);
  assert.match(source, /ScrollTrigger\.removeEventListener\("refresh", scheduleContactLanding\)/);
  assert.match(source, /if \(attempt !== copyAttemptRef\.current\) return/);
});
