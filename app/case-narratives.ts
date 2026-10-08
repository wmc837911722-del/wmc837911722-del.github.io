import type { Locale } from "./site-copy";

type NarrativeItem = {
  title: string;
  body: string;
};

export type CaseNarrative = {
  problem: { heading: string; body: string; focus: string };
  scope: { heading: string; items: NarrativeItem[] };
  decisions: { heading: string; items: NarrativeItem[] };
  evidence: {
    heading: string;
    deliverablesHeading: string;
    deliverables: string[];
    availableHeading: string;
    available: string[];
    measurementNote: string;
  };
  boundaries: { heading: string; body: string };
};

const caseNarratives: Record<Locale, Record<string, CaseNarrative>> = {
  zh: {
    "interior-design-ai-platform": {
      problem: {
        heading: "让设计生成进入完整工作流",
        body: "面向室内设计师，项目需要将参考图导入、风格化出图、AI 生图与生视频、图像编辑和素材管理放进同一款 SaaS 产品。交付目标覆盖从设计输入、任务执行到结果管理的完整链路。",
        focus: "工程问题集中在多个模型与厂商的接入方式、异步任务状态，以及用户权益与运营管理如何接在同一条业务链路上。",
      },
      scope: {
        heading: "本人负责的具体范围",
        items: [
          { title: "用户端与运营管理端", body: "独立完成两个前端的开发，覆盖生成与编辑、模板中心、素材库、Agent 工作流及运营管理相关功能。" },
          { title: "Java 后端与业务链路", body: "独立完成后端开发与接口设计，连接模型 Provider、任务调度、结果回写，以及积分、VIP 和权益发放。" },
          { title: "从需求拆解到交付", body: "负责需求拆解、接口联调、异常排查、测试补全和交付。这里描述的是个人独立全栈交付范围。" },
        ],
      },
      decisions: {
        heading: "围绕任务链路做工程选择",
        items: [
          { title: "用 Provider 适配连接模型", body: "通过 Provider 适配接入 30+ 模型与厂商，统一模型参数、任务状态与异常处理，把不同生成能力纳入同一套产品流程。" },
          { title: "用 Redis Stream 承接异步任务", body: "任务提交后进入 Redis Stream 异步调度，再将生成结果回写。前端提交、后台执行与素材管理由任务链路衔接。" },
          { title: "把产品权益接入使用流程", body: "在生成能力之外，接通积分、VIP 与权益发放，并交付运营管理端，让 AI 功能与 SaaS 产品的日常管理一起落地。" },
        ],
      },
      evidence: {
        heading: "交付内容与公开证据",
        deliverablesHeading: "已记录的交付内容",
        deliverables: [
          "用户端、运营管理端与 Java 后端",
          "AI 出图 / 生视频、图像编辑、模板中心、素材库与 Agent 工作流",
          "模型适配、异步任务调度、结果回写及积分 / VIP / 权益链路",
        ],
        availableHeading: "本页可查看的证据",
        available: [
          "上方为公开「灵感广场」页面的匿名化实机截图，截取于 2026-08-18，可观察作品搜索、分类筛选和设计作品瀑布流。",
          "系统链路、技术栈和个人职责依据项目资料整理。页面截图只展示对应界面，不作为全部后台功能或运行效果的证明。",
        ],
        measurementNote: "本页未提供可复核的任务样本、统计周期与验收报告，因此不以成功率或业务收益数字作为交付证明。",
      },
      boundaries: {
        heading: "合作与证据边界",
        body: "客户品牌和敏感资料保持匿名。可公开的功能与个人交付范围不等于对新项目周期、成本或效果的承诺；类似项目需要根据模型供应商、业务流程与验收口径重新确认范围。",
      },
    },
    "enterprise-rag-mcp-assistant": {
      problem: {
        heading: "把文档知识与业务数据接起来",
        body: "企业问答场景同时涉及文档知识和 ERP 订单、WMS 库存及报表数据。项目目标是把这些信息接入统一问答链路，支持业务查询、知识溯源和分析报告生成。",
        focus: "工程问题在于衔接两类数据路径：文档经过解析与检索，业务数据通过 MCP 数据库工具查询，最终进入同一编排和回答流程。",
      },
      scope: {
        heading: "本人在团队中的参与范围",
        items: [
          { title: "检索与工具接入", body: "参与 Spring AI 接入、RAG 检索与 MCP 数据库工具开发，连接企业文档和 ERP / WMS 业务查询。" },
          { title: "问答链路与前端体验", body: "参与企业业务问答链路与流式回答开发，串联模型生成、Vue 3 展示和引用溯源。" },
          { title: "模型微调与部署", body: "参与模型微调部署。这里展示的是全栈与 AI 应用开发贡献，不将团队整体成果表述为个人独立交付。" },
        ],
      },
      decisions: {
        heading: "分别处理知识检索与业务查询",
        items: [
          { title: "用 RAG 连接文档知识", body: "PDF 文档经过解析后进入 Milvus 检索链路，为回答提供文档内容，并在前端保留引用溯源。项目资料记录接入 20 份 PDF。" },
          { title: "用 MCP 连接 ERP / WMS", body: "通过 MCP 数据库工具查询 ERP 订单、WMS 库存与相关报表数据，与文档检索一起接入 Spring AI 编排。" },
          { title: "将生成与流式展示衔接", body: "使用 Qwen3-72B 生成回答，通过 Vue 3 流式展示；模型侧使用 LLaMA-Factory / LoRA 进行业务样本微调，并参与相应部署。" },
        ],
      },
      evidence: {
        heading: "交付内容与公开证据",
        deliverablesHeading: "本人的参与交付范围",
        deliverables: [
          "Spring AI 接入、RAG 检索与 MCP 数据库工具",
          "企业业务问答链路与流式回答开发",
          "模型微调与部署",
        ],
        availableHeading: "本页可查看的证据",
        available: [
          "公开内容包括系统链路、技术栈、个人参与范围，以及 20 份 PDF 接入与 5,000 条业务样本微调的项目记录。",
          "上方图片是基于案例说明生成的概念视觉，不是真实产品截图，也不作为界面实现或验收通过的证据。",
        ],
        measurementNote: "5,000 条业务样本用于 LoRA 微调，不是独立评测集。本页未公开评测题集、评分口径或可复核的报告耗时记录，因此不据此声明问答准确率或报告生成速度。",
      },
      boundaries: {
        heading: "团队贡献与验证边界",
        body: "本人职责限定于所列参与范围，不代表独立完成整个企业系统。客户数据、团队成员和未获授权材料不公开；类似项目的数据权限、查询边界与评测方式需要单独确认，不能由本案例的技术选型推定。",
      },
    },
  },
  en: {
    "interior-design-ai-platform": {
      problem: {
        heading: "Make design generation a complete workflow",
        body: "The product brings reference import, style-controlled generation, AI image and video creation, image editing and asset management into one SaaS application for interior designers. Its delivery scope spans design inputs, task execution and result management.",
        focus: "The engineering work connects different model and vendor interfaces, asynchronous task state, user entitlements and operations management in one product flow.",
      },
      scope: {
        heading: "My specific responsibilities",
        items: [
          { title: "User app and operations console", body: "Independently developed both frontends, covering generation and editing, templates, the asset library, Agent workflows and operations features." },
          { title: "Java backend and business flows", body: "Independently developed the backend and APIs connecting model providers, task scheduling, result persistence, points, VIP and entitlement issuance." },
          { title: "Requirements through delivery", body: "Owned requirements breakdown, API integration, debugging, test completion and delivery. This is an independent full-stack delivery scope." },
        ],
      },
      decisions: {
        heading: "Engineer around the task lifecycle",
        items: [
          { title: "Connect models through provider adapters", body: "Provider adapters connect 30+ models and vendors, normalizing model parameters, task state and failure handling within a shared product flow." },
          { title: "Run asynchronous tasks with Redis Stream", body: "Submitted tasks enter Redis Stream scheduling, followed by result persistence. The task flow connects frontend submission, background execution and asset management." },
          { title: "Connect entitlements to product use", body: "Points, VIP and entitlement issuance sit alongside generation features and an operations console, covering the administration side of the SaaS product." },
        ],
      },
      evidence: {
        heading: "Deliverables and public evidence",
        deliverablesHeading: "Documented deliverables",
        deliverables: [
          "User app, operations console and Java backend",
          "AI image / video generation, image editing, templates, an asset library and Agent workflows",
          "Model adapters, asynchronous scheduling, result persistence and points / VIP / entitlement flows",
        ],
        availableHeading: "What you can inspect here",
        available: [
          "The image above is an anonymized live screenshot of the public inspiration gallery, captured on 2026-08-18. It shows work search, category filters and the design gallery.",
          "The system flow, stack and personal responsibilities are summarized from project material. The screenshot documents that interface; it does not verify every backend feature or operating outcome.",
        ],
        measurementNote: "This page does not provide auditable task samples, a measurement period or acceptance reports, so success-rate and business-impact figures are not used as delivery evidence.",
      },
      boundaries: {
        heading: "Collaboration and evidence boundaries",
        body: "Client branding and sensitive material remain anonymous. Published features and delivery scope do not establish a timeline, cost or outcome for another project. Model providers, business flows and acceptance criteria need their own scope discussion.",
      },
    },
    "enterprise-rag-mcp-assistant": {
      problem: {
        heading: "Connect document knowledge with business data",
        body: "Enterprise questions draw on documents as well as ERP orders, WMS inventory and reporting data. The project connects these sources in one answer flow for business queries, source-traceable answers and analytical reports.",
        focus: "The engineering work joins two data paths: documents go through parsing and retrieval; business data is queried through MCP database tools. Both feed the same orchestration and answer flow.",
      },
      scope: {
        heading: "My contribution within the team",
        items: [
          { title: "Retrieval and tool integration", body: "Contributed to Spring AI integration, RAG retrieval and MCP database tools connecting enterprise documents with ERP / WMS queries." },
          { title: "Answer flow and frontend experience", body: "Contributed to the enterprise Q&A workflow and streaming answers, connecting model generation with Vue 3 presentation and source citations." },
          { title: "Fine-tuning and deployment", body: "Contributed to model fine-tuning deployment. This describes a full-stack and AI application contribution within a team, not independent delivery of the complete system." },
        ],
      },
      decisions: {
        heading: "Give retrieval and business queries distinct paths",
        items: [
          { title: "Connect document knowledge through RAG", body: "PDF parsing feeds the Milvus retrieval flow, supplying document content for answers with source citations in the frontend. Project material records 20 PDFs ingested." },
          { title: "Connect ERP / WMS through MCP", body: "MCP database tools query ERP orders, WMS inventory and related reporting data, joining document retrieval in Spring AI orchestration." },
          { title: "Connect generation with streaming presentation", body: "Qwen3-72B generates answers for a Vue 3 streaming interface. The model work uses LLaMA-Factory / LoRA for business-sample fine-tuning and includes deployment contributions." },
        ],
      },
      evidence: {
        heading: "Deliverables and public evidence",
        deliverablesHeading: "My delivery contributions",
        deliverables: [
          "Spring AI integration, RAG retrieval and MCP database tools",
          "Enterprise Q&A workflow and streaming-answer development",
          "Model fine-tuning and deployment",
        ],
        availableHeading: "What you can inspect here",
        available: [
          "Public material covers the system flow, stack, personal contribution and project records of 20 PDFs ingested and 5,000 business samples used for fine-tuning.",
          "The image above is a concept visual based on the case description. It is not a real product screenshot or evidence of implementation or acceptance testing.",
        ],
        measurementNote: "The 5,000 business samples were used for LoRA fine-tuning, not an independent evaluation set. No evaluation questions, scoring method or auditable report-timing records are published here, so they do not establish answer accuracy or report-generation speed.",
      },
      boundaries: {
        heading: "Team contribution and validation boundaries",
        body: "My responsibilities are limited to the contributions listed here, rather than independent delivery of the entire enterprise system. Client data, team details and unapproved material remain private. Data permissions, query boundaries and evaluation methods require a separate discussion for another project.",
      },
    },
  },
};

export function getCaseNarrative(locale: Locale, caseId: string): CaseNarrative | undefined {
  return Object.hasOwn(caseNarratives[locale], caseId) ? caseNarratives[locale][caseId] : undefined;
}
