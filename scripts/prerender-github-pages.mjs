import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createElement, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true },
  appType: "custom",
});

const escapeAttribute = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

function replaceTag(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`GitHub Pages template is missing ${label}`);
  return html.replace(pattern, replacement);
}

function metaName(name, content) {
  return `<meta name="${name}" content="${escapeAttribute(content)}" />`;
}

function metaProperty(property, content) {
  return `<meta property="${property}" content="${escapeAttribute(content)}" />`;
}

function applyMetadata(template, route) {
  let html = template;
  html = replaceTag(html, /<html\s+lang="[^"]+"/i, `<html lang="${route.lang}"`, "html language");
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${route.title}</title>`, "title");
  html = replaceTag(html, /<meta\s+name="description"[^>]*>/i, metaName("description", route.description), "description");
  html = replaceTag(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${route.canonical}" />`, "canonical");
  html = replaceTag(html, /<meta\s+property="og:type"[^>]*>/i, metaProperty("og:type", route.ogType), "og:type");
  html = replaceTag(html, /<meta\s+property="og:locale"[^>]*>/i, metaProperty("og:locale", route.ogLocale), "og:locale");
  html = replaceTag(html, /<meta\s+property="og:site_name"[^>]*>/i, metaProperty("og:site_name", route.siteName), "og:site_name");
  html = replaceTag(html, /<meta\s+property="og:title"[^>]*>/i, metaProperty("og:title", route.title), "og:title");
  html = replaceTag(html, /<meta\s+property="og:description"[^>]*>/i, metaProperty("og:description", route.description), "og:description");
  html = replaceTag(html, /<meta\s+property="og:url"[^>]*>/i, metaProperty("og:url", route.canonical), "og:url");
  html = replaceTag(html, /<meta\s+property="og:image"[^>]*>/i, metaProperty("og:image", route.image), "og:image");
  html = replaceTag(html, /<meta\s+property="og:image:alt"[^>]*>/i, metaProperty("og:image:alt", route.imageAlt), "og:image:alt");
  html = replaceTag(html, /<meta\s+property="og:image:width"[^>]*>/i, metaProperty("og:image:width", route.imageWidth), "og:image:width");
  html = replaceTag(html, /<meta\s+property="og:image:height"[^>]*>/i, metaProperty("og:image:height", route.imageHeight), "og:image:height");
  html = replaceTag(html, /<meta\s+name="twitter:title"[^>]*>/i, metaName("twitter:title", route.title), "twitter:title");
  html = replaceTag(html, /<meta\s+name="twitter:description"[^>]*>/i, metaName("twitter:description", route.description), "twitter:description");
  html = replaceTag(html, /<meta\s+name="twitter:image"[^>]*>/i, metaName("twitter:image", route.image), "twitter:image");

  html = html.replace(/\s*<link\s+rel="alternate"[^>]*>/gi, "");
  const alternateTags = route.alternates
    .map(({ lang, href }) => `    <link rel="alternate" hreflang="${lang}" href="${href}" />`)
    .join("\n");
  html = html.replace("</head>", `${alternateTags}\n  </head>`);
  return html;
}

function renderPage(Component, props) {
  return renderToString(
    createElement(StrictMode, null, createElement(Component, props)),
  );
}

async function writeRoute(template, route, markup) {
  const placeholder = '<div id="root"></div>';
  if (!template.includes(placeholder)) {
    throw new Error("GitHub Pages build is missing the root placeholder");
  }

  const outputPath = resolve("dist-github-pages", route.output);
  await mkdir(dirname(outputPath), { recursive: true });
  const html = applyMetadata(template, route)
    .replace(placeholder, `<div id="root">${markup}</div>`);
  await writeFile(outputPath, html, "utf8");
}

try {
  const [{ default: Home }, { default: CaseDetail }, copyModule, seoModule] = await Promise.all([
    server.ssrLoadModule("/app/home.tsx"),
    server.ssrLoadModule("/app/case-detail.tsx"),
    server.ssrLoadModule("/app/site-copy.ts"),
    server.ssrLoadModule("/app/seo.ts"),
  ]);
  const { siteCopy } = copyModule;
  const { PRIMARY_SITE_URL, absoluteSiteUrl, caseMetadata } = seoModule;
  const template = await readFile(resolve("dist-github-pages/index.html"), "utf8");
  const homeAlternates = [
    { lang: "zh-CN", href: absoluteSiteUrl("/") },
    { lang: "en", href: absoluteSiteUrl("/en/") },
    { lang: "x-default", href: absoluteSiteUrl("/") },
  ];
  const homeImage = absoluteSiteUrl("/og-fde-brand.png");

  await writeRoute(template, {
    output: "index.html",
    lang: "zh-CN",
    title: siteCopy.zh.seo.title,
    description: siteCopy.zh.seo.description,
    canonical: absoluteSiteUrl("/"),
    alternates: homeAlternates,
    ogType: "website",
    ogLocale: "zh_CN",
    siteName: "风雨 FDE",
    image: homeImage,
    imageAlt: siteCopy.zh.seo.title,
    imageWidth: 1734,
    imageHeight: 907,
  }, renderPage(Home, { initialLocale: "zh" }));

  await writeRoute(template, {
    output: "en/index.html",
    lang: "en",
    title: siteCopy.en.seo.title,
    description: siteCopy.en.seo.description,
    canonical: absoluteSiteUrl("/en/"),
    alternates: homeAlternates,
    ogType: "website",
    ogLocale: "en_US",
    siteName: "Fengyu FDE",
    image: homeImage,
    imageAlt: siteCopy.en.seo.title,
    imageWidth: 1734,
    imageHeight: 907,
  }, renderPage(Home, { initialLocale: "en" }));

  for (const project of siteCopy.zh.caseStudy.projects) {
    const metadata = caseMetadata("zh", project.id);
    if (!metadata) throw new Error(`Missing metadata for ${project.id}`);

    await writeRoute(template, {
      output: `cases/${project.id}/index.html`,
      lang: "zh-CN",
      title: metadata.title,
      description: metadata.description,
      canonical: metadata.canonical,
      alternates: [
        { lang: "zh-CN", href: metadata.canonical },
        { lang: "x-default", href: metadata.canonical },
      ],
      ogType: "article",
      ogLocale: "zh_CN",
      siteName: "风雨 FDE",
      image: metadata.image,
      imageAlt: metadata.imageAlt,
      imageWidth: project.imageWidth,
      imageHeight: project.imageHeight,
    }, renderPage(CaseDetail, { caseId: project.id, locale: "zh" }));
  }

  if (!template.includes(PRIMARY_SITE_URL)) {
    throw new Error("GitHub Pages template must identify the canonical host");
  }
} finally {
  await server.close();
}
