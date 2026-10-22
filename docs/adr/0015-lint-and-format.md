---
status: accepted
date: 2026-10-22
---

# 0015. ESLint (type-checked) + Prettier; lint enforces architecture rules (§13 #7)

Linting uses **ESLint flat config with typescript-eslint's type-checked presets**; formatting uses **Prettier** only, with `eslint-config-prettier` disabling conflicting rules. Every engine call crosses the Comlink worker boundary as a Promise, so the most valuable rules are type-aware async ones, and typescript-eslint implements them with the real compiler. Biome v2 has its own type-aware rules (including `noFloatingPromises`) without the compiler; it is faster and simpler but its inference is described as less complete, and correctness beats speed here (§0 rule 7). Revisit via a new ADR if Biome's coverage matures.

## Rules (implemented in Phase 3)

- **Purity** in `packages/engine` and `packages/calendar` (§5.2), via `no-restricted-globals` / `no-restricted-syntax`: forbid `Date.now()`, argument-less `new Date()`, `Math.random`, `window`, `document`, `indexedDB`, and `Intl` (time zones only at the UI edge, §5.2 rule 3).
- **Dependency direction** via `@typescript-eslint/no-restricted-imports` (no extra dependency; adopt `eslint-plugin-boundaries` only if the patterns become unmanageable): `engine` imports no internal package; `i18n` may import `engine` **types only** (`allowTypeImports`, so value imports fail); `calendar` may import `engine` and `i18n`; `app` may import all.
- **No raw colours** in `apps/app` TS/TSX: `no-restricted-syntax` on string and template literals matching real colour values only (`#` + 3–8 hex digits, `rgb(a)(`, `hsl(a)(`), so strings like `"#today"` and plain text don't trigger it. Raw colours are allowed only in `tokens.css` (CSS files are checked by `tokens.test.ts`, ADR 0017).
- **Type-aware**: `@typescript-eslint/switch-exhaustiveness-check`, `no-floating-promises`, `no-misused-promises`, `await-thenable`.
- **React app** (`apps/app`): `eslint-plugin-jsx-a11y` and `eslint-plugin-react-hooks`.

## Version caps (Phase 3, 2026-10-22)

- **TypeScript 6.0.x, not 7.** typescript-eslint 8.72 declares `typescript >=4.8.4 <6.1.0`, and the type-checked rules above depend on it. **Upgrade when** typescript-eslint supports TypeScript 7.
- **ESLint 9.39.x, not 10.** `eslint-plugin-jsx-a11y` 6.10.2 declares ESLint up to `^9`. **Upgrade when** jsx-a11y declares ESLint 10 support.
- Known issue: npm marks every ESLint 9.39.x release "no longer supported". In a scratch test (2026-10-22), jsx-a11y 6.10.2 ran correctly under ESLint 10.13 for a sample of rules despite its peer range. **Decision (2026-10-22): stay on ESLint 9.39.5.** It is a dev-only tool, while forcing a peer-range override risks rules silently not working. **Revisit when** `eslint-plugin-jsx-a11y` officially supports ESLint 10.

## Formatting in CI

- `pnpm format:check` (Prettier) runs in CI. Markdown is excluded via `.prettierignore`, so hand-written docs (plan, ADRs, brief) keep their authored layout.

## Consequences

- Lint becomes the enforcement mechanism for §5.2 rules 1 and 5, not just review.
- Required check in Phase 3: a deliberately impure line in `packages/engine` and a reverse import from `engine` to `calendar` both fail `pnpm lint`. **Done 2026-10-22**: verified with temporary files (also: i18n value import fails and type import passes; `"#today"` does not trigger the colour rule).
