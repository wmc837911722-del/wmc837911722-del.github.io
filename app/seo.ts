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

function personNode() {
  return {
    "@type": "Person",
    "@id": `${PRIMARY_SITE_URL}/#person`,
    name: "风雨",
    alternateName: "Fengyu",
    url: absoluteSiteUrl("/"),
    jobTitle: ["前沿部署工程师", "Forward Deployed Engineer"],
    description: siteCopy.zh.seo.description,
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
      contactType: ["AI 项目合作", "AI project inquiries"],
      email: ["837911722@qq.com", "wmc837911722@gmail.com"],
      url: absoluteSiteUrl("/#contact"),
    },
  };
}

function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": `${PRIMARY_SITE_URL}/#website`,
    url: absoluteSiteUrl("/"),
    name: "风雨 FDE",
    alternateName: "Fengyu FDE",
    description: siteCopy.zh.seo.description,
    inLanguage: ["zh-CN", "en"],
    creator: { "@id": `${PRIMARY_SITE_URL}/#person` },
  };
}

function webPageNode(locale: Locale) {
  const copy = siteCopy[locale];
  const url = absoluteSiteUrl(localePaths[locale]);

  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: copy.seo.title,
    description: copy.seo.description,
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    isPartOf: { "@id": `${PRIMARY_SITE_URL}/#website` },
    about: { "@id": `${PRIMARY_SITE_URL}/#person` },
  };
}

function serviceNodes() {
  return siteCopy.zh.services.map((service, index) => {
    const englishService = siteCopy.en.services[index];

    return {
      "@type": "Service",
      "@id": `${PRIMARY_SITE_URL}/#service-${service.id}`,
      name: service.title,
      alternateName: englishService?.title,
      description: [service.description, englishService?.description].filter(Boolean),
      serviceType: [service.tag, englishService?.tag].filter(Boolean),
      provider: { "@id": `${PRIMARY_SITE_URL}/#person` },
      url: absoluteSiteUrl("/#services"),
    };
  });
}

function projectNodes() {
  return siteCopy.zh.caseStudy.projects.map((project) => ({
    "@type": "CreativeWork",
    "@id": `${absoluteSiteUrl(casePath(project.id))}#case-study`,
    url: absoluteSiteUrl(casePath(project.id)),
    name: project.title,
    description: project.summary,
    about: project.purpose,
    image: absoluteSiteUrl(project.imageSrc),
    inLanguage: "zh-CN",
    keywords: project.tags,
    contributor: { "@id": `${PRIMARY_SITE_URL}/#person` },
    isPartOf: { "@id": `${PRIMARY_SITE_URL}/#website` },
  }));
}

export function homeStructuredData(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personNode(),
      websiteNode(),
      webPageNode(locale),
      ...serviceNodes(),
      ...projectNodes(),
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
      personNode(),
      websiteNode(),
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
