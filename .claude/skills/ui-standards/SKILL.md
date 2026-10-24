---
name: ui-standards
description: UX principles, accessibility checklist, and design-token rules for the Pocket Panchang app. Use when designing or building any screen or component in apps/app (onboarding, Today, Month, Day detail, Personal events, Settings), working on design tokens in docs/design/, styling, theming/dark mode, motion, i18n layout, or reviewing UI for accessibility.
---

# UI standards

Source of truth: `PROJECT_PLAN.md` §9. Approved designs are listed in `docs/design/screens.md` (Today is the visual reference; its "Decisions established" apply to every screen); the brief and tokens are in `docs/design/brief.md` and ADR 0017. Build to those designs. Don't invent new visual patterns without asking.

## Principles

1. **Glanceable home**: one line answers why the user opened the app, e.g. *"Kartik Sud 2 · Choghadiya: Amrut until 10:42 · Rahu Kaal 1:30–3:00"*. Details on tap.
2. **Elderly-friendly by default**: primary users include older people on budget Android phones.
3. **Onboarding in 2 steps (v1)**: city → language (tradition step returns in v2 with Purnimanta). No jargon (no "ayanamsa").
   **Plain labels everywhere** (forms, settings, policies): e.g. "Follow printed calendar day" / "Traditional shraddh timing (afternoon)". Technical terms (udaya, aparahna, vriddhi, kshaya, adhik) go only in help text.
4. **Responsive**: single column on mobile; month grid + day detail side by side on desktop.
5. **Trust surfaces**: "How this is calculated" page; "Report a mismatch" pre-fills date, city, settings, engine version.
6. **Durability nudges**: prompt for backup after 3+ personal events; one-tap export/import.
7. **Motion with purpose**: transitions explain state changes and never decorate.
8. **Dark mode is designed**, not inverted.

## Accessibility checklist (every screen/component)

- [ ] Respects OS font scaling plus the in-app `textScale`; layout survives 200% text without clipping
- [ ] Tap targets ≥ 48 dp
- [ ] WCAG AA contrast in **both** light and dark themes
- [ ] No meaning conveyed by color alone (pair with text or icon, e.g. vriddhi/kshaya/festival markers, Choghadiya quality)
- [ ] `prefers-reduced-motion` respected
- [ ] Keyboard navigable with a visible focus ring; correct semantics/labels for screen readers
- [ ] Gujarati and Devanagari text render correctly (Hind Vadodara / Noto Serif Gujarati / Noto Sans Devanagari, self-hosted, subset) and line-height fits the script

## Design tokens

- Use tokens (CSS variables consumed via Tailwind) for color, type scale, spacing, radius, and motion. **No raw hex, px font sizes, or ad-hoc durations in components.**
- Three token layers (primitive → semantic → component); components use semantic/component tokens only (ADR 0017). Theme = `palette` (calm | raat | kagaz | mandir | utsav, ADR 0024) × mode (system | light | dark); switching swaps token values, never per-component overrides. Values and contrast pairs: `docs/design/brief.md` §8.
- Need a value that isn't a token? Ask; don't add one silently.

## Data and time display

- Times are formatted only at the UI edge with `Intl.DateTimeFormat` and the location's IANA zone. Components never compute panchang data. They read worker results via TanStack Query.
- Cold start: render cached data immediately; skeletons only on true first run; no spinners (§7).
- All user-facing strings go through `packages/i18n` (gu, en; hi in v2).
