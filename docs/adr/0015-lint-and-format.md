---
status: accepted
date: 2026-10-22
---

# 0015. ESLint (type-checked) + Prettier; lint enforces architecture rules (§13 #7)

Linting uses **ESLint flat config with typescript-eslint's type-checked presets**; formatting uses **Prettier** only, with `eslint-config-prettier` disabling conflicting rules. Every engine call crosses the Comlink worker boundary as a Promise, so the most valuable rules are type-aware async ones, and typescript-eslint implements them with the real compiler. Biome v2 has its own type-aware rules (including `noFloatingPromises`) without the compiler; it is faster and simpler but its inference is described as less complete, and correctness beats speed here (§0 rule 7). Revisit via a new ADR if Biome's coverage matures.

## Rules (implemented in Phase 3)

- **Purity** in `packages/engine` and `packages/calendar` (§5.2), via `no-restricted-globals` / `no-restricted-syntax`: forbid `Date.now()`, argument-less `new Date()`, `Math.random`, `window`, `document`, `indexedDB`.
- **Dependency direction** `app → calendar → engine`, via `no-restricted-imports` (no extra dependency; adopt `eslint-plugin-boundaries` only if the patterns become unmanageable).
- **Type-aware**: `@typescript-eslint/switch-exhaustiveness-check`, `no-floating-promises`, `no-misused-promises`, `await-thenable`.
- **React app** (`apps/app`): `eslint-plugin-jsx-a11y` and `eslint-plugin-react-hooks`.

## Consequences

- Lint becomes the enforcement mechanism for §5.2 rules 1 and 5, not just review.
- Required check in Phase 3: a deliberately impure line in `packages/engine` and a reverse import from `engine` to `calendar` both fail `pnpm lint`.
