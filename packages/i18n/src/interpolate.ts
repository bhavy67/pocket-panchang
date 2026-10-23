import { guDigits } from "./digits";
import type { DisplayLang } from "./index";

/** Fills "{name}" placeholders; numbers are written in the language's digits. */
export function interpolate(
  message: string,
  params: Record<string, string | number> = {},
  lang: DisplayLang = "en",
): string {
  return message.replace(/\{(\w+)\}/g, (whole, key: string) => {
    const v = params[key];
    if (v === undefined) return whole;
    return typeof v === "number" && lang === "gu"
      ? guDigits(String(v))
      : String(v);
  });
}
