// Every festival has a Month-grid short name in both languages, ≤ 7 characters (graphemes).
import { FESTIVALS } from "@panchang/calendar";
import { festivalShortName } from "@panchang/i18n";
import { expect, it } from "vitest";

const graphemes = (s: string) =>
  [...new Intl.Segmenter("gu", { granularity: "grapheme" }).segment(s)].length;

it("has a short name ≤ 7 characters for every festival", () => {
  for (const f of FESTIVALS)
    for (const lang of ["en", "gu"] as const) {
      const n = festivalShortName(f.id, lang);
      expect(n, `${f.id} ${lang}`).toBeTruthy();
      expect(graphemes(n!), `${f.id} ${lang}: ${n}`).toBeLessThanOrEqual(7);
    }
});
