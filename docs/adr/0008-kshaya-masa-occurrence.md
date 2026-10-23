---
status: accepted; classical source verification pending
date: 2026-10-22
---

# 0008. Personal events in a kshaya masa year go to the absorbing month

When a personal event's month is a **kshaya masa** that year (one lunar month contains two sankrantis, so one month name has no month of its own), the occurrence is placed in the **lunar month containing that name's sankranti**: the absorbing month hosts events of both names that year. This follows directly from sankranti-based month naming (§4.6), needs no extra policy field or UI, and keeps the engine deterministic. Kshaya masa is very rare (1963, 1983; next commonly estimated ~2124), but historical dates from ADRs 0002 and 0006 can hit it, so a crash or silent drop would violate §0 rule 7.

**Not yet verified:** confirm against a classical source (e.g., Nirnaya Sindhu on merged months) before this rule is marked verified.

## Considered options

- **No occurrence that year, with a notice**: honest but pushes a once-a-century case onto the user.
- **A policy field**: unjustified for a case outside every realistic reminder horizon.

## Engine result (Phase 5, 2026-10-23)

The engine finds, for 1982–83: **adhik Ashvin** (from 17 Sep 1982) → … → **Pausha, absorbing Magha** (the two-sankranti month from 14 Jan 1983) → **adhik Phalguna** (from 13 Feb 1983). New-moon and sankranti instants agree with JPL Horizons within 3 s and 25 s respectively. Drik's label for the two-sankranti month could not be fetched (Drik blocks automated access); it stays a pending source verification.

## Consequences

- **Required fixture tests in the 1982–83 cycle**, not just "no crash". Kshaya years typically sit alongside adhik months in the same cycle (commonly cited for 1982–83: an adhik month before and after the kshaya month; confirm the exact months from the reference when building the fixture). The tests must cover, in that same cycle:
  - kshaya absorption for events of both the absorbed and absorbing month names;
  - the `adhikMonth` policy (ADR 0005) for events in that cycle's adhik months;
  - Amanta↔Purnimanta conversion (ADR 0002) for every paksha around the kshaya and adhik months (**v2**, when Purnimanta ships).
