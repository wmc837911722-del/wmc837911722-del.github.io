import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, projectRoot), "utf8");

function contactSection(page) {
  const start = page.indexOf('<section className="contact" id="contact">');
  const end = page.indexOf("</section>", start);

  assert.notEqual(start, -1, "expected the contact section");
  assert.notEqual(end, -1, "expected the contact section to close");
  return page.slice(start, end);
}

test("contact copy includes a useful WeChat QR invitation in both languages", async () => {
  const copy = await read("app/site-copy.ts");

  for (const key of ["wechatLabel", "wechatTitle", "wechatNote", "wechatImageAlt"]) {
    assert.equal(
      (copy.match(new RegExp(`${key}:`, "g")) ?? []).length,
      2,
      `expected ${key} in both locale dictionaries`,
    );
  }

  assert.match(copy, /wechatLabel:\s*"[^"]*微信[^"]*"/);
  assert.match(copy, /wechatTitle:\s*"微信扫码联系"/);
  assert.match(copy, /wechatNote:\s*"[^"]*(?:微信|扫码)[^"]*"/);
  assert.match(copy, /wechatImageAlt:\s*"[^"]*风雨[^"]*微信二维码[^"]*"/);

  assert.match(copy, /wechatLabel:\s*"[^"]*WECHAT[^"]*"/i);
  assert.match(copy, /wechatTitle:\s*"[^"]*WeChat[^"]*"/i);
  assert.match(copy, /wechatNote:\s*"[^"]*(?:scan|WeChat)[^"]*"/i);
  assert.match(
    copy,
    /wechatImageAlt:\s*"[^"]*WeChat QR code[^"]*Fengyu[^"]*"/i,
  );
});

test("contact section renders one self-hosted, accessible and lazy WeChat QR image while retaining both emails", async () => {
  const page = await read("app/home.tsx");
  const contact = contactSection(page);
  const imageTag = contact.match(
    /<img\b(?=[^>]*className="contact-wechat-qr")[^>]*>/s,
  )?.[0];

  assert.ok(imageTag, "expected a WeChat QR image in the contact section");
  assert.match(imageTag, /src="(\/contact\/[a-z0-9-]+\.(?:avif|jpe?g|png|webp))"/i);
  assert.match(imageTag, /alt=\{copy\.contact\.wechatImageAlt\}/);
  assert.match(imageTag, /loading="lazy"/);
  assert.match(imageTag, /decoding="async"/);

  const width = Number(imageTag.match(/width=\{(\d+)\}/)?.[1]);
  const height = Number(imageTag.match(/height=\{(\d+)\}/)?.[1]);
  assert.ok(width >= 256, "QR intrinsic width should be explicitly declared");
  assert.ok(height >= 256, "QR intrinsic height should be explicitly declared");
  assert.equal(width, 888, "the image should preserve the supplied intrinsic width");
  assert.equal(height, 1131, "the image should preserve the supplied intrinsic height");

  const source = imageTag.match(/src="([^"]+)"/)?.[1];
  assert.ok(source, "expected a literal local QR source");
  assert.match(source, /^\/contact\//);
  assert.doesNotMatch(source, /^(?:https?:)?\/\//i);
  const asset = await stat(new URL(`public${source}`, projectRoot));
  assert.ok(asset.isFile(), `${source} should resolve to a self-hosted image`);

  assert.match(page, /address:\s*"837911722@qq\.com"/);
  assert.match(page, /address:\s*"wmc837911722@gmail\.com"/);
  assert.match(contact, /contactEmails\.map/);
  assert.doesNotMatch(contact, /<img\b[^>]*src=(?:"|\{["'])(?:https?:)?\/\//i);
});

test("WeChat QR layout remains recognizable without overflowing desktop or mobile contact layouts", async () => {
  const css = await read("app/globals.css");
  const wrapperRule = css.match(/\.contact-wechat\s*\{([^}]*)\}/)?.[1];
  const imageRule = css.match(/\.contact-wechat-qr\s*\{([^}]*)\}/)?.[1];

  assert.ok(wrapperRule, "expected a contact-wechat layout rule");
  assert.match(wrapperRule, /min-width:\s*0/);
  assert.match(wrapperRule, /max-width:\s*100%/);

  assert.ok(imageRule, "expected a contact-wechat-qr image rule");
  assert.match(
    imageRule,
    /width:\s*clamp\(\s*(?:1[6-9]\d|2\d\d)px\s*,[^,]+,\s*\d+px\s*\)/,
    "the QR should retain at least a 160px recognizable target size",
  );
  assert.match(imageRule, /max-width:\s*100%/);
  assert.match(imageRule, /height:\s*auto/);

  assert.match(
    css,
    /@media\s*\(max-width:\s*\d+px\)[\s\S]*?\.contact-bottom\s*\{[^}]*grid-template-columns:\s*1fr/s,
  );
  assert.doesNotMatch(
    css,
    /\.(?:contact-wechat|contact-wechat-qr)[^{]*\{[^}]*width:\s*100vw/s,
  );
});
