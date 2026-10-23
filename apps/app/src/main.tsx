import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { deviceLang, lang, loadLanguage } from "@/i18n";
import { yearMonthOf } from "@/lib/year-month";
import { pruneMonthCache, queryClient, seedMonth } from "@/queries";
import { router, todayIn } from "@/router";
import {
  installCardState,
  listenForInstall,
  saveInstallCardState,
  usePwa,
} from "@/pwa";
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
  // The page language is the loaded UI language; mixed-script fragments carry their own lang.
  html.lang = lang();
  // In-app text size on top of the OS/browser setting: rem-based layout scales with it.
  html.style.fontSize = `${(s?.textScale ?? 1) * 100}%`;
  // Browser chrome follows the palette's surface token.
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      getComputedStyle(html).getPropertyValue("--surface").trim(),
    );
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
// Only the active language's strings are fetched (§7), before the first render.
await loadLanguage(settings?.language ?? deviceLang());
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

// Service worker (vite-plugin-pwa): a new version waits until the user taps "Update now".
listenForInstall();
const updateSW = registerSW({
  onNeedRefresh: () => usePwa.setState({ update: () => updateSW(true) }),
});
const visits = installCardState();
saveInstallCardState({ ...visits, visits: visits.visits + 1 });

// After first render: housekeeping off the cold-start path.
pruneMonthCache().catch((e: unknown) =>
  console.error("Pruning month cache failed:", e),
);
