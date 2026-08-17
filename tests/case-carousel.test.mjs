import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, projectRoot), "utf8");

const projectIds = [
  "mental-health-platform",
  "industrial-compliance-platform",
  "sre-copilot",
  "content-orchestration",
];

const caseSection = (html) => {
  const start = html.indexOf('id="case-study"');
  const end = html.indexOf('id="process"', start);

  assert.notEqual(start, -1, "expected the rendered case-study section");
  assert.notEqual(end, -1, "expected the process section after the cases");
  return html.slice(start, end);
};

test("case carousel exposes operable previous and next controls", async () => {
  const page = await read("app/page.tsx");
  const buttonTag = (modifier) =>
    page.match(
      new RegExp(
        `<button\\b(?=[^>]*className="[^"]*${modifier}[^"]*")[^>]*>`,
      ),
    )?.[0];

  assert.match(page, /className="[^"]*\bcase-carousel\b[^"]*"/);
  assert.match(page, /id="case-carousel-track"/);
  const previous = buttonTag("case-carousel-prev");
  const next = buttonTag("case-carousel-next");
  assert.ok(previous, "expected a previous-case button");
  assert.ok(next, "expected a next-case button");
  for (const button of [previous, next]) {
    assert.match(button, /className="[^"]*case-carousel-button[^"]*"/);
    assert.match(button, /type="button"/);
    assert.match(button, /aria-controls="case-carousel-track"/);
    assert.match(button, /aria-label=/);
  }
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /role="status"/);
});

test("case carousel supports keyboard navigation instead of requiring a pointer", async () => {
  const page = await read("app/page.tsx");

  assert.match(page, /onKeyDown=\{handleCaseCarouselKeyDown\}/);
  for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) {
    assert.match(page, new RegExp(`["']${key}["']`));
  }
  assert.match(page, /event\.preventDefault\(\)/);
});

test("every project has a visible purpose label and an informative local image", async () => {
  const [page, copy] = await Promise.all([
    read("app/page.tsx"),
    read("app/site-copy.ts"),
  ]);

  assert.match(page, /className="system-case-purpose"/);
  assert.match(page, /\{project\.purpose\}/);
  assert.match(page, /className="system-case-image"/);
  assert.match(page, /src=\{project\.imageSrc\}/);
  assert.match(page, /alt=\{project\.imageAlt\}/);

  const purposes = [...copy.matchAll(/purpose:\s*"([^"]+)"/g)].map(
    ([, value]) => value.trim(),
  );
  assert.ok(purposes.length >= 8, "expected one purpose label per case and locale");
  assert.ok(purposes.every(Boolean), "purpose labels must not be empty");

  const imageAlts = [...copy.matchAll(/imageAlt:\s*"([^"]+)"/g)].map(
    ([, value]) => value.trim(),
  );
  assert.ok(imageAlts.length >= 8, "expected localized alt text for every case");
  assert.ok(imageAlts.every(Boolean), "case image alt text must be informative");

  const imageSources = [...copy.matchAll(/imageSrc:\s*"([^"]+)"/g)].map(
    ([, value]) => value,
  );
  const uniqueSources = [...new Set(imageSources)];
  assert.equal(uniqueSources.length, projectIds.length);

  for (const source of uniqueSources) {
    assert.match(source, /^\/cases\/[a-z0-9-]+\.(?:avif|jpe?g|png|webp)$/i);
    assert.doesNotMatch(source, /^(?:https?:)?\/\//i);

    const asset = await stat(new URL(`public${source}`, projectRoot));
    assert.ok(asset.isFile(), `${source} should resolve to a local file`);
    assert.ok(
      asset.size >= 8_000,
      `${source} should be a real project visual, not a tiny placeholder`,
    );
  }
});

test("rendered carousel retains all four cases and never sources case media externally", async () => {
  const html = caseSection(await read("dist-github-pages/index.html"));

  assert.match(html, /aria-roledescription="carousel"/);
  assert.equal((html.match(/aria-roledescription="slide"/g) ?? []).length, 4);
  assert.equal(
    (html.match(/class="[^"]*\bsystem-case-purpose\b[^"]*"/g) ?? []).length,
    4,
  );
  assert.equal(
    (html.match(/class="system-case-image"/g) ?? []).length,
    4,
  );

  for (const id of projectIds) {
    assert.match(html, new RegExp(`data-case-id="${id}"`));
  }

  assert.doesNotMatch(html, /\b(?:href|src)="https?:\/\//i);
  assert.doesNotMatch(html, /cs-wude\.github\.io|github\.com\/CS-wude/i);
});

test("carousel layout contains its images and controls at desktop and mobile widths", async () => {
  const css = await read("app/globals.css");

  assert.match(css, /\.case-carousel\s*\{[^}]*min-width:\s*0/s);
  assert.match(css, /\.case-carousel-viewport\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.case-carousel-track\s*\{[^}]*min-width:\s*0/s);
  assert.match(css, /\.system-case-image\s*\{[^}]*width:\s*100%[^}]*height:\s*100%[^}]*object-fit:\s*contain/s);
  assert.match(
    css,
    /\.case-carousel-button\s*\{[^}]*min-width:\s*44px[^}]*min-height:\s*44px/s,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*\d+px\)[\s\S]*?\.system-case\s*\{[^}]*grid-template-columns:\s*1fr/s,
  );
  assert.doesNotMatch(
    css,
    /\.(?:case-carousel|case-carousel-viewport|case-carousel-track|system-case)[^{]*\{[^}]*width:\s*100vw/s,
  );
});
