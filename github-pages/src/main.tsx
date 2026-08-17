import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import CaseDetail from "../../app/case-detail";
import Home from "../../app/page";
import { getProject } from "../../app/seo";
import "../../app/globals.css";
import "./github-pages.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element");
}

const path = window.location.pathname.replace(/\/+$/, "") || "/";
const caseMatch = path.match(/^\/cases\/([^/]+)$/);
const caseId = caseMatch?.[1];
const page = caseId && getProject("zh", caseId)
  ? <CaseDetail caseId={caseId} locale="zh" />
  : <Home initialLocale={path === "/en" ? "en" : "zh"} />;

const app = (
  <StrictMode>
    {page}
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
