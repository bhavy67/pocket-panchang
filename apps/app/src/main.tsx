import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { yearMonthOf } from "@/lib/year-month";
import { pruneMonthCache, queryClient, seedMonth } from "@/queries";
import { router, todayIn } from "@/router";
import { hydrateSettings, persistSettings, useSettings } from "@/settings";
import "@/styles/app.css";

// Theme = palette × mode (ADR 0017), both from settings; "system" follows the OS.
const html = document.documentElement;
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
// Dev only: ?palette=mandir&mode=dark previews a theme without touching saved settings, until
// the Settings screen (Phase 9) offers the real switch.
const preview = import.meta.env.DEV
  ? new URLSearchParams(location.search)
  : new URLSearchParams();
const applyTheme = () => {
  const s = useSettings.getState().settings;
  const theme = preview.get("mode") ?? s?.theme ?? "system";
  html.dataset.palette = preview.get("palette") ?? s?.palette ?? "calm";
  html.dataset.mode =
    theme === "system" ? (prefersDark.matches ? "dark" : "light") : theme;
  html.lang = s?.language ?? "en";
};
prefersDark.addEventListener("change", applyTheme);
useSettings.subscribe(applyTheme);

// Cold start (§7): settings and today's cached month from IndexedDB before the first render.
const settings = await hydrateSettings().catch((e: unknown) => {
  console.error("Reading settings failed:", e);
  return null;
});
if (settings)
  await seedMonth(settings, yearMonthOf(todayIn(settings))).catch(
    (e: unknown) => console.error("Reading month cache failed:", e),
  );
applyTheme();
persistSettings();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Missing #root element");

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);

// After first render: housekeeping off the cold-start path.
pruneMonthCache().catch((e: unknown) =>
  console.error("Pruning month cache failed:", e),
);
