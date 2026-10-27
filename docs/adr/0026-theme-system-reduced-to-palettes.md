---
status: accepted
date: 2026-10-27
---

# 0026. Theme system reduced to palettes: colour only (supersedes ADR 0025)

ADR 0025 made each theme a full visual system — its own fonts, weight scale, radii, density, surface style and shadows, not just colour. In practice this meant a palette switch (and, since language length differs too, a language switch) could change the page's own layout height, and Phase 11.7's View Transition crossfade (`src/lib/fade.ts`'s predecessor) showed that as doubled, ghosted text on the Settings screen — reported by Bhavy as Kagaz "behave fully weirdly." Kagaz (its own larger type scale on top of a different serif font) was the worst offender, but any theme with its own fonts/radii/shadows was a latent instance of the same bug class. Bhavy (2026-10-27): "remove kagaz and mandir, also keep css classes and borders and other stuff and similar stuff same across all themes."

## Decision

- **Kagaz and Mandir are removed outright**, not folded into the shared system — each was specifically a *different visual system* (Kagaz: Fraunces + Noto Serif Gujarati, its own enlarged `--text-*` scale, ruled no-radius cards; Mandir: Marcellus + Hind Vadodara, bordered cards, warm shadow), the exact shape of the problem.
- **The remaining four palettes (Calm, Raat, Utsav, Shunya) share one visual system**: one font pair (Plus Jakarta Sans + Anek Gujarati), one weight scale, one radius/spacing/ribbon scale, no card/tile borders or shadows. A palette switch is now a pure recolour — it cannot reflow, resize or ghost, by construction, not by care taken in the switch animation.
- **`--moon-glow` is the one property allowed to vary by palette** (dark mode only; light mode is `none` for all): it's a colour effect, not a layout one, computed by one shared formula (`color-mix(in oklch, var(--moon-lit) 20%, transparent)`) rather than per-palette hand-tuning, so "shared system" still holds even though the output colour differs.
- **`tokens.css` structure**: primitives unchanged; the old per-`[data-palette="x"]` structural block is gone, replaced by one shared `:root` block (fonts, weights, radii, spacing, borders, shadows, moon size/rim, ribbon) plus shared `[data-mode="light"]`/`[data-mode="dark"]` blocks (just `--moon-glow`); each palette keeps only its own `[data-palette="x"][data-mode="y"]` colour block.
- **A saved `palette: "kagaz" | "mandir"` doesn't fail settings parsing** (which would force onboarding again) — `settings.ts`'s `parseSettings` remaps either to `"calm"`.
- **Fonts collapse from seven families to two** (plus Devanagari for Hindi, v2, unaffected): Fraunces, Noto Serif Gujarati, Marcellus, Hind Vadodara, Space Grotesk, Baloo Bhai 2 and Geist are all removed, along with their `@fontsource*` packages. Since every palette now shares Plus Jakarta Sans + Anek Gujarati, there is no longer a per-palette on-demand font to preload before a switch — `src/lib/theme-fonts.ts` (Phase 11.7's font-preload-before-crossfade helper) is deleted as dead weight, not kept "just in case."

## Consequences

- `docs/adr/0025-theme-system-2.md` stays as the historical record of why six full-visual-system themes were tried; this ADR documents why four of them were kept and reduced to palettes instead.
- `PROJECT_PLAN.md` §15 (Phase 11.6 status) and `docs/design/screens.md`/`brief.md` keep their mentions of Kagaz/Mandir as history; new design work should treat the palette list as Calm/Raat/Utsav/Shunya.
- `docs/design/contrast/themes.json` was already stale before this change (pre-dates the oklch token system) and is not updated here — nothing reads it.
