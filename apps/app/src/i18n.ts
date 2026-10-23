// UI language (§9, Phase 10): only the active catalogue is loaded (§7 lazy locales), before the
// first render and again on a language change. `t` is module-level so helpers outside
// components (sheets, labels) can use it; the app shell remounts on a language change.
import type { Lang } from "@panchang/calendar";
import {
  interpolate,
  type DisplayLang,
  type MessageKey,
  type Messages,
} from "@panchang/i18n";

let messages: Messages | undefined;
let current: DisplayLang = "en";

/** v1 ships Gujarati and English; Hindi (v2) falls back to English. */
export const displayLang = (l: Lang): DisplayLang => (l === "gu" ? "gu" : "en");

export async function loadLanguage(l: Lang): Promise<void> {
  const d = displayLang(l);
  messages =
    d === "gu"
      ? (await import("@panchang/i18n/gu")).gu
      : (await import("@panchang/i18n/en")).en;
  current = d;
}

/** The language of the loaded catalogue. */
export const lang = () => current;

export function t(
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  if (!messages) throw new Error("t() called before loadLanguage()");
  return interpolate(messages[key], params, current);
}

/** First-run language before onboarding asks: Gujarati if the device prefers it. */
export const deviceLang = (): Lang =>
  navigator.languages.some((l) => l.startsWith("gu")) ? "gu" : "en";
