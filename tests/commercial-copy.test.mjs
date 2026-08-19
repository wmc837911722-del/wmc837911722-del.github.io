import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const sourceUrl = new URL("../app/site-copy.ts", import.meta.url);

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
    copy.partners.aria,
    ...copy.partners.rows.flatMap(({ label, items }) => [
      label,
      ...items.flatMap(({ eyebrow, mark, name, note }) => [eyebrow, mark, name, note]),
    ]),
    ...copy.partners.tiles.flatMap(({ name, note }) => [name, note]),
    ...copy.caseStudy.title,
    copy.caseStudy.intro,
    copy.caseStudy.disclosure,
    ...copy.caseStudy.projects.flatMap(({ summary, roleNote }) => [summary, roleNote]),
    ...copy.process.title,
    ...copy.process.steps.map(({ description }) => description),
    copy.about.quote,
    copy.about.body,
    ...copy.fdeLearning.title,
    copy.fdeLearning.intro,
    copy.fdeLearning.audience,
    ...copy.fdeLearning.facts.flatMap(({ label, value }) => [label, value]),
    copy.fdeLearning.pathLabel,
    ...copy.fdeLearning.stages.flatMap(({ title, description }) => [title, description]),
    copy.fdeLearning.capstoneTitle,
    copy.fdeLearning.capstoneBody,
    copy.fdeLearning.proof,
    copy.fdeLearning.disclaimer,
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
      fdeLearning: [
        copy.fdeLearning.title.join(" "),
        copy.fdeLearning.intro,
        copy.fdeLearning.audience,
        ...copy.fdeLearning.stages.map(({ description }) => description),
        copy.fdeLearning.capstoneBody,
        copy.fdeLearning.proof,
        copy.fdeLearning.disclaimer,
      ],
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
      fdeLearning: copy.fdeLearning.primaryCta,
      fdeLearningRepository: copy.fdeLearning.repositoryCta,
      contact: copy.contact.copyIdle,
    };

    for (const [section, action] of Object.entries(nextActions)) {
      assertUsefulText(action, `${locale}.${section} CTA`);
    }
  }
});

test("FDE learning guide publishes aligned bilingual stages, facts, boundaries and actions", async () => {
  const siteCopy = await loadSiteCopy();
  const expectedFacts = {
    zh: [
      ["duration", "20–28 周", "标准学习路线"],
      ["capabilities", "6 维", "FDE 能力矩阵"],
      ["projects", "3 个", "递进式实战项目"],
    ],
    en: [
      ["duration", "20–28 WEEKS", "STANDARD LEARNING PATH"],
      ["capabilities", "6 DIMENSIONS", "FDE CAPABILITY MATRIX"],
      ["projects", "3 PROJECTS", "PROGRESSIVE PRACTICE"],
    ],
  };
  const expectedStageIds = [
    "role",
    "gap",
    "discovery",
    "engineering",
    "production",
    "evidence",
  ];

  for (const locale of ["zh", "en"]) {
    const guide = siteCopy[locale].fdeLearning;
    const textFields = [
      guide.label,
      guide.labelLocal,
      guide.resourceName,
      guide.kicker,
      ...guide.title,
      guide.intro,
      guide.audienceLabel,
      guide.audience,
      guide.pathLabel,
      guide.capstoneLabel,
      guide.capstoneTitle,
      guide.capstoneBody,
      guide.proofLabel,
      guide.proof,
      guide.disclaimer,
      guide.primaryCta,
      guide.repositoryCta,
      guide.newWindow,
    ];

    textFields.forEach((value, index) =>
      assertUsefulText(value, `${locale}.fdeLearning text[${index}]`),
    );
    assert.deepEqual(
      guide.facts.map(({ id, value, label }) => [id, value, label]),
      expectedFacts[locale],
      `${locale} should publish the verified duration, capability and project facts`,
    );
    assert.deepEqual(
      guide.stages.map(({ id }) => id),
      expectedStageIds,
      `${locale} should preserve the six-stage learning sequence`,
    );
    assert.deepEqual(
      guide.stages.map(({ number }) => number),
      ["01", "02", "03", "04", "05", "06"],
      `${locale} should number every learning stage`,
    );
    for (const [index, stage] of guide.stages.entries()) {
      assertUsefulText(stage.title, `${locale}.fdeLearning.stages[${index}].title`);
      assertUsefulText(stage.description, `${locale}.fdeLearning.stages[${index}].description`);
    }
  }

  assert.deepEqual(
    siteCopy.zh.fdeLearning.stages.map(({ id }) => id),
    siteCopy.en.fdeLearning.stages.map(({ id }) => id),
    "localized guides should describe the same learning path",
  );
  assert.match(siteCopy.zh.fdeLearning.intro, /已有编程基础、零 FDE 经验/);
  assert.match(siteCopy.en.fdeLearning.intro, /Chinese-language guide.*programming fundamentals.*no prior FDE experience/i);
  assert.match(siteCopy.zh.fdeLearning.capstoneTitle, /企业 RAG \+ MCP 助手/);
  assert.match(siteCopy.en.fdeLearning.capstoneTitle, /Enterprise RAG \+ MCP Assistant/);
  assert.match(siteCopy.zh.fdeLearning.disclaimer, /不是就业保证.*目标公司的最新职位描述/);
  assert.match(siteCopy.en.fdeLearning.disclaimer, /not an employment guarantee.*latest requirements.*target role/i);
  assert.match(siteCopy.zh.fdeLearning.primaryCta, /学习路线/);
  assert.match(siteCopy.zh.fdeLearning.repositoryCta, /仓库.*模板/);
  assert.match(siteCopy.en.fdeLearning.primaryCta, /Chinese guide/i);
  assert.match(siteCopy.en.fdeLearning.repositoryCta, /repository.*templates/i);
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

  const formerPartnerIdentifiers = /宁波复能稀土新材料股份有限公司|温州橙绘科技有限公司|复能稀土|橙绘科技|Lynkvis AI|中检鉴定|belling|海丽达教育|广东交通集团|万科|南京大牌档|美心西饼|安宏基|石湾牌|MPE BEDDING|物银中国|ToyCity|中国工商银行|柏瑞康|顺丰速运|橙益用车|金蝶精斗云|绘王|澳康达|健康洪梅|哈文教育|杰科|美心|金地地产|周大福|华润置地|富印集团|北京大学临床研究所|博雅生命|有黔辣|Vanke|Nanjing Impressions|Maxim['’]s Cakes|AHOKE|SHI WAN PAI|monobank|ICBC|PROCARE|SF Express|Kingdee Jingdouyun|HUION|Gemdale|Chow Tai Fook|CR Land|Fuyin Group|PUCRI|Boyalife/i;

  for (const locale of ["zh", "en"]) {
    const { partners } = siteCopy[locale];
    const rowItems = partners.rows.flatMap(({ items }) => items);
    const partnerText = JSON.stringify(partners);

    assert.equal(partners.rows.length, 3, `${locale} should have three anonymized rows`);
    assert.deepEqual(
      partners.rows.map(({ items }) => items.length),
      [8, 8, 8],
      `${locale} should have eight items in every anonymized row`,
    );
    assert.equal(
      new Set(rowItems.map(({ id }) => id)).size,
      24,
      `${locale} anonymized item ids should be unique`,
    );
    assert.equal("ribbons" in partners, false, `${locale} should not expose image ribbons`);
    assert.equal(
      partners.tiles.some(({ kind }) => kind === "brand"),
      false,
      `${locale} should not contain brand tiles`,
    );
    for (const item of [...rowItems, ...partners.tiles]) {
      assert.notEqual(item.kind, "brand", `${locale}.${item.id} should not be a brand`);
      assert.equal("logoSrc" in item, false, `${locale}.${item.id} should not load a logo`);
      assert.equal("logoAlt" in item, false, `${locale}.${item.id} should not describe a logo`);
    }
    assert.doesNotMatch(partnerText, /partner-ribbons|lynkvis-ai-logo/i);
    assert.doesNotMatch(partnerText, formerPartnerIdentifiers);
    assert.doesNotMatch(
      partnerText,
      /确认并授权公开|获准公开展示|personally confirmed|approved for public display/i,
    );
  }

  assert.doesNotMatch(
    JSON.stringify(siteCopy),
    /\bwude\b|WUDE 项目团队|WUDE project team|星洋智慧|starocean(?:wisdom)?|visual placeholder|纯视觉占位/i,
  );
  assert.match(siteCopy.zh.partners.intro, /未经相关权利方(?:事先)?书面许可/);
  assert.match(siteCopy.zh.partners.intro, /不指向或暗示任何特定企业/);
  assert.match(siteCopy.zh.partners.intro, /不代表任何企业.*推荐或背书/);
  assert.match(siteCopy.zh.partners.aria, /不指向特定企业.*品牌背书/);
  assert.match(siteCopy.en.partners.intro, /prior written permission/i);
  assert.match(siteCopy.en.partners.intro, /does not identify or imply any specific organization/i);
  assert.match(siteCopy.en.partners.intro, /does not represent any organization.*endorsement.*recommendation/i);
  assert.match(siteCopy.en.partners.aria, /no specific organization or brand endorsement is implied/i);

  for (const retiredAsset of [
    "../public/brands/lynkvis-ai-logo.png",
    "../public/brands/partner-ribbons/banner1.webp",
    "../public/brands/partner-ribbons/banner2.webp",
    "../public/brands/partner-ribbons/banner3.webp",
  ]) {
    await assert.rejects(readFile(new URL(retiredAsset, import.meta.url)), { code: "ENOENT" });
  }
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
