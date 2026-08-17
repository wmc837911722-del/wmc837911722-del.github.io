import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import Home from "../../app/page";
import "../../app/globals.css";
import "./github-pages.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element");
}

const app = (
  <StrictMode>
    <Home />
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
