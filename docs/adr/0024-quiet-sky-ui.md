---
status: accepted
date: 2026-10-24
---

# 0024. "Quiet Sky" UI (supersedes the Phase 8 look)

Bhavy approved a new visual direction, **Quiet Sky**, for Phase 11.5: minimal and calm, with a live moon and one horizontal "Your day" ribbon instead of the dense glance card and vertical timeline. It replaces the Phase 8 look (`docs/design/screens.md` "Decisions established by the approved Today screen", brief §8.3 palette values and §8.4 typography). The token architecture (ADR 0017) is unchanged: palettes × light/dark are token values only, and contrast pairs are tested.

## Decisions

- **Type:** Manrope (variable 400–800) for Latin, Hind Vadodara (400/700) for Gujarati; the **Kagaz** palette swaps in Noto Serif + Noto Serif Gujarati (cached on first use, not precached). Noto Sans Devanagari stays for Hindi (v2). Numbers are tabular everywhere.
- **Palettes:** Calm, Raat, Kagaz, Mandir, Utsav, each light and dark (10 themes). New semantic tokens `moon-lit` and `moon-dark`.
- **Moon:** drawn from the real Moon–Sun elongation `e` (worker `moonPhase`): illuminated fraction (1 − cos e)/2, lit on the right while waxing. Decorative in palette previews; otherwise labelled ("N% lit, waxing").
- **Today:** header (city button, date + Gujarati weekday, Help pill) → hero (moon, tithi en + gu, "until …, then …") → **Right now** card whose headline is the next good Choghadiya *not overlapped by Rahu Kaal or Bhadra* (same rule as before), one-sentence why, and compact rows (good = circle-check, avoid = diamond-minus, each with a word) → **Your day** ribbon → Panchang 2×2 tiles + sun/moon strip → Coming up → footer.
- **Ribbon:** 8 equal day Choghadiya segments (they are equal eighths of daylight) with names; Amrut solid, good soft, bad soft avoid; a proportional lane beneath (Rahu Kaal solid, Yamaganda/Gulika faded, Bhadra hatched and drawn underneath); a Now chip and line; sunrise/noon/sunset; legend with times. Names switch to initials when the ribbon is narrower than 32em (large text). Every segment and legend item opens its detail sheet; the full day-and-night timeline stays on Day detail.
- **Avoid colour:** all avoid periods now use the avoid (inauspicious) hue, graded by solid / faded / hatched, still paired with shape and words. This replaces Phase 8's "only Rahu Kaal is red".
- **Month:** round prev/next, cells radius 12 with tithi, Punam/Amas moon dots, festival tint + name, "2×", today 2 px accent border; "This month" list below the key.
- **Family:** Next date as a solid accent card (this year's date, Pitru Paksha shraddh, reminder), Later rows with initial avatars (a flame for varsi), conventions in one sentence with Change.
- **Large text:** side-by-side rows give their text column a minimum basis, so side items wrap below instead of squeezing words.

## Consequences

Palette setting values are `calm | raat | kagaz | mandir | utsav`; the brief's §8.3/§8.4 tables are historical. Screenshots of Today, Month and Family in all 10 themes live in `docs/design/screens/` and are the store and README screenshots.
