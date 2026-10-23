---
name: phase-workflow
description: How to run a Pocket Panchang project phase from start to the mandatory STOP report, including the commit message format. Use when Bhavy says to start, continue, or finish a phase (e.g. "start Phase 3", "let's do Phase 4"), when a phase's work is complete, or when asked for a summary or commit message.
---

# Phase workflow

Phases are defined in `PROJECT_PLAN.md` §15. Working rules are in §0. Commit format is in §14.

## Starting a phase

1. Confirm Bhavy explicitly named the phase. Never start the next phase on your own.
2. Re-read the phase's bullets and **exit criteria** in §15, plus the plan sections and ADRs they reference.
3. If the phase is marked `[OWN]`, load the `engine-tutor` skill and follow it.
4. Post a short plan (files to create/change, anything ambiguous) before writing files.
5. List every choice not covered by the plan or an ADR, and ask with a recommended answer. No silent decisions.

## During a phase

- Stay inside the phase's scope. Note out-of-scope ideas for the STOP report instead of doing them.
- Every new dependency gets a one-line justification (collect them for the summary).
- If a decision changes `PROJECT_PLAN.md`, update the relevant section. If an architectural or domain decision changes `PROJECT_PLAN.md`, also record an ADR in `docs/adr/` (next number, using `0000-template.md`). Naming or tooling-alignment changes only need the `PROJECT_PLAN.md` update (§0 rule 8).
- **Git is read-only.** `git status`, `git diff`, `git log` are fine. Never commit, push, tag, rebase, reset, merge, or drop stashes. These are also denied in `.claude/settings.json`.
- Check exit criteria by actually running them (tests, builds, scripts). Report real output, including failures.

## Speed-ups (Bhavy, 2026-10-23)

- Reports: max ~10 lines. Results, decisions needed, anything surprising. No line-by-line walkthroughs unless asked.
- No quizzes.
- Batch steps where possible; stop between steps only when a decision is needed.

## STOP (mandatory at the end of every phase)

End the phase with exactly this structure, then stop and wait:

```
## Phase <n> complete: <title>

### Summary
<what was done, 3–8 bullets; exit criteria met or not, with evidence>

### Files created / changed
- path/to/file: <one-line purpose>

### New dependencies
- <package>: <one-line reason>   (or "None")

### Open questions / deviations from the plan
- <question or deviation, with recommended answer>   (or "None")

### Suggested commit message
<type>(<scope>): <summary in imperative, ≤ 72 chars>

<body: what and why, wrapped at 72>

Phase: <n>
```

Commit types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`.
Scopes: `engine`, `calendar`, `i18n`, `app`, `android`, `pwa`, `fixtures`, `ci`, `docs`, `repo`.

Only suggest the message. Bhavy commits.
