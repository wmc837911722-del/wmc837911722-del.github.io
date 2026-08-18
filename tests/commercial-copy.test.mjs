import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const sourceUrl = new URL("../app/site-copy.ts", import.meta.url);
const lynkvisLogoUrl = new URL("../public/brands/lynkvis-ai-logo.png", import.meta.url);

async function loadSiteCopy() {
  const source = await readFile(sourceUrl, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`;
  return (await import(moduleUrl)).siteCopy;
}

function assertUsefulText(value, label) {
  assert.equal(typeof value, "string", `${label} should be text`);
  assert.ok(value.trim().length >= 2, `${label} should not be empty`);
}

function commercialClaims(copy) {
  return [
    copy.seo.description,
    copy.hero.intro,
    ...copy.services.map(({ description }) => description),
    copy.capabilitiesSection.intro,
    ...copy.capabilities.map(({ description }) => description),
    ...copy.partners.title,
    copy.partners.intro,
    ...copy.partners.tiles.flatMap(({ name, note }) => [name, note]),
    ...copy.caseStudy.title,
    copy.caseStudy.intro,
    copy.caseStudy.disclosure,
    ...copy.caseStudy.projects.flatMap(({ summary, roleNote }) => [summary, roleNote]),
    ...copy.process.title,
    ...copy.process.steps.map(({ description }) => description),
    copy.about.quote,
    copy.about.body,
    copy.contact.titleStart,
    copy.contact.titleEnd,
    copy.contact.body,
  ].join("\n");
}

test("Chinese case-study heading does not hard-code the project count", async () => {
  const { zh } = await loadSiteCopy();

  assert.doesNotMatch(zh.caseStudy.title.join(""), /四个/);
});

test("English case-study heading does not hard-code the project count", async () => {
  const { en } = await loadSiteCopy();

  assert.doesNotMatch(en.caseStudy.title.join(" "), /\bfour\b/i);
});

test("every commercial section has useful bilingual copy and a clear next action", async () => {
  const siteCopy = await loadSiteCopy();

  for (const locale of ["zh", "en"]) {
    const copy = siteCopy[locale];
    const sectionCopy = {
      services: [copy.servicesSection.title.join(" "), ...copy.services.map(({ description }) => description)],
      capabilities: [copy.capabilitiesSection.title.join(" "), copy.capabilitiesSection.intro],
      partners: [copy.partners.title.join(" "), copy.partners.intro],
      cases: [copy.caseStudy.title.join(" "), copy.caseStudy.intro],
      process: [copy.process.title.join(" "), ...copy.process.steps.map(({ description }) => description)],
      about: [copy.about.quote, copy.about.body],
      contact: [`${copy.contact.titleStart} ${copy.contact.titleEnd}`, copy.contact.body],
    };

    for (const [section, values] of Object.entries(sectionCopy)) {
      assert.ok(values.length > 0, `${locale}.${section} should contain commercial copy`);
      values.forEach((value, index) =>
        assertUsefulText(value, `${locale}.${section}[${index}]`),
      );
    }

    const nextActions = {
      header: copy.header.contact,
      hero: copy.hero.cta,
      services: copy.serviceAria,
      partners: copy.partners.tiles.find(({ kind }) => kind === "cta")?.name,
      cases: copy.caseStudy.discuss,
      contact: copy.contact.copyIdle,
    };

    for (const [section, action] of Object.entries(nextActions)) {
      assertUsefulText(action, `${locale}.${section} CTA`);
    }
  }
});

test("commercial copy does not invent quantified outcomes or undisclosed clients", async () => {
  const siteCopy = await loadSiteCopy();
  const quantifiedOutcome = /\d+(?:\.\d+)?\s*(?:%|％|x\b|×|倍|万|亿|million\b|billion\b)/i;
  const unverifiedClientClaim = /服务过|合作客户|客户包括|知名客户|头部客户|世界\s*500\s*强|\bserved\b|\btrusted by\b|\bclients include\b|\bleading clients\b|\bfortune\s*500\b/i;

  for (const locale of ["zh", "en"]) {
    const copy = siteCopy[locale];
    const claims = commercialClaims(copy);

    assert.doesNotMatch(claims, quantifiedOutcome);
    assert.doesNotMatch(claims, unverifiedClientClaim);
    for (const project of copy.caseStudy.projects) {
      assert.equal("client" in project, false, `${locale}.${project.id} should not name a client`);
      assert.equal("customer" in project, false, `${locale}.${project.id} should not name a customer`);
    }
  }

  assert.deepEqual(
    siteCopy.zh.partners.tiles.filter(({ kind }) => kind === "brand").map(({ id }) => id),
    ["funeng-rare-earth", "chenghui-tech", "lynkvis-ai"],
  );
  assert.deepEqual(
    siteCopy.en.partners.tiles.filter(({ kind }) => kind === "brand").map(({ id }) => id),
    ["funeng-rare-earth", "chenghui-tech", "lynkvis-ai"],
  );
  const placeholderIds = [
    "private-slot-01",
    "private-slot-02",
    "private-slot-03",
    "private-slot-04",
    "private-slot-05",
  ];
  for (const locale of ["zh", "en"]) {
    const placeholders = siteCopy[locale].partners.tiles.filter(
      ({ kind }) => kind === "placeholder",
    );

    assert.deepEqual(placeholders.map(({ id }) => id), placeholderIds);
    for (const placeholder of placeholders) {
      assert.equal("logoSrc" in placeholder, false, `${locale}.${placeholder.id} must not imitate a real logo`);
      assert.match(
        placeholder.name,
        locale === "zh" ? /纯视觉占位.*非客户.*合作背书/ : /visual only.*no client.*partner endorsement/i,
      );
      assert.match(placeholder.note, locale === "zh" ? /视觉占位/ : /visual placeholder/i);
      assert.match(
        placeholder.note,
        locale === "zh"
          ? /不对应.*客户.*合作.*公开品牌.*不构成.*品牌背书/
          : /does not identify a client, collaboration or public brand.*not an endorsement/i,
      );
    }
  }
  assert.doesNotMatch(
    JSON.stringify(siteCopy),
    /\bwude\b|WUDE 项目团队|WUDE project team/i,
  );
  assert.match(siteCopy.zh.partners.intro, /获得(?:公开)?(?:授权|许可)/);
  assert.match(siteCopy.zh.partners.intro, /纯视觉占位/);
  assert.match(siteCopy.zh.partners.intro, /不对应.*客户.*合作.*公开品牌.*不构成.*品牌背书/);
  assert.match(siteCopy.zh.partners.aria, /视觉占位.*不代表客户、合作或品牌背书/);
  assert.match(siteCopy.zh.partners.intro, /并未完整展示.*因保密约定/);
  assert.match(
    siteCopy.en.partners.intro,
    /explicit permission|approved (?:for disclosure|information)|only with permission/i,
  );
  assert.match(siteCopy.en.partners.intro, /visual placeholders/i);
  assert.match(
    siteCopy.en.partners.intro,
    /does not identify.*client, collaboration or public brand.*not an endorsement/i,
  );
  assert.match(siteCopy.en.partners.aria, /visual placeholders.*not client, collaboration or brand endorsements/i);
  assert.match(siteCopy.en.partners.intro, /not a complete record.*confidentiality agreements/i);
  for (const companyName of [
    "宁波复能稀土新材料股份有限公司",
    "温州橙绘科技有限公司",
    "Lynkvis AI",
  ]) {
    assert.match(siteCopy.zh.partners.tiles.map(({ name }) => name).join("\n"), new RegExp(companyName));
    assert.match(siteCopy.en.partners.tiles.map(({ name }) => name).join("\n"), new RegExp(companyName));
  }
  const lynkvisTile = siteCopy.zh.partners.tiles.find(({ id }) => id === "lynkvis-ai");
  assert.equal(lynkvisTile?.logoSrc, "/brands/lynkvis-ai-logo.png");
  assert.match(lynkvisTile?.logoAlt ?? "", /Lynkvis AI/);
  const logo = await readFile(lynkvisLogoUrl);
  assert.deepEqual(
    [...logo.subarray(0, 8)],
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  );
});

test("WeChat copy identifies the profile field without turning it into an address", async () => {
  const siteCopy = await loadSiteCopy();

  assert.match(siteCopy.zh.contact.wechatNote, /^微信资料所在地：瑞典 西曼兰。/);
  assert.match(siteCopy.en.contact.wechatNote, /^WeChat profile location: Västmanland, Sweden\./);
  for (const locale of ["zh", "en"]) {
    assert.doesNotMatch(
      siteCopy[locale].contact.wechatNote,
      /办公地址|现居|当前所在地|服务区域|office address|current location|service area/i,
    );
  }
});
