---
status: accepted
date: 2026-10-22
---

# 0001. Record architecture decisions

Pocket Panchang is built across many phases and AI-assisted sessions, so decisions that are hard to reverse, surprising without context, or the result of a real trade-off must survive beyond one conversation. We record them as short, sequentially numbered ADRs in `docs/adr/`, copied from `0000-template.md` (format per the `domain-modeling` skill). `PROJECT_PLAN.md` remains the source of truth: when an ADR changes the plan, the relevant plan section is updated in the same change (§0 rule 8). Every Open Decision in §13 gets its own ADR during Phase 1.

## Consequences

- An ADR is never edited to reverse its decision. A new ADR supersedes it, and the old one's status becomes `superseded by ADR-NNNN`.
- Agents read ADRs touching their area before working, and surface any contradiction instead of silently overriding (see `docs/agents/domain.md`).
