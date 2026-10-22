---
status: accepted
date: 2026-10-22
---

# 0002. Store personal-event lunar dates in the Amanta frame

A personal event's lunar date (month, paksha, tithi) is always stored in the **Amanta** frame, the app's internal frame (same as festival rules, §4.7). The create/edit form and all displays use the user's current tradition setting and convert at the edge. Krishna-paksha days carry different month names in Amanta and Purnimanta, so storing in the user's chosen frame would silently move those events if the tradition setting later changed: a correctness bug under §0 rule 7.

## Considered options

- **Store in the tradition chosen at entry time**: rejected; changing the tradition setting would reinterpret every Krishna-paksha event.
- **Store the tradition per event**: rejected for v1; it adds a confusing choice to the form for a rare case (a relative's date learned in the other convention). It can be added later as an optional override without migrating stored data.

## Consequences

- **Amanta↔Purnimanta conversion is not a plain half-month shift in adhik-month years.** Purnimanta pairs each Krishna paksha with the following Shukla paksha, so the nija month is split around the adhik month: *Nija X Krishna → Adhik X Shukla → Adhik X Krishna → Nija X Shukla*. Amanta "Adhik X Krishna" keeps the name X (not X+1), and the Krishna paksha before the adhik month is *nija* X. (Verify this sequence against the reference's Purnimanta view for at least one adhik year before shipping.)
- This must be resolved together with the adhik-month occurrence policy (§13 #1), because the user may enter a date like "Purnimanta X Krishna 5" whose adhik/nija status depends on this rule.
- **Required tests**: round-trip conversion for every paksha of an adhik year and its neighboring months, in both directions, including the Krishna paksha immediately before the adhik month and the adhik Krishna paksha; and a non-adhik year as a control.
