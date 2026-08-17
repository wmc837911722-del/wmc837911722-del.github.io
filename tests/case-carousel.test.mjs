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

test("case carousel wraps through short direction-aware stacked transitions", async () => {
  const [page, css] = await Promise.all([
    read("app/page.tsx"),
    read("app/globals.css"),
  ]);
  const carouselTag = page.match(
    /<div\b[^>]*className="[^"]*\bcase-carousel\b[^"]*"[^>]*>/s,
  )?.[0];
  const trackTag = page.match(
    /<div\b[^>]*className="case-carousel-track"[^>]*>/s,
  )?.[0];
  const trackRule = css.match(/\.case-carousel-track\s*\{([^}]*)\}/)?.[1];
  const slideRule = css.match(/\.system-case\s*\{([^}]*)\}/)?.[1];
  const stateRules = [...css.matchAll(
    /([^{}]*\.system-case\[data-state="(?:active|exiting|inactive)"\][^{}]*)\{([^{}]*)\}/g,
  )].map(([, selector, body]) => ({ selector, body }));

  assert.ok(carouselTag, "expected a carousel root element");
  assert.match(carouselTag, /data-direction=\{/);
  assert.ok(trackTag, "expected a carousel track element");
  assert.doesNotMatch(
    trackTag,
    /style=\{\{[^}]*transform/,
    "the track must not translate across every intervening slide",
  );
  assert.doesNotMatch(page, /activeCaseIndex\s*\*\s*100/);
  assert.match(page, /data-state=\{/);
  for (const state of ["active", "exiting", "inactive"]) {
    assert.match(page, new RegExp(`["']${state}["']`));
  }
  for (const state of ["active", "exiting"]) {
    assert.ok(
      stateRules.some(({ selector }) =>
        selector.includes(`.system-case[data-state="${state}"]`),
      ),
      `expected a CSS state for ${state} slides`,
    );
  }
  for (const direction of ["next", "previous"]) {
    assert.match(page, new RegExp(`["']${direction}["']`));
    assert.ok(
      stateRules.some(({ selector }) =>
        selector.includes(`[data-direction="${direction}"]`),
      ),
      `expected ${direction} direction-specific slide motion`,
    );
  }

  assert.ok(trackRule, "expected a carousel track rule");
  assert.match(trackRule, /display:\s*grid/);
  assert.doesNotMatch(trackRule, /\btransform\s*:/);
  assert.doesNotMatch(trackRule, /transition[^;]*transform/);

  assert.ok(slideRule, "expected a system-case rule");
  assert.match(slideRule, /grid-area:\s*1\s*\/\s*1/);
  const transition = slideRule.match(/transition(?:-property)?\s*:\s*([^;]+)/)?.[1];
  assert.ok(transition, "stacked slides should transition between states");
  assert.match(transition, /opacity/);
  assert.match(transition, /transform/);
  assert.doesNotMatch(
    transition,
    /\b(?:left|right|top|bottom|width|height|margin|padding)\b/,
    "slide motion should animate only compositor-friendly properties",
  );

  const directionalTransforms = stateRules
    .filter(({ selector }) => selector.includes("[data-direction="))
    .flatMap(({ body }) =>
      [...body.matchAll(/\btransform\s*:\s*([^;]+)/g)].map(([, value]) => value),
    );
  assert.ok(
    directionalTransforms.length >= 2,
    "expected short transforms for both carousel directions",
  );
  for (const transform of directionalTransforms) {
    assert.match(transform, /translate(?:3d|X)\(/);
    assert.doesNotMatch(
      transform,
      /%|\b(?:vw|vh)\b|calc\(/,
      "wrap transitions must use a fixed short distance, never a slide-width offset",
    );
    const pixelDistances = [...transform.matchAll(/(-?\d+(?:\.\d+)?)px/g)].map(
      ([, value]) => Math.abs(Number(value)),
    );
    assert.ok(pixelDistances.length, "directional transforms should declare a pixel distance");
    assert.ok(
      pixelDistances.every((distance) => distance <= 48),
      "carousel motion should stay within a subtle 48px travel distance",
    );
  }
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
  assert.equal((html.match(/data-state=/g) ?? []).length, 4);
  assert.equal((html.match(/data-state="active"/g) ?? []).length, 1);
  assert.equal((html.match(/data-state="inactive"/g) ?? []).length, 3);
  assert.match(
    html,
    /class="[^"]*\bcase-carousel\b[^"]*"[^>]*data-direction="next"/,
  );
  assert.doesNotMatch(
    html,
    /class="case-carousel-track"[^>]*style="[^"]*transform/i,
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
