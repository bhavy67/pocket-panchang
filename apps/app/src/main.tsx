import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { deviceLang, lang, loadLanguage } from "@/i18n";
import { yearMonthOf } from "@/lib/year-month";
import { pruneMonthCache, queryClient, seedMonth } from "@/queries";
import { isNative } from "@/ports";
import { rescheduleReminders } from "@/reschedule";
import { router, todayIn } from "@/router";
import {
  installCardState,
  listenForInstall,
  saveInstallCardState,
  usePwa,
} from "@/pwa";
import { hydrateSettings, persistSettings, useSettings } from "@/settings";
import { withFade } from "@/lib/fade";
import "@/styles/app.css";

// Android: the WebView's own text zoom is off (MainActivity), so the system font size is
// applied here as rem, keeping px caps intact. The web gets it from the browser already.
const osFontScale = isNative()
  ? await import("@/native/android")
      .then((n) => n.DeviceHealth.fontScale())
      .then((r) => r.scale)
      .catch(() => 1)
  : 1;

// Theme = palette × mode (ADR 0017), both from settings; "system" follows the OS.
const html = document.documentElement;
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
// Lab only (/lab/themes): ?palette=raat&mode=dark previews a theme without touching saved
// settings; ?lang=gu and ?scale=2 preview language and text size.
const preview = __LAB__
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
  html.style.fontSize = `${Number(preview.get("scale") ?? s?.textScale ?? 1) * osFontScale * 100}%`;
  // Browser chrome follows the palette's surface token.
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      getComputedStyle(html).getPropertyValue("--surface").trim(),
    );
  if (isNative())
    void import("@/native/android").then(({ syncStatusBar }) =>
      syncStatusBar(html.dataset.mode === "dark" ? "dark" : "light"),
    );
};
prefersDark.addEventListener("change", () => withFade(applyTheme));
// Every palette shares one font/radii/shadow system (2026-10-27), so a palette/mode change is
// only ever a recolour — no font to preload, just the fade so it isn't a hard jump.
useSettings.subscribe(({ settings: s }, { settings: prev }) => {
  if (!s) return;
  if (prev && (s.palette !== prev.palette || s.theme !== prev.theme))
    withFade(applyTheme);
  else applyTheme();
});

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
await loadLanguage(
  preview.get("lang") === "gu" || preview.get("lang") === "en"
    ? (preview.get("lang") as "gu" | "en")
    : (settings?.language ?? deviceLang()),
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

// The boot splash (index.html) fades out once Today has actually painted, not just mounted:
// two rAFs guarantee a committed frame has shown before it starts hiding.
requestAnimationFrame(() =>
  requestAnimationFrame(() => {
    const splash = document.getElementById("boot-splash");
    if (!splash) return;
    // Belt and braces: transitionend never fires under prefers-reduced-motion (no transition).
    splash.addEventListener("transitionend", () => splash.remove(), {
      once: true,
    });
    setTimeout(() => splash.remove(), 250);
    splash.classList.add("hide");
  }),
);

if (isNative()) {
  // Android: Capacitor serves the bundled assets from the APK, so no service worker (it would
  // only cache the same files twice). Reminders are scheduled natively instead.
  void import("@/native/android").then(({ setupLifecycle }) =>
    setupLifecycle({
      canGoBack: () => router.history.canGoBack(),
      goBack: () => router.history.back(),
      goHome: () => void router.navigate({ to: "/" }),
      isHome: () =>
        ["/", "/onboarding"].includes(router.state.location.pathname),
      onResume: () => void rescheduleReminders(),
      openEvent: (id) =>
        void router.navigate({ to: "/events/$id", params: { id } }),
    }),
  );
  // Off the cold-start path: the worker serves the first screen first (§7).
  setTimeout(() => void rescheduleReminders(), 3000);
  // Anything that moves a family date or its text: rebuild the reminder window.
  useSettings.subscribe(({ settings: s }, { settings: prev }) => {
    if (
      s &&
      prev &&
      (s.householdPolicy !== prev.householdPolicy ||
        s.observanceLocation !== prev.observanceLocation ||
        s.location !== prev.location ||
        s.reminderTime !== prev.reminderTime ||
        s.language !== prev.language)
    )
      void rescheduleReminders();
  });
} else {
  // Service worker (vite-plugin-pwa): a new version waits until the user taps "Update now".
  listenForInstall();
  const updateSW = registerSW({
    onNeedRefresh: () => usePwa.setState({ update: () => updateSW(true) }),
  });
  const visits = installCardState();
  saveInstallCardState({ ...visits, visits: visits.visits + 1 });
}

// After first render: housekeeping off the cold-start path.
pruneMonthCache().catch((e: unknown) =>
  console.error("Pruning month cache failed:", e),
);
