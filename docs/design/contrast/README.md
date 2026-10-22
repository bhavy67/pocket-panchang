# Superseded

This was the Phase 2 contrast prototype (`contrast.py`, `themes.json`). It is **superseded** since Phase 3:

- Colour values now live only in `apps/app/src/styles/tokens.css` (single source of truth, ADR 0017).
- `apps/app/src/styles/tokens.test.ts` checks completeness and WCAG AA on every `pnpm test` and in CI.

Do not edit these files to change colours; they are kept only as a record of how the v1 palettes were first verified.
