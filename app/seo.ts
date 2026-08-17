import { siteCopy, type Locale } from "./site-copy";

export const PRIMARY_SITE_URL = "https://wmc837911722-del.github.io";
export const GITHUB_PROFILE_URL = "https://github.com/wmc837911722-del";

export const localePaths: Record<Locale, string> = {
  zh: "/",
  en: "/en/",
};

export function absoluteSiteUrl(path = "/") {
  return new URL(path, `${PRIMARY_SITE_URL}/`).toString();
}

export function casePath(caseId: string) {
  return `/cases/${caseId}/`;
}

export function getProject(locale: Locale, caseId: string) {
  return siteCopy[locale].caseStudy.projects.find((project) => project.id === caseId);
}

export function caseMetadata(locale: Locale, caseId: string) {
  const project = getProject(locale, caseId);
  if (!project) return null;

  return {
    title:
      locale === "zh"
        ? `${project.title}｜风雨 FDE 项目案例`
        : `${project.title} | Fengyu AI Case Study`,
    description:
      locale === "zh"
        ? `${project.title}：${project.summary}`
        : `${project.title}: ${project.summary}`,
    canonical: absoluteSiteUrl(casePath(project.id)),
    image: absoluteSiteUrl(project.imageSrc),
    imageAlt: project.imageAlt,
  };
}

function personNode(locale: Locale) {
  const copy = siteCopy[locale];
  const isChinese = locale === "zh";

  return {
    "@type": "Person",
    "@id": `${PRIMARY_SITE_URL}/#person`,
    name: isChinese ? "风雨" : "Fengyu",
    alternateName: isChinese ? "Fengyu" : "风雨",
    url: absoluteSiteUrl("/"),
    jobTitle: isChinese ? "前沿部署工程师" : "Forward Deployed Engineer",
    description: copy.seo.description,
    email: ["837911722@qq.com", "wmc837911722@gmail.com"],
    sameAs: [GITHUB_PROFILE_URL],
    knowsAbout: [
      "AI product delivery",
      "AI agents",
      "Retrieval-augmented generation",
      "System integration",
      "Full-stack engineering",
      "Production deployment",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: isChinese ? "AI 项目合作" : "AI project inquiries",
      email: ["837911722@qq.com", "wmc837911722@gmail.com"],
      url: absoluteSiteUrl("/#contact"),
    },
  };
}

function websiteNode(locale: Locale) {
  const copy = siteCopy[locale];

  return {
    "@type": "WebSite",
    "@id": `${PRIMARY_SITE_URL}/#website`,
    url: absoluteSiteUrl(localePaths[locale]),
    name: copy.seo.title,
    description: copy.seo.description,
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    creator: { "@id": `${PRIMARY_SITE_URL}/#person` },
  };
}

function serviceNodes(locale: Locale) {
  return siteCopy[locale].services.map((service) => ({
    "@type": "Service",
    "@id": `${PRIMARY_SITE_URL}/#service-${service.id}`,
    name: service.title,
    description: service.description,
    serviceType: service.tag,
    provider: { "@id": `${PRIMARY_SITE_URL}/#person` },
    url: absoluteSiteUrl("/#services"),
  }));
}

function projectNodes(locale: Locale) {
  return siteCopy[locale].caseStudy.projects.map((project) => ({
    "@type": "CreativeWork",
    "@id": `${absoluteSiteUrl(casePath(project.id))}#case-study`,
    url: absoluteSiteUrl(casePath(project.id)),
    name: project.title,
    description: project.summary,
    about: project.purpose,
    image: absoluteSiteUrl(project.imageSrc),
    inLanguage: ["zh-CN", "en"],
    keywords: project.tags,
    contributor: { "@id": `${PRIMARY_SITE_URL}/#person` },
    isPartOf: { "@id": `${PRIMARY_SITE_URL}/#website` },
  }));
}

export function homeStructuredData(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personNode(locale),
      websiteNode(locale),
      ...serviceNodes(locale),
      ...projectNodes(locale),
    ],
  };
}

export function caseStructuredData(locale: Locale, caseId: string) {
  const project = getProject(locale, caseId);
  if (!project) return null;

  const canonical = absoluteSiteUrl(casePath(project.id));
  return {
    "@context": "https://schema.org",
    "@graph": [
      personNode(locale),
      {
        "@type": "CreativeWork",
        "@id": `${canonical}#case-study`,
        url: canonical,
        name: project.title,
        description: project.summary,
        about: project.purpose,
        image: absoluteSiteUrl(project.imageSrc),
        inLanguage: locale === "zh" ? "zh-CN" : "en",
        keywords: project.tags,
        contributor: { "@id": `${PRIMARY_SITE_URL}/#person` },
        isPartOf: { "@id": `${PRIMARY_SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: locale === "zh" ? "首页" : "Home",
            item: absoluteSiteUrl(localePaths[locale]),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: project.title,
            item: canonical,
          },
        ],
      },
    ],
  };
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
