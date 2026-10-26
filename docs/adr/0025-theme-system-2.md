---
status: accepted
date: 2026-10-26
---

# 0025. Theme system 2.0: a theme is a full visual system (extends ADR 0017, 0024)

The five Quiet Sky palettes (ADR 0024) differ only in colour and feel dated: heavy 800 weights, a border on every card, stacked tinted boxes, the same shapes everywhere. Phase 11.6 replaces them with six themes, each designed for a different user, and widens what a theme controls.

## Decisions

- **A theme sets more than colour.** Per theme (style block): font families (`--font-ui`, `--font-gu`, `--font-display`), weight scale (`--font-weight-hero|heading|strong|label`), `--tracking-display`, radius scale (`--radius-sm|md|cell|tile|lg|card`), density (`--spacing`, `--spacing-card|tile`), surface style (`--card-*`/`--tile-*` border, top divider, shadow, background), moon style (`--moon-size|rim|rim-width|glow`) and day-ribbon style (`--ribbon-h|gap|radius|end-radius|lane-h`). Per theme × mode (colour block): the ADR 0017 colour set plus `card-bg`, `tile-bg`, `hero-text` (accent usage), `card-shadow`, `tile-shadow`, `moon-glow`.
- **Surface style is expressed by tokens**, not a mode switch: soft elevation (shadow, no border), tonal layers (tinted background), hairline (gold or grey border), editorial rule (top divider only, no side padding). Components use the `card` and `tile` utilities.
- **Modern baseline (all themes):** weights 400–700 (tested ≤ 700), no border-per-card unless it is the theme's hairline, plain status rows instead of tinted boxes (`--row-fill: 0%`), oklch tinted neutrals, one accent, no gradients, accent bars or emoji. Reduced motion as before.
- **Colour primitives are oklch**, kept inside sRGB so contrast is computed on what every screen shows. `tokens.test.ts` converts oklch and checks every AA pair (now including `card-bg`, `tile-bg` and `hero-text`) for all 12 theme × mode blocks.
- **Targets follow `--tap-min`**, never `--spacing`, so compact density cannot shrink them.
- **The six themes:** Calm (default; Plus Jakarta Sans + Anek Gujarati; soft elevation, indigo), Raat (dark first; Space Grotesk + Anek Gujarati; OLED black, tonal, glowing moon, cyan), Kagaz (Fraunces + Noto Serif Gujarati; paper, ink, print red, ruled, larger type), Mandir (Marcellus display + Hind Vadodara; saffron, marigold, maroon, gold hairlines, looser spacing), Utsav (Baloo Bhai 2; tonal pink cards, pill ribbon, big radii), Shunya (Geist + Anek Gujarati; monochrome, compact, hairline rules, signal orange).
- **Fonts load per theme.** `@font-face` only downloads a file when text renders in it; only the default theme's files will be precached at rollout, the rest cached on first use (as Kagaz/Devanagari today).
- **Lint:** raw colours now include oklch/lab/lch/color(); arbitrary `font-[…]`, `rounded-[…]`, `shadow-[…]`, `tracking-[…]` values are errors (use theme tokens).

## Rollout

Approved by Bhavy on 2026-10-26 after the `/lab/themes` review (step 1); rolled out in step 2 the same day.

- `apps/app/src/styles/tokens.css` holds the six themes (the Quiet Sky palette values are gone); fonts are in `fonts.css`. Manrope and Noto Serif (Latin) are removed.
- `Settings.palette` is `calm | raat | kagaz | mandir | utsav | shunya`; Settings shows each theme with a one-line "who it suits" hint. Its previews keep the current theme's fonts so opening Settings downloads nothing.
- Every screen uses the theme weights (`font-hero|heading|strong|label`; Tailwind's own weight scale is reset), `card`/`tile` surfaces with `px-card`/`px-tile`, and `rounded-card`.
- Precache: only Calm's fonts (Plus Jakarta Sans, Anek Gujarati); every other theme's fonts are cached on first use.
- `/lab/themes` stays as a dev and E2E tool (`__LAB__`, compile-time; production drops it).

## Considered options

- **Colour-only palettes plus per-theme component overrides:** breaks ADR 0017 (no per-component theme overrides).
- **Several layout variants per theme (e.g. Shunya reordering Today):** deferred; tokens cover type, density and surfaces without forking components.
