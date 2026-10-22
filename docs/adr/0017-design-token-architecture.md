---
status: accepted
date: 2026-10-22
---

# 0017. Three-layer design tokens with multiple themes from the start

Design tokens are CSS custom properties in **three layers**, and **components use semantic (or component) tokens only**, never primitives or raw values:

1. **Primitive**: raw values with no meaning (`--teal-700: #0B6E79`, `--space-4: 1rem`). Only theme files reference these.
2. **Semantic**: meaning, not appearance (`--surface`, `--text-muted`, `--accent`, `--auspicious`, `--now-marker`). Each theme × mode maps every semantic token to a primitive.
3. **Component**: optional aliases for a component's parts (`--timeline-now: var(--now-marker)`, `--chip-auspicious-bg: var(--auspicious-subtle)`), defined only in terms of semantic tokens.

Themes are planned from the start because retrofitting a second theme onto components that use raw colours means touching every component. Adding a palette later must be a new theme file only.

## Rules

- A **theme** = a palette (e.g., Calm, Mandir, Raat) × a **mode** (light, dark). Every theme × mode defines the **complete** semantic token set; a missing token is a build error, not a fallback.
- Switching = attribute swap on the root element (`data-palette`, `data-mode`; mode follows `prefers-color-scheme` unless the user overrides). No per-component theme overrides.
- Tailwind's colour, spacing, radius, and motion scales point at semantic CSS variables only, so utilities like `bg-surface` exist and `bg-[#hex]` is not used in components.
- **Spacing is in rem** (base step `0.25rem`), so layout scales with the user's text size, as in the approved Today design.
- **Domain tokens** are semantic: `--auspicious`, `--inauspicious`, `--festival`, `--personal-event`, `--now-marker`, each with a `-subtle` background variant where used as a fill.
- **Accessibility is per theme**: every theme × mode must pass WCAG AA (text ≥ 4.5:1, large text and non-text UI ≥ 3:1) for the pairs listed in `docs/design/brief.md`, and meaning is **never conveyed by colour alone** (domain states always carry a text label or icon too).
- Dark modes are designed (own values), never computed inversions (§9).

## Considered options

- **Two layers (primitive → component)**: components would encode appearance, and each new theme would need per-component values.
- **Single light/dark theme now, themes later**: cheaper today, but retrofitting is the expensive path.

## Consequences

- Phase 3 adds an automated contrast check over every theme × mode (fails CI below AA), and a lint check forbidding raw colour literals in `apps/app` components (ADR 0015).
- v1 ships all three palettes (Calm, Mandir, Raat), each light and dark. `Settings.palette` (`"calm" | "mandir" | "raat"`, approved 2026-10-22) is separate from `Settings.theme` (mode: system/light/dark).
- **`apps/app/src/styles/tokens.css` is the single source of truth for colour.** `apps/app/src/styles/tokens.test.ts` (Vitest, so it runs in CI via `pnpm test`) checks that every palette × mode defines exactly the semantic set as `var(--primitive)`, that every AA pair passes, and that no other stylesheet contains a raw colour. The Phase 2 prototype in `docs/design/contrast/` is superseded.
- The v1 palette proposals, the semantic token list, and measured contrast are in `docs/design/brief.md`.
