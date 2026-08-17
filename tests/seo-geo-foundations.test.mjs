import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const primaryOrigin = "https://wmc837911722-del.github.io";
const primaryRoot = `${primaryOrigin}/`;
const githubProfile = "https://github.com/wmc837911722-del";

const rootPages = {
  zh: {
    outputPath: "index.html",
    route: "/",
    lang: "zh-CN",
    title: "风雨｜FDE · AI 产品落地与系统交付",
    description:
      "风雨，前沿部署工程师。帮助团队判断值得做的 AI 场景，完成原型验证、系统集成与生产上线，把业务问题变成可运行的产品。",
    canonical: primaryRoot,
    alternates: {
      "zh-CN": primaryRoot,
      en: `${primaryOrigin}/en/`,
      "x-default": primaryRoot,
    },
    visibleMarkers: ["把业务难题", "AI 场景诊断与路线设计"],
  },
  en: {
    outputPath: "en/index.html",
    route: "/en/",
    lang: "en",
    title: "Fengyu | FDE for AI Product Delivery",
    description:
      "Fengyu is a Forward Deployed Engineer helping teams identify AI use cases worth building, validate them with working prototypes, integrate systems, and ship reliable products.",
    canonical: `${primaryOrigin}/en/`,
    alternates: {
      "zh-CN": primaryRoot,
      en: `${primaryOrigin}/en/`,
      "x-default": primaryRoot,
    },
    visibleMarkers: [
      "Turn real problems",
      "AI use-case discovery &amp; roadmap",
    ],
  },
};

const cases = [
  {
    slug: "mental-health-platform",
    title: "大白 AI 心理健康平台",
    summary:
      "把咨询、测评、风险预警与交易串成一套可持续服务闭环，让用户体验与运营状态在同一系统中推进。",
    imagePath: "/cases/mental-health-platform.png",
  },
  {
    slug: "industrial-compliance-platform",
    title: "工业合规知识平台",
    summary:
      "让分散且敏感的合规资料在内网中可搜索、可追溯、可更新，为一线判断提供有来源的答案。",
    imagePath: "/cases/industrial-compliance-platform.png",
  },
  {
    slug: "sre-copilot",
    title: "智能 SRE 运维助手",
    summary:
      "把指标、日志与集群事件串成可追踪的调查链路，帮助运维团队更快聚焦线索，同时保留人工判断与工具边界。",
    imagePath: "/cases/sre-copilot.png",
  },
  {
    slug: "content-orchestration",
    title: "生成式内容调度平台",
    summary:
      "把分散的批量生成任务集中到统一工作台，统一输入、模型、队列与进度，降低规模化生产的操作复杂度。",
    imagePath: "/cases/content-orchestration-schematic.png",
  },
].map((project) => {
  const canonical = `${primaryOrigin}/cases/${project.slug}/`;
  return {
    ...project,
    outputPath: `cases/${project.slug}/index.html`,
    route: `/cases/${project.slug}/`,
    lang: "zh-CN",
    pageTitle: `${project.title}｜风雨 FDE 项目案例`,
    description: `${project.title}：${project.summary}`,
    canonical,
    alternates: {
      "zh-CN": canonical,
      "x-default": canonical,
    },
    visibleMarkers: [project.title, project.summary, "项目主导者"],
  };
});

const sitemapUrls = [
  primaryRoot,
  `${primaryOrigin}/en/`,
  ...cases.map((project) => project.canonical),
];

const serviceNames = [
  "AI 场景诊断与路线设计",
  "可用原型与价值验证",
  "系统集成与生产上线",
  "运行优化与团队交接",
];

const readProjectFile = (path) => readFile(new URL(path, projectRoot), "utf8");

async function readRequiredFile(path, label) {
  try {
    return await readProjectFile(path);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      assert.fail(`${label} is missing: ${path}`);
    }
    throw error;
  }
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match?.[2];
}

function metadataContent(html, attributeName, attributeValue) {
  const meta = tags(html, "meta").find(
    (tag) => attribute(tag, attributeName)?.toLowerCase() === attributeValue.toLowerCase(),
  );
  return meta ? attribute(meta, "content") : undefined;
}

function canonicalHref(html) {
  const canonical = tags(html, "link").find(
    (tag) => attribute(tag, "rel")?.toLowerCase() === "canonical",
  );
  return canonical ? attribute(canonical, "href") : undefined;
}

function faviconHref(html) {
  const icon = tags(html, "link").find((tag) =>
    (attribute(tag, "rel") ?? "")
      .toLowerCase()
      .split(/\s+/)
      .includes("icon"),
  );
  return icon ? attribute(icon, "href") : undefined;
}

function alternateHrefs(html) {
  return new Map(
    tags(html, "link")
      .filter((tag) => attribute(tag, "rel")?.toLowerCase() === "alternate")
      .map((tag) => [attribute(tag, "hreflang"), attribute(tag, "href")]),
  );
}

function documentTitle(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
}

function assertDocument(html, specification) {
  const lang = tags(html, "html").map((tag) => attribute(tag, "lang"))[0];
  assert.equal(
    lang,
    specification.lang,
    `${specification.route} should declare its language on the raw root document`,
  );
  assert.equal(documentTitle(html), specification.pageTitle ?? specification.title);
  assert.equal(metadataContent(html, "name", "description"), specification.description);
  assert.equal(canonicalHref(html), specification.canonical);

  const alternates = alternateHrefs(html);
  for (const [hreflang, href] of Object.entries(specification.alternates)) {
    assert.equal(
      alternates.get(hreflang),
      href,
      `${specification.route} should expose the ${hreflang} alternate`,
    );
  }

  for (const marker of specification.visibleMarkers) {
    assert.match(
      html,
      new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `${specification.route} should pre-render visible content: ${marker}`,
    );
  }
}

function assertCaseSocialMetadata(html, project) {
  assert.equal(metadataContent(html, "property", "og:title"), project.pageTitle);
  assert.equal(metadataContent(html, "property", "og:description"), project.description);
  assert.equal(metadataContent(html, "property", "og:url"), project.canonical);
  assert.equal(metadataContent(html, "name", "twitter:title"), project.pageTitle);
  assert.equal(metadataContent(html, "name", "twitter:description"), project.description);

  for (const image of [
    metadataContent(html, "property", "og:image"),
    metadataContent(html, "name", "twitter:image"),
  ]) {
    assert.ok(image, `${project.route} should provide a social image`);
    assert.match(image, /^https:\/\//, `${project.route} social images should be absolute`);
    assert.ok(image.endsWith(project.imagePath), `${project.route} should reuse its project image`);
    assert.doesNotMatch(image, /\/og(?:-fde-brand)?\.png$/);
  }
}

function extractJsonLd(html) {
  const documents = [];
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptPattern.exec(html)) !== null) {
    const openingTag = `<script${match[1]}>`;
    if (attribute(openingTag, "type")?.toLowerCase() !== "application/ld+json") continue;
    assert.doesNotThrow(() => JSON.parse(match[2]), "JSON-LD scripts should contain valid JSON");
    documents.push(JSON.parse(match[2]));
  }

  assert.ok(documents.length > 0, "the root document should expose JSON-LD");
  return documents;
}

function collectTypedEntities(value, entities = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectTypedEntities(item, entities));
    return entities;
  }
  if (!value || typeof value !== "object") return entities;

  if ("@type" in value) entities.push(value);
  Object.values(value).forEach((child) => collectTypedEntities(child, entities));
  return entities;
}

function hasType(entity, expectedType) {
  const types = Array.isArray(entity["@type"]) ? entity["@type"] : [entity["@type"]];
  return types.includes(expectedType);
}

function assertFactualLinkedData(html) {
  const documents = extractJsonLd(html);
  const entities = collectTypedEntities(documents);
  const websites = entities.filter((entity) => hasType(entity, "WebSite"));
  const people = entities.filter((entity) => hasType(entity, "Person"));
  const services = entities.filter((entity) => hasType(entity, "Service"));
  const creativeWorks = entities.filter((entity) => hasType(entity, "CreativeWork"));

  assert.ok(websites.some((website) => website.url === primaryRoot), "WebSite should use the canonical root URL");
  assert.equal(people.length, 1, "the graph should identify one site owner");
  assert.equal(people[0].name, "风雨");
  assert.match(JSON.stringify(people[0].jobTitle), /Forward Deployed Engineer|前沿部署工程师/);
  assert.deepEqual(
    Array.isArray(people[0].sameAs) ? people[0].sameAs : [people[0].sameAs],
    [githubProfile],
    "Person.sameAs should contain only the confirmed GitHub profile",
  );

  assert.deepEqual(
    services.map((service) => service.name).sort(),
    [...serviceNames].sort(),
    "the graph should describe the four published services without inventing offers",
  );
  assert.deepEqual(
    creativeWorks.map((work) => work.name).sort(),
    cases.map((project) => project.title).sort(),
    "the graph should describe exactly the four disclosed projects",
  );

  for (const project of cases) {
    const work = creativeWorks.find((candidate) => candidate.name === project.title);
    assert.equal(work?.description, project.summary);
    assert.equal(work?.url, project.canonical);
    assert.equal(work?.author, undefined, `${project.title} should not be presented as a sole-authored work`);
    assert.equal(work?.creator, undefined, `${project.title} should not be presented as a sole-created work`);
  }

  assert.equal(
    entities.some((entity) => hasType(entity, "Organization") || hasType(entity, "LocalBusiness")),
    false,
    "the graph must not invent a legal organization or local business",
  );
  const serialized = JSON.stringify(documents);
  for (const property of [
    "address",
    "aggregateRating",
    "alumniOf",
    "award",
    "foundingDate",
    "numberOfEmployees",
    "priceRange",
    "ratingValue",
    "review",
    "reviewCount",
    "telephone",
    "worksFor",
  ]) {
    assert.doesNotMatch(serialized, new RegExp(`"${property}"\\s*:`), `JSON-LD must not invent ${property}`);
  }
}

function assertStableLocalizedEntities(html) {
  const entities = collectTypedEntities(extractJsonLd(html));
  const websites = entities.filter((entity) => hasType(entity, "WebSite"));
  const creativeWorks = entities.filter((entity) => hasType(entity, "CreativeWork"));

  assert.equal(websites.length, 1, "each localized home should expose one WebSite entity");
  assert.equal(websites[0]["@id"], `${primaryRoot}#website`);
  assert.equal(websites[0].url, primaryRoot);
  assert.deepEqual(
    [...websites[0].inLanguage].sort(),
    ["en", "zh-CN"],
    "the canonical WebSite entity should describe the two indexable home languages",
  );

  assert.equal(creativeWorks.length, cases.length);
  assert.deepEqual(
    creativeWorks.map((work) => work.name).sort(),
    cases.map((project) => project.title).sort(),
    "localized home pages should reference the canonical Chinese case entities",
  );
  for (const work of creativeWorks) {
    assert.equal(
      work.inLanguage,
      "zh-CN",
      `${work.name} should not claim an English case page that is not published`,
    );
  }

  return websites[0];
}

let sitesWorkerPromise;

async function sitesWorker() {
  if (!sitesWorkerPromise) {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("seo-geo-test", `${process.pid}-${Date.now()}`);
    sitesWorkerPromise = import(workerUrl.href).then((module) => module.default);
  }
  return sitesWorkerPromise;
}

async function staticAssetResponse(request) {
  const pathname = decodeURIComponent(new URL(request.url).pathname);
  const candidates = pathname.endsWith("/")
    ? [`${pathname}index.html`]
    : [pathname, `${pathname}.html`, `${pathname}/index.html`];

  for (const candidate of candidates) {
    if (candidate.includes("..")) continue;
    try {
      const body = await readFile(new URL(`../dist/client${candidate}`, import.meta.url));
      const contentType = candidate.endsWith(".html")
        ? "text/html; charset=utf-8"
        : candidate.endsWith(".xml")
          ? "application/xml; charset=utf-8"
          : "application/octet-stream";
      return new Response(body, { status: 200, headers: { "content-type": contentType } });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") continue;
      throw error;
    }
  }

  return new Response("Not found", { status: 404 });
}

async function fetchSitesDocument(path) {
  const worker = await sitesWorker();
  let url = new URL(path, "https://fengyu-product-tech.mystic-ox-8159.chatgpt.site");

  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await worker.fetch(
      new Request(url, { headers: { accept: "text/html" } }),
      { ASSETS: { fetch: staticAssetResponse } },
      { waitUntil() {}, passThroughOnException() {} },
    );
    if (response.status < 300 || response.status >= 400) return response;

    const location = response.headers.get("location");
    assert.ok(location, `${url.pathname} redirected without a Location header`);
    url = new URL(location, url);
  }

  assert.fail(`${path} exceeded the accepted redirect limit`);
}

test("both generated roots canonicalize to the GitHub Pages primary domain", async () => {
  const githubHtml = await readRequiredFile("dist-github-pages/index.html", "GitHub Pages root output");
  const sitesResponse = await fetchSitesDocument("/");
  assert.equal(sitesResponse.status, 200);
  const sitesHtml = await sitesResponse.text();

  assert.equal(canonicalHref(githubHtml), primaryRoot);
  assert.equal(canonicalHref(sitesHtml), primaryRoot);
});

test("both generated deployments publish robots and a canonical sitemap", async () => {
  for (const deployment of [
    { label: "Sites", root: "dist/client/" },
    { label: "GitHub Pages", root: "dist-github-pages/" },
  ]) {
    const robots = await readRequiredFile(`${deployment.root}robots.txt`, `${deployment.label} robots.txt`);
    const sitemap = await readRequiredFile(`${deployment.root}sitemap.xml`, `${deployment.label} sitemap.xml`);

    assert.match(robots, /^User-agent:\s*\*/im);
    assert.doesNotMatch(robots, /^Disallow:\s*\/$/im);
    assert.match(robots, new RegExp(`^Sitemap:\\s*${primaryOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/sitemap\\.xml$`, "im"));
    assert.match(sitemap, /<urlset\b[^>]*>/i);
    for (const url of sitemapUrls) {
      assert.match(sitemap, new RegExp(`<loc>\\s*${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*</loc>`));
    }
  }
});

test("both generated roots expose factual WebSite, Person, Service and CreativeWork JSON-LD", async () => {
  const githubHtml = await readRequiredFile("dist-github-pages/index.html", "GitHub Pages root output");
  const sitesResponse = await fetchSitesDocument("/");
  assert.equal(sitesResponse.status, 200);
  const sitesHtml = await sitesResponse.text();

  assertFactualLinkedData(githubHtml);
  assertFactualLinkedData(sitesHtml);
});

test("localized homes keep one stable WebSite entity and do not invent English case pages", async () => {
  const githubChinese = await readRequiredFile("dist-github-pages/index.html", "GitHub Pages Chinese root");
  const githubEnglish = await readRequiredFile("dist-github-pages/en/index.html", "GitHub Pages English root");
  const [sitesChineseResponse, sitesEnglishResponse] = await Promise.all([
    fetchSitesDocument("/"),
    fetchSitesDocument("/en/"),
  ]);
  assert.equal(sitesChineseResponse.status, 200);
  assert.equal(sitesEnglishResponse.status, 200);

  const websites = [
    assertStableLocalizedEntities(githubChinese),
    assertStableLocalizedEntities(githubEnglish),
    assertStableLocalizedEntities(await sitesChineseResponse.text()),
    assertStableLocalizedEntities(await sitesEnglishResponse.text()),
  ];
  for (const website of websites.slice(1)) {
    assert.deepEqual(website, websites[0], "the same WebSite @id must not change meaning by locale");
  }
});

test("GitHub Pages pre-renders an English page and four independently indexable case pages", async (t) => {
  for (const specification of [rootPages.zh, rootPages.en, ...cases]) {
    await t.test(specification.route, async () => {
      const html = await readRequiredFile(
        `dist-github-pages/${specification.outputPath}`,
        `GitHub Pages output for ${specification.route}`,
      );
      assertDocument(html, specification);
      assert.equal(
        faviconHref(html),
        "/favicon.svg",
        `${specification.route} should resolve its favicon from the site root`,
      );
      if ("slug" in specification) assertCaseSocialMetadata(html, specification);
    });
  }
});

test("Sites serves both localized roots and the four case routes with indexable metadata and content", async (t) => {
  for (const specification of [rootPages.zh, rootPages.en, ...cases]) {
    await t.test(specification.route, async () => {
      const response = await fetchSitesDocument(specification.route);
      assert.equal(response.status, 200, `${specification.route} should be a public Sites route`);
      assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
      const html = await response.text();
      assertDocument(html, specification);
      if ("slug" in specification) assertCaseSocialMetadata(html, specification);
    });
  }
});
