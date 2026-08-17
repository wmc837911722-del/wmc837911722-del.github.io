"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { siteCopy, type Locale } from "./site-copy";

type Theme = "dark" | "light";
type CaseDirection = "next" | "previous";

const LOCALE_STORAGE_KEY = "fengyu:locale:v1";
const THEME_STORAGE_KEY = "fengyu:theme:v1";
const contactEmails = [
  { label: "QQ MAIL", address: "837911722@qq.com" },
  { label: "GMAIL", address: "wmc837911722@gmail.com" },
];

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);
  const copyResetRef = useRef<number | null>(null);
  const caseTransitionRef = useRef<number | null>(null);
  const [locale, setLocale] = useState<Locale>("zh");
  const [theme, setTheme] = useState<Theme>("dark");
  const [preferenceAnnouncement, setPreferenceAnnouncement] = useState("");
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [previousCaseIndex, setPreviousCaseIndex] = useState<number | null>(null);
  const [caseDirection, setCaseDirection] = useState<CaseDirection>("next");
  const [caseAnnouncement, setCaseAnnouncement] = useState("");
  const [copyState, setCopyState] = useState<
    "idle" | "copying" | "copied" | "failed"
  >("idle");
  const copy = siteCopy[locale];
  const collaborationBrief = copy.contact.mailTemplate;
  const caseCount = copy.caseStudy.projects.length;

  const goToCase = (index: number, direction: CaseDirection) => {
    const nextIndex = ((index % caseCount) + caseCount) % caseCount;
    if (nextIndex === activeCaseIndex) return;

    if (caseTransitionRef.current !== null) {
      window.clearTimeout(caseTransitionRef.current);
    }
    setCaseDirection(direction);
    setPreviousCaseIndex(activeCaseIndex);
    setActiveCaseIndex(nextIndex);
    setCaseAnnouncement(
      `${String(nextIndex + 1).padStart(2, "0")} / ${String(caseCount).padStart(2, "0")}: ${copy.caseStudy.projects[nextIndex].title}`,
    );
    caseTransitionRef.current = window.setTimeout(() => {
      setPreviousCaseIndex(null);
      caseTransitionRef.current = null;
    }, 440);
  };

  const handleCaseCarouselKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.currentTarget !== event.target) return;

    const destinations: Record<
      string,
      { index: number; direction: CaseDirection }
    > = {
      "ArrowLeft": { index: activeCaseIndex - 1, direction: "previous" },
      "ArrowRight": { index: activeCaseIndex + 1, direction: "next" },
      "Home": { index: 0, direction: "previous" },
      "End": { index: caseCount - 1, direction: "next" },
    };
    const destination = destinations[event.key];
    if (destination === undefined) return;

    event.preventDefault();
    goToCase(destination.index, destination.direction);
  };

  const copyCollaborationBrief = async () => {
    const fallbackCopy = () => {
      const textArea = document.createElement("textarea");
      textArea.value = collaborationBrief;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";

      try {
        document.body.appendChild(textArea);
        textArea.select();
        return document.execCommand("copy");
      } catch {
        return false;
      } finally {
        textArea.remove();
      }
    };

    setCopyState("copying");
    if (copyResetRef.current !== null) {
      window.clearTimeout(copyResetRef.current);
      copyResetRef.current = null;
    }

    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(collaborationBrief);
        copied = true;
      } else {
        copied = fallbackCopy();
      }
    } catch {
      copied = fallbackCopy();
    }

    setCopyState(copied ? "copied" : "failed");
    copyResetRef.current = window.setTimeout(() => setCopyState("idle"), 3200);
  };

  const toggleLocale = () => {
    const nextLocale: Locale = locale === "zh" ? "en" : "zh";
    document.documentElement.lang = nextLocale === "zh" ? "zh-CN" : "en";
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    } catch {
      // Storage can be unavailable in privacy-restricted browsers.
    }
    if (copyResetRef.current !== null) {
      window.clearTimeout(copyResetRef.current);
      copyResetRef.current = null;
    }
    setCopyState("idle");
    if (caseTransitionRef.current !== null) {
      window.clearTimeout(caseTransitionRef.current);
      caseTransitionRef.current = null;
    }
    setPreviousCaseIndex(null);
    setCaseAnnouncement("");
    setLocale(nextLocale);
    setPreferenceAnnouncement(
      siteCopy[nextLocale].preferences[
        nextLocale === "en" ? "changedToEnglish" : "changedToChinese"
      ],
    );
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The visible theme still changes when persistence is unavailable.
    }
    const themeColor = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (themeColor) {
      themeColor.content = nextTheme === "dark" ? "#080b12" : "#f7f7f2";
    }
    setTheme(nextTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    const frame = window.requestAnimationFrame(() => {
      setTheme(root.dataset.theme === "light" ? "light" : "dark");

      try {
        const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
        if (savedLocale === "zh" || savedLocale === "en") {
          setLocale(savedLocale);
          root.lang = savedLocale === "zh" ? "zh-CN" : "en";
        }
      } catch {
        // Keep the server-rendered Chinese default when storage is unavailable.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.title = copy.seo.title;
    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (description) description.content = copy.seo.description;

    let disposed = false;
    const frame = window.requestAnimationFrame(() => {
      void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        if (!disposed) ScrollTrigger.refresh();
      });
    });
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
    };
  }, [copy.seo.description, copy.seo.title, locale]);

  useEffect(
    () => () => {
      if (copyResetRef.current !== null) {
        window.clearTimeout(copyResetRef.current);
      }
      if (caseTransitionRef.current !== null) {
        window.clearTimeout(caseTransitionRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    let disposed = false;
    let disposeAnimations = () => {};

    async function startAnimations() {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (disposed || !pageRef.current) return;

      document.documentElement.removeAttribute("data-motion");
      gsap.registerPlugin(ScrollTrigger);
      const select = gsap.utils.selector(pageRef);
      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 800px)",
          mobile: "(max-width: 799px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions as {
            desktop: boolean;
            reduceMotion: boolean;
          };

          if (reduceMotion) {
            gsap.set(
              select(
                ".hero-line, .hero-reveal, .section-reveal, .service-card, .capability-card, .brand-tile",
              ),
              { clearProps: "all" },
            );
            return;
          }

          const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
          intro
            .from(select(".site-header"), {
              autoAlpha: 0,
              y: -18,
              duration: 0.65,
            })
            .from(
              select(".hero-reveal"),
              { autoAlpha: 0, y: 18, duration: 0.55, stagger: 0.08 },
              "<0.1",
            )
            .from(
              select(".hero-line"),
              { yPercent: 115, duration: 1.05, stagger: 0.09 },
              "<0.05",
            )
            .from(
              select(".hero-bottom"),
              { autoAlpha: 0, y: 28, duration: 0.7 },
              "<0.35",
            )
            .from(
              select(".hero-orbit"),
              { autoAlpha: 0, scale: 0.72, rotation: -38, duration: 1.2 },
              "<",
            );

          gsap.to(select(".scroll-progress"), {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: pageRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.2,
            },
          });

          gsap.to(select(".hero-orbit"), {
            rotation: 36,
            yPercent: 18,
            ease: "none",
            scrollTrigger: {
              trigger: select(".hero")[0],
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });

          gsap.to(select(".ticker-track"), {
            xPercent: -33.333,
            ease: "none",
            scrollTrigger: {
              trigger: select(".ticker")[0],
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });

          select(".section-reveal").forEach((element) => {
            gsap.from(element, {
              autoAlpha: 0,
              y: 38,
              duration: 0.75,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 84%",
                toggleActions: "play none none reverse",
              },
            });
          });

          select(".service-card").forEach((card) => {
            gsap.from(card, {
              autoAlpha: 0,
              y: 72,
              scale: 0.97,
              rotationX: desktop ? 7 : 0,
              transformPerspective: 900,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 86%",
                toggleActions: "play none none reverse",
              },
            });
          });

          gsap.from(select(".capability-card"), {
            autoAlpha: 0,
            y: 34,
            scale: 0.96,
            duration: 0.6,
            stagger: { each: 0.08, from: "start" },
            ease: "power3.out",
            scrollTrigger: {
              trigger: select(".capability-grid")[0],
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
          });

          gsap.from(select(".brand-tile"), {
            autoAlpha: 0,
            y: 28,
            scale: 0.985,
            duration: 0.55,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: select(".partner-wall")[0],
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          });

          gsap.fromTo(
            select(".about-mark"),
            { xPercent: -18, rotation: -8 },
            {
              xPercent: 4,
              rotation: 3,
              ease: "none",
              scrollTrigger: {
                trigger: select(".about")[0],
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            },
          );

          if (desktop) {
            const contact = select(".contact")[0];
            const glow = select(".cursor-glow")[0];
            const moveX = gsap.quickTo(glow, "x", {
              duration: 0.55,
              ease: "power3.out",
            });
            const moveY = gsap.quickTo(glow, "y", {
              duration: 0.55,
              ease: "power3.out",
            });
            const moveGlow = (event: PointerEvent) => {
              const bounds = contact.getBoundingClientRect();
              moveX(event.clientX - bounds.left);
              moveY(event.clientY - bounds.top);
            };
            contact.addEventListener("pointermove", moveGlow);
            return () => contact.removeEventListener("pointermove", moveGlow);
          }
        },
        pageRef,
      );

      disposeAnimations = () => media.revert();
    }

    void startAnimations().catch(() => {
      document.documentElement.removeAttribute("data-motion");
    });

    return () => {
      disposed = true;
      document.documentElement.removeAttribute("data-motion");
      disposeAnimations();
    };
  }, []);

  return (
    <main ref={pageRef}>
      <div className="scroll-progress" aria-hidden="true" />

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label={copy.header.home}>
          风雨<span>®</span>
        </a>
        <p className="availability">
          <span /> {copy.header.availability}
        </p>
        <div className="header-end">
          <nav aria-label={copy.header.navLabel}>
            <a href="#services">{copy.header.services}</a>
            <a href="#partners">{copy.header.partners}</a>
            <a href="#case-study">{copy.header.caseStudy}</a>
            <a href="#process">{copy.header.process}</a>
            <a href="#about">{copy.header.about}</a>
            <a className="nav-cta" href="#contact">
              <span className="nav-cta-full">{copy.header.contact}</span>
              <span className="nav-cta-short">{copy.header.contactShort}</span>
              <span aria-hidden="true">→</span>
            </a>
          </nav>
          <div
            className="header-controls"
            role="group"
            aria-label={copy.preferences.group}
          >
            <button
              className="preference-control language-control"
              type="button"
              onClick={toggleLocale}
              aria-label={
                locale === "zh"
                  ? copy.preferences.switchToEnglish
                  : copy.preferences.switchToChinese
              }
            >
              <span aria-hidden="true" lang={locale === "zh" ? "en" : "zh-CN"}>
                {locale === "zh" ? "EN" : "中"}
              </span>
            </button>
            <button
              className="preference-control theme-control"
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? copy.preferences.switchToLight
                  : copy.preferences.switchToDark
              }
              aria-pressed={theme === "light"}
              title={
                theme === "dark"
                  ? copy.preferences.switchToLight
                  : copy.preferences.switchToDark
              }
            >
              <span
                className={`theme-symbol theme-symbol--${theme}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {preferenceAnnouncement}
        </span>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orbit" aria-hidden="true">
          <span />
        </div>
        <p className="hero-index hero-reveal" aria-hidden="true">
          {copy.hero.index}
        </p>
        <div className="hero-kicker hero-reveal">
          <span>{copy.hero.kicker}</span>
          <span>{copy.hero.kickerAside}</span>
        </div>
        <h1>
          {copy.hero.title.map((line, index) => (
            <span className="hero-line-wrap" key={index}>
              {line.outlined ? (
                <em className="hero-line">{line.text}</em>
              ) : (
                <span className="hero-line">{line.text}</span>
              )}
            </span>
          ))}
        </h1>
        <div className="hero-bottom">
          <div className="hero-copy">
            <span className="copy-number">{copy.hero.label}</span>
            <p>{copy.hero.intro}</p>
          </div>
          <a className="primary-button" href="#contact">
            <span>{copy.hero.cta}</span>
            <span className="button-arrow" aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="scroll-cue hero-reveal" aria-hidden="true">
          <span /> {copy.hero.scroll}
        </div>
      </section>

      <section className="ticker" aria-label={copy.ticker.aria}>
        <div className="ticker-track">
          {[0, 1, 2].map((group) => (
            <div className="ticker-group" key={group} aria-hidden={group > 0}>
              {copy.ticker.items.map((item, index) => (
                <span className="ticker-item" key={`${group}-${index}`}>
                  <span>{item}</span>
                  <i aria-hidden="true" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="section services" id="services">
        <div className="section-heading">
          <div className="section-label section-reveal">
            <span>01</span>
            <p>{copy.servicesSection.label}<br />{copy.servicesSection.labelLocal}</p>
          </div>
          <div className="section-title section-reveal">
            <p className="kicker">{copy.servicesSection.kicker}</p>
            <h2>{copy.servicesSection.title[0]}<br />{copy.servicesSection.title[1]}</h2>
          </div>
        </div>

        <div className="service-list">
          {copy.services.map((service) => (
            <a
              className="service-card"
              href="#contact"
              key={service.id}
              aria-label={`${copy.serviceAria}: ${service.title}`}
            >
              <div className="service-number">{service.number}</div>
              <div className="service-main">
                <p className="service-type">{service.tag}</p>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
              <ul>
                {service.items.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
              <span className="card-arrow" aria-hidden="true">
                <span className="card-arrow-glyph">↗</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="capability-section">
        <div className="capability-intro section-reveal">
          <div className="section-label dark-label">
            <span>02</span>
            <p>{copy.capabilitiesSection.label}<br />{copy.capabilitiesSection.labelLocal}</p>
          </div>
          <h2>{copy.capabilitiesSection.title.map((line) => <span key={line}>{line}<br /></span>)}</h2>
          <p>{copy.capabilitiesSection.intro}</p>
        </div>
        <div className="capability-grid">
          {copy.capabilities.map((capability) => (
            <article className="capability-card" key={capability.id}>
              <span>{capability.number}</span>
              <div className="capability-dot" aria-hidden="true" />
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section partners" id="partners" aria-labelledby="partners-title">
        <div className="section-heading partner-heading">
          <div className="section-label section-reveal">
            <span>03</span>
            <p>{copy.partners.label}<br />{copy.partners.labelLocal}</p>
          </div>
          <div className="section-title section-reveal">
            <p className="kicker">{copy.partners.kicker}</p>
            <h2 id="partners-title">{copy.partners.title[0]}<br />{copy.partners.title[1]}</h2>
            <p className="partner-intro">{copy.partners.intro}</p>
          </div>
        </div>
        <div className="partner-wall" aria-label={copy.partners.aria}>
          {copy.partners.tiles.map((tile) => {
            const content = (
              <>
                <span className="brand-eyebrow">{tile.eyebrow}</span>
                <strong className="brand-mark">{tile.mark}</strong>
                <span className="brand-name">{tile.name}</span>
                <small>{tile.note}</small>
                {tile.kind === "cta" ? <span className="brand-arrow" aria-hidden="true">→</span> : null}
              </>
            );
            return tile.kind === "cta" ? (
              <a className="brand-tile brand-tile--cta" href="#contact" key={tile.id}>{content}</a>
            ) : (
              <article className={`brand-tile brand-tile--${tile.kind}`} key={tile.id}>{content}</article>
            );
          })}
        </div>
      </section>

      <section className="section case-study" id="case-study" aria-labelledby="case-study-title">
        <div className="section-heading case-heading">
          <div className="section-label section-reveal">
            <span>04</span>
            <p>{copy.caseStudy.label}<br />{copy.caseStudy.labelLocal}</p>
          </div>
          <div className="section-title section-reveal">
            <p className="kicker">{copy.caseStudy.kicker}</p>
            <h2 id="case-study-title">{copy.caseStudy.title[0]}<br />{copy.caseStudy.title[1]}</h2>
            <p className="case-intro">{copy.caseStudy.intro}</p>
          </div>
        </div>

        <div
          className="case-carousel section-reveal"
          role="region"
          aria-roledescription="carousel"
          aria-labelledby="case-study-title"
          data-direction={caseDirection}
        >
          <p className="sr-only" id="case-carousel-instructions">
            {copy.caseStudy.keyboardHint}
          </p>
          <div className="case-carousel-bar">
            <button
              className="case-carousel-button case-carousel-prev"
              type="button"
              aria-label={copy.caseStudy.previous}
              aria-controls="case-carousel-track"
              aria-describedby="case-carousel-instructions"
              onClick={() => goToCase(activeCaseIndex - 1, "previous")}
              onKeyDown={handleCaseCarouselKeyDown}
              aria-keyshortcuts="ArrowLeft ArrowRight Home End"
            >
              <span aria-hidden="true">←</span>
            </button>
            <div className="case-carousel-position" aria-hidden="true">
              <span>{String(activeCaseIndex + 1).padStart(2, "0")} / {String(caseCount).padStart(2, "0")}</span>
              <strong>{copy.caseStudy.projects[activeCaseIndex].purpose}</strong>
            </div>
            <button
              className="case-carousel-button case-carousel-next"
              type="button"
              aria-label={copy.caseStudy.next}
              aria-controls="case-carousel-track"
              aria-describedby="case-carousel-instructions"
              onClick={() => goToCase(activeCaseIndex + 1, "next")}
              onKeyDown={handleCaseCarouselKeyDown}
              aria-keyshortcuts="ArrowLeft ArrowRight Home End"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="case-carousel-viewport">
            <div
              className="case-carousel-track"
              id="case-carousel-track"
            >
              {copy.caseStudy.projects.map((project, index) => {
                const caseState = index === activeCaseIndex
                  ? "active"
                  : index === previousCaseIndex
                    ? "exiting"
                    : "inactive";

                return (
                  <article
                    className="system-case"
                    id={`case-${project.id}`}
                    data-case-id={project.id}
                    data-state={caseState}
                    data-active={index === activeCaseIndex ? "true" : "false"}
                    key={project.id}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} / ${caseCount}: ${project.title}`}
                    aria-hidden={index !== activeCaseIndex}
                  >
                  <figure className="system-case-media">
                    <div className="system-case-media-meta">
                      <span>{copy.caseStudy.imageLabel}</span>
                      <span>{project.number} / {project.year}</span>
                    </div>
                    <div className="system-case-image-frame">
                      {/* A plain image keeps the same self-hosted asset path in both the Sites and GitHub Pages builds. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="system-case-image"
                        src={project.imageSrc}
                        alt={project.imageAlt}
                        width={project.imageWidth}
                        height={project.imageHeight}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    </div>
                    <div className="system-case-flow" aria-hidden="true">
                      {project.flow.map((node, flowIndex) => (
                        <span className="system-case-flow-item" key={node}>
                          <span>{node}</span>
                          {flowIndex < project.flow.length - 1 ? <i>→</i> : null}
                        </span>
                      ))}
                    </div>
                    <figcaption>{project.imageNote}</figcaption>
                  </figure>

                  <div className="system-case-content">
                    <span className="system-case-purpose">{project.purpose}</span>
                    <p className="system-case-eyebrow">
                      {project.number} / {project.year} / {project.category}
                    </p>
                    <h3>{project.title}</h3>
                    <p className="system-case-summary">{project.summary}</p>

                    <dl className="system-case-facts">
                      {project.facts.map((fact) => (
                        <div key={fact.id}>
                          <dt>{fact.label}</dt>
                          <dd>{fact.value}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="system-case-role">
                      <span>{copy.caseStudy.roleLabel}</span>
                      <strong>{project.role}</strong>
                      <p>{project.roleNote}</p>
                    </div>

                    <ul className="system-case-tags" aria-label={project.tagsLabel}>
                      {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>

                    <a
                      className="system-case-cta"
                      href="#contact"
                      aria-label={`${copy.caseStudy.discuss}: ${project.title}`}
                      tabIndex={index === activeCaseIndex ? 0 : -1}
                    >
                      {copy.caseStudy.discuss}<span aria-hidden="true">→</span>
                    </a>
                  </div>
                  </article>
                );
              })}
            </div>
          </div>
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {caseAnnouncement}
          </p>
        </div>
        <p className="case-disclosure section-reveal">{copy.caseStudy.disclosure}</p>
      </section>

      <section className="section process" id="process">
        <div className="section-heading compact">
          <div className="section-label section-reveal"><span>05</span><p>{copy.process.label}<br />{copy.process.labelLocal}</p></div>
          <div className="section-title section-reveal"><p className="kicker">{copy.process.kicker}</p><h2>{copy.process.title[0]}<br />{copy.process.title[1]}</h2></div>
        </div>
        <ol className="steps">
          {copy.process.steps.map((step) => (
            <li className="section-reveal" key={step.id}>
              <span className="step-number">{step.number}</span><span className="step-tag">{step.tag}</span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="about" id="about">
        <p className="about-mark" aria-hidden="true">风雨</p>
        <div className="about-copy section-reveal">
          <div className="section-label blue-label"><span>06</span><p>{copy.about.label}<br />{copy.about.labelLocal}</p></div>
          <blockquote>{copy.about.quote}</blockquote>
          <p>{copy.about.body}</p>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="cursor-glow" aria-hidden="true" />
        <div className="contact-head section-reveal">
          <div className="section-label dark-label"><span>07</span><p>{copy.contact.label}<br />{copy.contact.labelLocal}</p></div>
          <p className="contact-status"><span /> {copy.contact.status}</p>
        </div>
        <h2 className="section-reveal">{copy.contact.titleStart}<br /><em>{copy.contact.titleEnd}</em></h2>
        <div className="contact-bottom section-reveal">
          <div className="contact-copy">
            <p>{copy.contact.body}</p>
            <div className="contact-email-list" aria-label={copy.contact.emailListLabel}>
              {contactEmails.map(({ label, address }) => (
                <a
                  className="contact-email"
                  href={`mailto:${address}?subject=${encodeURIComponent(copy.contact.mailSubject)}&body=${encodeURIComponent(collaborationBrief)}`}
                  key={address}
                  aria-label={`${copy.contact.emailAria} ${address} (${label})`}
                >
                  <span className="contact-email-label">{label}</span><strong>{address}</strong><span className="contact-email-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
          <button className="contact-link" type="button" onClick={copyCollaborationBrief} disabled={copyState === "copying"}>
            <span>{copyState === "copied" ? copy.contact.copyDone : copyState === "failed" ? copy.contact.copyFailed : copyState === "copying" ? copy.contact.copyWorking : copy.contact.copyIdle}</span>
            <span className="contact-action-code" aria-hidden="true">{copyState === "copied" ? copy.contact.copyCodeDone : copyState === "failed" ? copy.contact.copyCodeFailed : copyState === "copying" ? copy.contact.copyCodeWorking : copy.contact.copyCodeIdle}</span>
          </button>
          <span className="sr-only" role="status" aria-live="polite">{copyState === "copied" ? copy.contact.liveDone : copyState === "failed" ? copy.contact.liveFailed : ""}</span>
        </div>
      </section>

      <footer>
        <p>风雨® — FORWARD DEPLOYED ENGINEER</p>
        <p>{copy.footer.tagline}</p>
        <a href="#top">{copy.footer.backToTop}</a>
      </footer>
    </main>
  );
}
