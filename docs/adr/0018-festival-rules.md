---
status: accepted; span end rule provisional; source verifications pending
date: 2026-10-22
---

# 0018. Festival rules: a discriminated union, Bhadra, spans, and labelled variants

v1 ships **13 verified festivals**: Dhanteras, Kali Chaudas, Diwali, Bestu Varas, Bhai Bij, Navratri, Dussehra, Janmashtami, Raksha Bandhan, Holika Dahan, Dhuleti, Maha Shivaratri, Uttarayan. They do not all follow "this tithi, in this window", so `FestivalRule` (§4.7) is a **discriminated union on `kind`**:

- **`tithi`**: month, paksha, tithi, observance window, tie-break (the original shape). Optional `avoidBhadra`, `bhadraTiming`, and `span`.
- **`sankranti`**: the Sun's entry into a sidereal rashi (Uttarayan = Makara), with an `afterSunset` rule (`next-day` | `same-day`) for a sankranti instant after local sunset.
- **`relative`**: a fixed civil-day offset from another festival (Dhuleti = Holika Dahan + 1). Must reference an existing rule; no cycles.

One rule shape with optional fields for every case would allow nonsense combinations (a sankranti festival with a tithi); the union makes each kind's required fields explicit and exhaustively checkable (`switch-exhaustiveness-check`, ADR 0015).

## Bhadra

- **Bhadra** (the Vishti karana window) is computed for every day and shown as an inauspicious muhurta (§4.8).
- **Holika Dahan** uses `avoidBhadra: true`: window coverage inside Bhadra does not count when resolving the date.
- **Raksha Bandhan** shows "after Bhadra" timing (e.g., "Rakhi: after 1:42 PM") via `bhadraTiming: "show-after"` on the tithi kind; its *date* is resolved normally.

## Spans

- `span.end` gives the end tithi (Navratri: Ashvin Shukla 1 → Ashvin Shukla 9). The end day resolves under the same window and tie-break as the start (**provisional**, pending source verification), so the civil-day length (8, 9, or 10 days) comes from the engine, never from a fixed count.

## Labelled variants: Janmashtami

- Janmashtami is two rules, each with `variant: { group: "janmashtami", label }`, where `label` is a `Record<Lang, string>` ("Smarta", "Vaishnava"). A single optional object (rather than two optional fields) means a group without a label, or a label without a group, cannot be represented. `variant` lives on `FestivalBase`, so any kind can have variants.
- **Rendering rule:** if all variants in a `variant.group` resolve to the **same** day, show **one** marker named "Janmashtami" (no label). Show **two labelled markers** ("Janmashtami (Smarta)", "Janmashtami (Vaishnava)") **only when the dates differ**. There is **no setting** to pick one.

## Source verifications (§13, before Phase 6 completes)

- **Navratri end-day rule**: confirm the same-window end rule above against a classical source and references.
- **Uttarayan**: Gujarat's civic date (14 January) vs the astronomical Makar Sankranti date under the after-sunset rule; check 2025–2027 against references before deciding what to display.
- **Janmashtami**: cite the Smarta and Vaishnava resolution rules and check both against references for the fixture years.
- **Holika Dahan**: cite the Bhadra-avoidance rule, including the case where Bhadra covers all of pradosh.

## Consequences

- The brief shows Bhadra in the muhurta timeline, a span band for Navratri in the month grid, two labelled Janmashtami markers when needed, and Holika Dahan (evening) followed by Dhuleti (next day).
- Required tests: each `kind`; `avoidBhadra` with Bhadra covering part and all of the window; Navratri spans of 8, 9, and 10 civil days in fixture years; Dhuleti following Holika Dahan across a month boundary; Janmashtami same-day and differing-day cases; a sankranti instant just before and just after sunset.
