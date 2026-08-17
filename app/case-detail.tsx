import { siteCopy, type Locale } from "./site-copy";
import {
  GITHUB_PROFILE_URL,
  caseStructuredData,
  getProject,
  jsonLd,
  localePaths,
} from "./seo";

type CaseDetailProps = {
  caseId: string;
  locale?: Locale;
};

export default function CaseDetail({ caseId, locale = "zh" }: CaseDetailProps) {
  const copy = siteCopy[locale];
  const project = getProject(locale, caseId);
  const structuredData = caseStructuredData(locale, caseId);

  if (!project || !structuredData) return null;

  const labels = locale === "zh"
    ? {
        home: "返回风雨首页",
        cases: "项目案例",
        contact: "沟通类似项目",
        breadcrumbHome: "首页",
        eyebrow: "AI 项目案例",
        purpose: "项目用途",
        facts: "系统与工程信息",
        role: "项目角色",
        technology: "技术标签",
        disclosure: "披露说明",
        disclosureBody:
          "该案例为风雨主导的团队项目。页面仅呈现获准公开的系统信息；客户敏感资料、团队成员信息与未授权量化结果不在本站披露。",
        moreCases: "查看首页中的其他案例",
      }
    : {
        home: "Back to Fengyu home",
        cases: "Case studies",
        contact: "Discuss a similar project",
        breadcrumbHome: "Home",
        eyebrow: "AI CASE STUDY",
        purpose: "Purpose",
        facts: "System and engineering details",
        role: "Project role",
        technology: "Technology",
        disclosure: "Disclosure",
        disclosureBody:
          "This is a team project led by Fengyu. Only information approved for disclosure appears here; client-sensitive material, team details and unauthorized measured outcomes remain confidential.",
        moreCases: "Explore the other case studies",
      };

  return (
    <main className="case-detail-page" lang={locale === "zh" ? "zh-CN" : "en"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />

      <header className="case-detail-header">
        <a className="wordmark" href={localePaths[locale]} aria-label={labels.home}>
          {locale === "zh" ? "风雨" : "FENGYU"}<span>®</span>
        </a>
        <nav aria-label={labels.cases}>
          <a href={`${localePaths[locale]}#case-study`}>{labels.moreCases}</a>
          <a className="nav-cta" href={`${localePaths[locale]}#contact`}>
            {labels.contact}<span aria-hidden="true">→</span>
          </a>
        </nav>
      </header>

      <article className="case-detail-article" aria-labelledby="case-detail-title">
        <nav className="case-detail-breadcrumb" aria-label={labels.cases}>
          <a href={localePaths[locale]}>{labels.breadcrumbHome}</a>
          <span aria-hidden="true">/</span>
          <a href={`${localePaths[locale]}#case-study`}>{labels.cases}</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{project.title}</span>
        </nav>

        <header className="case-detail-hero">
          <div className="case-detail-intro">
            <p className="kicker">{labels.eyebrow} / {project.number}</p>
            <span className="system-case-purpose">{project.purpose}</span>
            <h1 id="case-detail-title">{project.title}</h1>
            <p className="case-detail-summary">{project.summary}</p>
            <dl className="case-detail-meta">
              <div><dt>{labels.purpose}</dt><dd>{project.purpose}</dd></div>
              <div><dt>{locale === "zh" ? "年份" : "Year"}</dt><dd>{project.year}</dd></div>
              <div><dt>{locale === "zh" ? "类型" : "Category"}</dt><dd>{project.category}</dd></div>
            </dl>
          </div>

          <figure className="case-detail-media">
            {/* Shared self-hosted source for Sites and GitHub Pages. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.imageSrc}
              alt={project.imageAlt}
              width={project.imageWidth}
              height={project.imageHeight}
              loading="eager"
              decoding="async"
            />
            <figcaption>{project.imageNote}</figcaption>
          </figure>
        </header>

        <section className="case-detail-section" aria-labelledby="case-detail-facts">
          <div className="case-detail-section-title">
            <p className="kicker">SYSTEM / DELIVERY</p>
            <h2 id="case-detail-facts">{labels.facts}</h2>
          </div>
          <dl className="case-detail-facts">
            {project.facts.map((fact) => (
              <div key={fact.id}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="case-detail-section case-detail-proof" aria-labelledby="case-detail-role">
          <div>
            <p className="kicker">ROLE / DISCLOSURE</p>
            <h2 id="case-detail-role">{labels.role}</h2>
            <strong>{project.role}</strong>
            <p>{project.roleNote}</p>
          </div>
          <aside>
            <h3>{labels.disclosure}</h3>
            <p>{labels.disclosureBody}</p>
          </aside>
        </section>

        <section className="case-detail-technology" aria-labelledby="case-detail-technology">
          <h2 id="case-detail-technology">{labels.technology}</h2>
          <ul aria-label={project.tagsLabel}>
            {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
          <a className="primary-button" href={`${localePaths[locale]}#contact`}>
            <span>{labels.contact}</span><span aria-hidden="true">↗</span>
          </a>
        </section>
      </article>

      <footer>
        <p>风雨® — FORWARD DEPLOYED ENGINEER</p>
        <p>{copy.footer.tagline}</p>
        <a href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
      </footer>
    </main>
  );
}
