---
status: accepted (structure); defaults provisional pending family confirmation (§13)
date: 2026-10-22
---

# 0003. Personal-event observance window, by event kind

A personal event's occurrence is the civil day on which its tithi covers the event's **observance window**. The window is part of the event's occurrence policy, defaulted by event kind and overridable per event. Birthday, anniversary, and custom events default to **sunrise** (udaya tithi). Shraddh/varsi defaults to **aparahna** (afternoon, classical aparahna-vyapini rule), **provisional** pending Bhavy's family convention; the alternative is sunrise. The two rules can land a day apart for the same tithi, so a single global rule would silently give the wrong day for one kind or the other.

## Personal-event tie-break rules

These are defined here explicitly; they are **not** inherited from festival `tieBreak` rules (§4.7).

**Sunrise window**
- Tithi at exactly one sunrise → that day.
- Tithi at two sunrises (vriddhi) → `vriddhiTithi` policy (`first-day` | `second-day`); **provisional default: `first-day`** (the tithi covers that whole civil day).
- Tithi at no sunrise (kshaya) → `kshayaTithi` policy (`same-day` | `following-day`; ADR 0010).

**Aparahna window**
- Window covered on exactly one day → that day.
- Covered on both days → the day with greater coverage of the window; if equal, the earlier day.
- Covered on neither day → the earlier day. **Provisional, not yet confirmed**: needs a cited classical source and family confirmation before shipping (§0 rule 7).

## Considered options

- **Sunrise for every event**: simplest and matches reading a printed calendar, but contradicts the classical shraddh rule.
- **User picks the window per event with no defaults**: exposes jargon in the form for every event.

## Consequences

- `OccurrencePolicy` (§4.9) gains a `window: "sunrise" | "aparahna"` field.
- Form copy uses plain labels ("Follow printed calendar day" / "Traditional shraddh timing (afternoon)"); technical terms appear only in help text (§9).
- Required tests: for each tie-break branch above, a fixture day that exercises it, including a kshaya tithi under the aparahna window.
