import { siteCopy, type Locale } from "./site-copy";
import { getCaseNarrative } from "./case-narratives";
import { contactPath } from "./contact-context";
import "./case-narratives.css";
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
  const narrative = getCaseNarrative(locale, caseId);

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
        role: "交付范围",
        technology: "技术标签",
        disclosure: "披露说明",
        disclosureBody:
          "案例中的交付范围与系统信息依据实际项目资料及获准公开内容整理。为保护合作方，客户敏感资料、团队成员信息与未经核验的结果不在本站披露。",
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
        role: "Delivery scope",
        technology: "Technology",
        disclosure: "Disclosure",
        disclosureBody:
          "Delivery scope and system details are based on documented project material and content approved for public release. Client-sensitive material, team details and unverified outcomes remain confidential.",
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
          <a className="nav-cta" href={contactPath(locale, { kind: "case", id: project.id })}>
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

        {narrative && (
          <section className="case-detail-section" aria-labelledby="case-detail-problem">
            <div className="case-detail-section-title">
              <p className="kicker">CONTEXT / PROBLEM</p>
              <h2 id="case-detail-problem">{narrative.problem.heading}</h2>
            </div>
            <div className="case-narrative-prose">
              <p>{narrative.problem.body}</p>
              <p>{narrative.problem.focus}</p>
            </div>
          </section>
        )}

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

        {narrative && (
          <section className="case-detail-section" aria-labelledby="case-detail-decisions">
            <div className="case-detail-section-title">
              <p className="kicker">ENGINEERING / CHOICES</p>
              <h2 id="case-detail-decisions">{narrative.decisions.heading}</h2>
            </div>
            <ol className="case-narrative-items case-narrative-decisions">
              {narrative.decisions.items.map((item) => (
                <li key={item.title}>
                  <div><h3>{item.title}</h3><p>{item.body}</p></div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="case-detail-section case-detail-proof" aria-labelledby="case-detail-role">
          <div>
            <p className="kicker">ROLE / DISCLOSURE</p>
            <h2 id="case-detail-role">{labels.role}</h2>
            <strong>{project.role}</strong>
            <p>{project.roleNote}</p>
            {narrative && (
              <div className="case-narrative-scope">
                <h3>{narrative.scope.heading}</h3>
                <ul className="case-narrative-items">
                  {narrative.scope.items.map((item) => (
                    <li key={item.title}><h4>{item.title}</h4><p>{item.body}</p></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <aside>
            <h3>{narrative?.boundaries.heading ?? labels.disclosure}</h3>
            <p>{narrative?.boundaries.body ?? labels.disclosureBody}</p>
          </aside>
        </section>

        {narrative && (
          <section className="case-detail-section" aria-labelledby="case-detail-evidence">
            <div className="case-detail-section-title">
              <p className="kicker">DELIVERABLES / EVIDENCE</p>
              <h2 id="case-detail-evidence">{narrative.evidence.heading}</h2>
            </div>
            <div className="case-narrative-evidence">
              <div>
                <h3>{narrative.evidence.deliverablesHeading}</h3>
                <ul>{narrative.evidence.deliverables.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <h3>{narrative.evidence.availableHeading}</h3>
                {narrative.evidence.available.map((item) => <p key={item}>{item}</p>)}
              </div>
              <p className="case-narrative-measurement">{narrative.evidence.measurementNote}</p>
            </div>
          </section>
        )}

        <section className="case-detail-technology" aria-labelledby="case-detail-technology">
          <h2 id="case-detail-technology">{labels.technology}</h2>
          <ul aria-label={project.tagsLabel}>
            {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
          <div className="case-detail-actions">
            <a className="primary-button" href={contactPath(locale, { kind: "case", id: project.id })}>
              <span>{labels.contact}</span><span aria-hidden="true">↗</span>
            </a>
            <a className="case-detail-secondary-button" href={`${localePaths[locale]}#case-study`}>
              <span>{labels.moreCases}</span><span aria-hidden="true">←</span>
            </a>
          </div>
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
