"use client";

import { useEffect, useRef, useState } from "react";

const collaborationBrief = `你好风雨，我想沟通一个 FDE / AI 落地项目。

业务场景：
当前问题：
期望结果：
计划时间：`;

const collaborationMailSubject = "FDE / AI 落地项目合作咨询";
const contactEmails = [
  { label: "QQ MAIL", address: "837911722@qq.com" },
  { label: "GMAIL", address: "wmc837911722@gmail.com" },
];

const services = [
  {
    number: "01",
    tag: "DISCOVERY & STRATEGY",
    title: "业务诊断与方案共创",
    description:
      "进入真实业务现场，和团队一起拆解目标、流程与约束，找到 AI 最值得落地的切入点。",
    items: [
      "业务流程与痛点访谈",
      "AI 机会与风险识别",
      "解决方案架构与价值定义",
    ],
  },
  {
    number: "02",
    tag: "PROTOTYPE & VALIDATE",
    title: "AI 原型与智能体验证",
    description:
      "用最短路径做出可用原型，在真实数据和用户反馈中验证效果，而不是停留在概念演示。",
    items: ["工作流与智能体原型", "工具调用与数据接入", "效果评测与安全边界"],
  },
  {
    number: "03",
    tag: "INTEGRATE & DEPLOY",
    title: "生产集成与工程交付",
    description:
      "把验证通过的方案接入现有系统、数据与权限体系，完成从原型到生产的最后一公里。",
    items: ["全栈产品开发", "企业系统与模型集成", "测试、发布与可观测性"],
  },
  {
    number: "04",
    tag: "ADOPT & ITERATE",
    title: "落地采用与持续迭代",
    description:
      "围绕真实使用结果持续优化体验、流程与模型，让解决方案被团队采用并长期产生价值。",
    items: ["使用反馈与数据复盘", "流程与模型持续优化", "能力沉淀与团队交接"],
  },
];

const capabilities = [
  [
    "01",
    "业务现场共创",
    "与一线用户和业务负责人并肩，把模糊诉求转成可验证问题。",
  ],
  ["02", "AI 快速原型", "把模型、工具和数据组合成可体验、可评测的工作流。"],
  ["03", "全栈系统集成", "连接前端、后端、企业系统与 AI 能力，打通关键链路。"],
  [
    "04",
    "生产级交付",
    "覆盖权限、评测、日志、发布与迭代，让方案稳定进入生产。",
  ],
];

const steps = [
  [
    "01",
    "DISCOVER",
    "深入现场，定义问题",
    "对齐业务目标、用户流程、数据条件与成功标准。",
  ],
  [
    "02",
    "PROTOTYPE",
    "快速构建，真实验证",
    "用可工作的原型验证关键假设，尽早暴露风险。",
  ],
  [
    "03",
    "DEPLOY",
    "接入系统，稳定上线",
    "完成产品化、系统集成、测试发布与运行保障。",
  ],
  [
    "04",
    "ITERATE",
    "观察使用，持续迭代",
    "根据业务结果和真实反馈优化流程、体验与模型。",
  ],
];

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);
  const copyResetRef = useRef<number | null>(null);
  const [copyState, setCopyState] = useState<
    "idle" | "copying" | "copied" | "failed"
  >("idle");

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

  useEffect(
    () => () => {
      if (copyResetRef.current !== null) {
        window.clearTimeout(copyResetRef.current);
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
                ".hero-line, .hero-reveal, .section-reveal, .service-card, .capability-card",
              ),
              {
                clearProps: "all",
              },
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
        <a className="wordmark" href="#top" aria-label="风雨首页">
          风雨<span>®</span>
        </a>
        <p className="availability">
          <span /> AVAILABLE FOR FDE ENGAGEMENTS
        </p>
        <nav aria-label="主导航">
          <a href="#services">服务</a>
          <a href="#process">方法</a>
          <a href="#about">关于</a>
          <a className="nav-cta" href="#contact">
            聊聊合作 <span aria-hidden="true">→</span>
          </a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orbit" aria-hidden="true">
          <span />
        </div>
        <p className="hero-index hero-reveal" aria-hidden="true">
          DISCOVER / PROTOTYPE / DEPLOY / ITERATE — 2026
        </p>
        <div className="hero-kicker hero-reveal">
          <span>FORWARD DEPLOYED ENGINEER / 前沿部署工程师</span>
          <span>AI SOLUTIONS / PRODUCT / DELIVERY</span>
        </div>
        <h1>
          <span className="hero-line-wrap">
            <span className="hero-line">深入业务现场，</span>
          </span>
          <span className="hero-line-wrap">
            <em className="hero-line">把 AI 变成</em>
          </span>
          <span className="hero-line-wrap">
            <span className="hero-line">可运行的结果。</span>
          </span>
        </h1>
        <div className="hero-bottom">
          <div className="hero-copy">
            <span className="copy-number">01 / INTRODUCTION</span>
            <p>
              我是风雨，一名
              FDE。我与业务团队并肩，从问题定义到原型验证，再到生产系统集成，完成
              AI 解决方案落地的最后一公里。
            </p>
          </div>
          <a className="primary-button" href="#services">
            <span>查看 FDE 工作方式</span>
            <span className="button-arrow" aria-hidden="true">
              ↓
            </span>
          </a>
        </div>
        <div className="scroll-cue hero-reveal" aria-hidden="true">
          <span /> SCROLL TO EXPLORE
        </div>
      </section>

      <section className="ticker" aria-label="核心能力">
        <div className="ticker-track">
          {[0, 1, 2].map((group) => (
            <div className="ticker-group" key={group} aria-hidden={group > 0}>
              <span>业务共创</span>
              <i />
              <span>AI 原型</span>
              <i />
              <span>系统集成</span>
              <i />
              <span>生产部署</span>
              <i />
              <span>持续迭代</span>
              <i />
            </div>
          ))}
        </div>
      </section>

      <section className="section services" id="services">
        <div className="section-heading">
          <div className="section-label section-reveal">
            <span>01</span>
            <p>
              SERVICES
              <br />
              服务能力
            </p>
          </div>
          <div className="section-title section-reveal">
            <p className="kicker">FROM FIELD TO PRODUCTION</p>
            <h2>
              从业务现场出发，
              <br />让 AI 真正进入生产。
            </h2>
          </div>
        </div>

        <div className="service-list">
          {services.map((service) => (
            <a
              className="service-card"
              href="#contact"
              key={service.number}
              aria-label={`了解并咨询：${service.title}`}
            >
              <div className="service-number">{service.number}</div>
              <div className="service-main">
                <p className="service-type">{service.tag}</p>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
              <ul>
                {service.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
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
            <p>
              CAPABILITIES
              <br />
              核心能力
            </p>
          </div>
          <h2>
            既能进入
            <br />
            业务现场，
            <br />
            也能走到生产。
          </h2>
          <p>
            FDE 连接客户、业务、产品与工程。我把不确定的 AI
            机会拆成可验证原型，再把有效原型做成稳定系统。
          </p>
        </div>
        <div className="capability-grid">
          {capabilities.map(([number, title, description]) => (
            <article className="capability-card" key={number}>
              <span>{number}</span>
              <div className="capability-dot" aria-hidden="true" />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section process" id="process">
        <div className="section-heading compact">
          <div className="section-label section-reveal">
            <span>03</span>
            <p>
              PROCESS
              <br />
              合作流程
            </p>
          </div>
          <div className="section-title section-reveal">
            <p className="kicker">DISCOVER. PROTOTYPE. DEPLOY. ITERATE.</p>
            <h2>
              一条从现场问题到
              <br />
              生产结果的闭环。
            </h2>
          </div>
        </div>
        <ol className="steps">
          {steps.map(([number, tag, title, description]) => (
            <li className="section-reveal" key={number}>
              <span className="step-number">{number}</span>
              <span className="step-tag">{tag}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="about" id="about">
        <p className="about-mark" aria-hidden="true">
          风雨
        </p>
        <div className="about-copy section-reveal">
          <div className="section-label blue-label">
            <span>04</span>
            <p>
              PHILOSOPHY
              <br />
              我的理念
            </p>
          </div>
          <blockquote>
            “FDE 的价值，不是带着标准答案，而是和团队一起把答案跑通。”
          </blockquote>
          <p>
            我相信 AI
            落地是一项跨越业务、产品和工程的协作工作。好的方案既要理解人的需求与组织现实，也要经得起数据、权限、稳定性和长期维护的检验。
          </p>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="cursor-glow" aria-hidden="true" />
        <div className="contact-head section-reveal">
          <div className="section-label dark-label">
            <span>05</span>
            <p>
              CONTACT
              <br />
              开始合作
            </p>
          </div>
          <p className="contact-status">
            <span /> OPEN FOR CONVERSATION
          </p>
        </div>
        <h2 className="section-reveal">
          有一个 AI 场景，
          <br />
          需要<em>真正落地</em>？
        </h2>
        <div className="contact-bottom section-reveal">
          <div className="contact-copy">
            <p>
              无论是尚未验证的 AI
              机会，还是卡在原型、集成或上线阶段的项目，都可以先聊聊。直接发邮件，或先复制一份简洁的合作沟通模板。
            </p>
            <div className="contact-email-list" aria-label="联系邮箱">
              {contactEmails.map(({ label, address }) => (
                <a
                  className="contact-email"
                  href={`mailto:${address}?subject=${encodeURIComponent(collaborationMailSubject)}&body=${encodeURIComponent(collaborationBrief)}`}
                  key={address}
                  aria-label={`通过 ${label} 发送合作邮件到 ${address}`}
                >
                  <span className="contact-email-label">{label}</span>
                  <strong>{address}</strong>
                  <span className="contact-email-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
          <button
            className="contact-link"
            type="button"
            onClick={copyCollaborationBrief}
            disabled={copyState === "copying"}
          >
            <span>
              {copyState === "copied"
                ? "合作模板已复制"
                : copyState === "failed"
                  ? "复制失败，请重试"
                  : copyState === "copying"
                    ? "正在复制合作模板"
                  : "复制合作沟通模板"}
            </span>
            <span className="contact-action-code" aria-hidden="true">
              {copyState === "copied"
                ? "COPIED"
                : copyState === "failed"
                  ? "RETRY"
                  : copyState === "copying"
                    ? "COPYING"
                  : "COPY BRIEF"}
            </span>
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {copyState === "copied"
              ? "合作沟通模板已复制到剪贴板"
              : copyState === "failed"
                ? "复制失败，请重试"
                : ""}
          </span>
        </div>
      </section>

      <footer>
        <p>风雨® — FORWARD DEPLOYED ENGINEER</p>
        <p>把 AI 部署进真实业务现场。</p>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
