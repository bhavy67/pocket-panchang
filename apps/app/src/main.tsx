import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { router } from "@/router";
import "@/styles/app.css";

// Theme = palette × mode (ADR 0017). Settings (Phase 7) will own the palette and a
// mode override; until then the mode follows the system.
const html = document.documentElement;
html.dataset.palette = "calm";
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const applyMode = () => {
  html.dataset.mode = prefersDark.matches ? "dark" : "light";
};
applyMode();
prefersDark.addEventListener("change", applyMode);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Missing #root element");

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
