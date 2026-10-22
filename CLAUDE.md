# Pocket Panchang

A beautiful, private, offline Hindu panchang that's Gujarati-first and diaspora-aware, built around **personal tithi reminders** (janma tithi birthdays, varsi/shraddh, anniversaries). React + Vite PWA and Capacitor Android app over a pure TypeScript astronomy engine. No accounts, no server, no analytics, no ads.

**`PROJECT_PLAN.md` is the source of truth** for scope, architecture, calculation specs, and phases. Read the relevant section before acting. If `CLAUDE.md` and `PROJECT_PLAN.md` disagree, `PROJECT_PLAN.md` wins.

## Working Rules (from PROJECT_PLAN.md §0)

1. **Never commit, push, tag, or rebase.** Bhavy commits manually. No `git commit`, `git push`, `git tag`, `git rebase`, `git reset --hard`, or `git stash drop`, ever. Read-only git commands (`git status`, `git diff`, `git log`) are fine.
2. **Work one phase at a time.** Do not start the next phase until Bhavy explicitly says so.
3. **Stop at the end of every phase** and output:
   - A summary of what was done
   - The files created or changed
   - Any open questions or deviations from `PROJECT_PLAN.md`
   - **A suggested commit message** in Conventional Commits format (see §14)
4. **Engine ownership mode.** In phases marked `[OWN]`, Bhavy writes the core algorithms. Claude explains concepts, proposes function signatures, writes tests and fixtures, and reviews Bhavy's code. Claude writes core algorithm code only when Bhavy explicitly says "write it".
5. **No silent decisions.** If a choice isn't covered by `PROJECT_PLAN.md` or an ADR, ask before proceeding, offering a recommended answer.
6. **No new dependencies without a stated reason.** Every added package gets a one-line justification in the phase summary.
7. **Correctness beats features.** A wrong tithi or festival date is a critical bug. Never ship unverified festival rules.
8. **Keep `PROJECT_PLAN.md` current.** If a decision changes `PROJECT_PLAN.md`, update the relevant section. If an architectural or domain decision changes `PROJECT_PLAN.md`, record an ADR in `docs/adr/`. Naming or tooling-alignment changes only need the `PROJECT_PLAN.md` update.

## Project skills (`.claude/skills/`)

- `phase-workflow`: running a phase and the mandatory STOP format
- `engine-tutor`: behavior in `[OWN]` phases
- `panchang-domain`: glossary, calculation conventions, error budget
- `accuracy-fixtures`: golden fixtures and the accuracy report
- `ui-standards`: UX principles, accessibility, design tokens

## Key commands

Placeholder. The monorepo is scaffolded in Phase 3. Expected:

```sh
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Layout pointers

- Plan: `PROJECT_PLAN.md` · Glossary: `GLOSSARY.md` (created in Phase 1) · Decisions: `docs/adr/`
- Engine and calendar packages are pure (no `Date.now()`, DOM, IndexedDB, or tz libs). See plan §5.2.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (`bhavy67/pocket-panchang`) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one root `GLOSSARY.md` plus `docs/adr/`. See `docs/agents/domain.md`.
