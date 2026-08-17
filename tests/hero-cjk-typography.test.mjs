import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const cssUrl = new URL("../app/globals.css", import.meta.url);

function numericDeclaration(rule, property, unit = "") {
  const suffix = unit ? `\\s*${unit}` : "";
  const match = rule.match(
    new RegExp(`${property}\\s*:\\s*(-?(?:\\d+(?:\\.\\d+)?|\\.\\d+))${suffix}`),
  );

  assert.ok(match, `expected ${property}${unit ? ` in ${unit}` : ""}`);
  return Number(match[1]);
}

test("Chinese and English hero headings keep independent, readable typography", async () => {
  const css = await readFile(cssUrl, "utf8");
  const zhRule = css.match(/html\[lang="zh-CN"\]\s+h1\s*\{([^}]*)\}/)?.[1];
  const enRule = css.match(/html\[lang="en"\]\s+h1\s*\{([^}]*)\}/)?.[1];

  assert.ok(zhRule, 'expected an explicit html[lang="zh-CN"] h1 rule');
  assert.ok(enRule, 'expected the independent html[lang="en"] h1 rule to remain');

  assert.ok(
    numericDeclaration(zhRule, "line-height") >= 0.96,
    "Chinese hero line-height should be at least 0.96",
  );
  assert.ok(
    numericDeclaration(zhRule, "letter-spacing", "em") >= -0.05,
    "Chinese hero letter-spacing should not be tighter than -0.05em",
  );
  assert.ok(
    numericDeclaration(zhRule, "font-weight") <= 720,
    "Chinese hero font-weight should not exceed 720",
  );
  assert.match(zhRule, /font-family\s*:[^;]*["']?PingFang SC["']?/);
  assert.match(zhRule, /font-family\s*:[^;]*["']?Microsoft YaHei["']?/);

  assert.match(
    enRule,
    /(?:font-size|line-height|letter-spacing|font-weight)\s*:/,
    "English hero should retain its own typographic override",
  );
});
