import { siteCopy, type Locale } from "./site-copy";
import { absoluteSiteUrl, casePath, localePaths } from "./seo";

export type ContactContext = { kind: "case" | "service"; id: string };

// Resolve only known IDs. Query strings never become arbitrary mail content or URLs.
export function resolveContactContext(locale: Locale, context: ContactContext | null) {
  if (!context) return null;
  const copy = siteCopy[locale];
  if (context.kind === "case") {
    const project = copy.caseStudy.projects.find(({ id }) => id === context.id);
    return project ? { ...context, title: project.title, url: absoluteSiteUrl(casePath(project.id)) } : null;
  }
  const service = copy.services.find(({ id }) => id === context.id);
  return service ? { ...context, title: service.title, url: absoluteSiteUrl(`${localePaths[locale]}#services`) } : null;
}

export function readContactContext(search: string): ContactContext | null {
  const params = new URLSearchParams(search);
  // Ambiguous or duplicate values should not silently select a different topic.
  if (params.getAll("case").length + params.getAll("service").length !== 1) return null;
  const kind = params.has("case") ? "case" : "service";
  const context: ContactContext = { kind, id: params.get(kind) ?? "" };
  return resolveContactContext("zh", context) ? context : null;
}

export function contactPath(locale: Locale, context: ContactContext | null = null) {
  const valid = resolveContactContext(locale, context);
  const search = valid ? `?${new URLSearchParams({ [valid.kind]: valid.id })}` : "";
  return `${localePaths[locale]}${search}#contact`;
}

export function contactBrief(locale: Locale, context: ContactContext | null) {
  const template = siteCopy[locale].contact.mailTemplate;
  const source = resolveContactContext(locale, context);
  if (!source) return template;
  const label = locale === "zh"
    ? source.kind === "case" ? "参考案例" : "咨询服务"
    : source.kind === "case" ? "Reference case" : "Service of interest";
  return `${label}：${source.title}\n${source.url}\n\n${template}`;
}
