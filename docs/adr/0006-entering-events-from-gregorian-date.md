---
status: accepted (structure); death-tithi default provisional
date: 2026-10-22
---

# 0006. Entering a personal event from a Gregorian date

Most users know the Gregorian date of a birth or death, not its tithi. The event form offers "I know the date" alongside "I know the tithi". The **lunar date remains the single source of truth** (ADR 0002); the helper only proposes one, and the user must confirm it before saving.

## Which tithi

- **Time given** → the tithi at that moment, at the origin place. A pre-sunrise moment belongs to the previous civil day.
- **No time** → the udaya tithi of that date at the origin place (what a printed calendar shows).
- The `tithiSource` policy field (resolved by the ADR 0005 cascade) chooses between them: `moment` uses the rule above; `calendar-day` uses the udaya tithi even when a time is given. Birthday built-in: `moment`. **Death tithi** (shraddh built-in): **`moment`, provisional** pending family confirmation.

## Origin

- The entered Gregorian date, optional time, and **origin place** (where the birth/death happened) are stored on the event for display only ("born 12 Mar 1950").
- Origin place is a **separate field** from the observance location; they must never be conflated.
- The origin is **never recomputed automatically**. If an engine fix would yield a different lunar date from the origin, the app flags the difference for the user to confirm; it never silently moves a tithi.

## Historical time zones

- The entered local time is interpreted in the origin place's **historical** zone using IANA tz history (e.g., Asia/Kolkata +06:30 during WWII, roughly Oct 1941–Oct 1945 with a gap in 1942). The local→UTC conversion happens at the UI edge (§5.2 rule 3); the engine still receives a UTC instant.
- If the computed moment is within **~1 hour of a tithi boundary**, the confirm screen warns: "Close to a tithi change, verify with a printed calendar."

## Known limitations

- IANA does not model every historical local time. Bombay Time (~+04:51, in local use until 1955) is not covered; Calcutta local time (~+05:53, until ~1948) is believed not covered (verify). Entries from those places and periods may be off by tens of minutes; the boundary warning mitigates but does not fix this.
- Origin places outside the bundled city list snap to the nearest listed city.

## Consequences

- `PersonalEvent` (§6) gains an optional `origin` field.
- Required tests: pre-sunrise moment mapped to the previous civil day; a WWII-era Asia/Kolkata time; the boundary warning just inside and outside the 1-hour threshold; no-time entry using udaya tithi.
