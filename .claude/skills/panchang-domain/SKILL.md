---
name: panchang-domain
description: Panchang domain glossary and calculation conventions for Pocket Panchang. Use when working on or discussing tithi, nakshatra, yoga, karana, vara, sunrise, paksha, lunar months, adhik/kshaya masa, vriddhi/kshaya tithi, sankranti, ayanamsa, samvat, festivals, muhurta (Rahu Kaal, Choghadiya), personal tithi events, or anything in packages/engine or packages/calendar.
---

# Panchang domain

Source of truth: `PROJECT_PLAN.md` §3 (glossary) and §4 (calculation spec). Domain glossary: `GLOSSARY.md` (once it exists). Decisions: `docs/adr/`. Re-read those sections before changing calculation code; this skill is a summary, not a replacement.

## Elements and how each is computed

| Element | Count | Computation | Ayanamsa |
|---|---|---|---|
| Tithi | 30/lunation | (Moon − Sun) elongation ÷ 12° | Cancels → tropical OK |
| Karana | 60/lunation (7 movable + 4 fixed names) | Elongation ÷ 6° | Cancels |
| Nakshatra | 27 | Sidereal Moon ÷ 13°20′ | **Required** (Lahiri) |
| Yoga | 27 | (Sun + Moon) sidereal ÷ 13°20′ | **Does NOT cancel**: adds 2× ayanamsa |
| Vara | 7 | Weekday; Hindu day = sunrise → sunrise | — |
| Paksha | 2 | Shukla = tithi 1–15, Krishna = 16–30 | — |

Ayanamsa is always **Lahiri**. Astronomy source is **astronomy-engine** only. Never Swiss Ephemeris (license). **grahan** is a test-only cross-check and never a runtime dependency.

## Day assembly (§4.5)

- Civil Hindu day = sunrise(D) → sunrise(D+1) at the selected location.
- **Udaya tithi** = tithi at sunrise(D); it names the day. Also list every tithi ending inside the day, with end times. Same for nakshatra, yoga, karana.
- **Vriddhi**: same tithi at two consecutive sunrises. **Kshaya**: tithi starts and ends between sunrises (present at none).
- Sunrise: upper limb + standard refraction, sea level, passed as a `SunriseDefinition` engine parameter (ADR 0012; confirmed by Phase 4 fixtures). Polar no-sunrise/no-sunset cases return explicit states and never crash.

## Months and years (§4.6)

- Amanta month = new moon → new moon (internal frame; v1 is Amanta-only). Purnimanta (v2) is **not** a plain half-month shift in adhik years (ADR 0002).
- Month name from the sidereal solar rashi (sankranti). No sankranti → **adhik** (named after the next month; followed by **nija**). Two sankrantis → **kshaya masa** (rare, must still work).
- Vikram Samvat Kartikadi increments at Kartik Shukla Pratipada (default); Chaitradi via settings. Shaka increments at Chaitra Shukla Pratipada.

## Crossing finder (§4.3)

All end times are roots of `f(t) = normalize(angle(t) − target)`. Bracket with 1–2 h steps, refine (bisection/secant) to < 1 s. **Handle the 360° wraparound explicitly**; first bugs live here.

## Error budget (§4.2)

- Moon gains ~12°/day on Sun (10.8–14.5°/day), so 1′ of longitude error ≈ 2 min of tithi end time.
- Targets: tithi/nakshatra end ±2 min; sunrise/sunset ±1 min. Report measured numbers, not targets.

## Festivals and personal events

- Festivals are **data** (`FestivalRule`, §4.7): month (Amanta frame), paksha, tithi, window (sunrise/madhyahna/aparahna/pradosh/nishita), tieBreak, `adhikPolicy: "nija-only"`. A rule ships **only** with `verified` filled.
- Personal events: lunar date stored in Amanta (ADR 0002). `OccurrencePolicy` (§4.9) resolves per field by cascade: event override → household "Family conventions" (per kind) → built-in per kind (ADR 0005). Window, tie-breaks, Pitru Paksha, observance location, adhik/kshaya rules: ADRs 0003–0010. Convention defaults are **provisional** until the §13 "Pending family confirmations" checklist is cleared.
- Muhurta: Rahu Kaal/Yamaganda/Gulika = daylight ÷ 8 with weekday tables; Choghadiya = day and night ÷ 8 each with weekday starting sequence.

## Hard rules

- `packages/engine` and `packages/calendar` are pure: UTC instants (JD or epoch ms) + coordinates in, plain data out. No `Date.now()`, DOM, IndexedDB, or tz libraries. Time zones are applied only at the UI edge.
- **Parse, don't validate** (ADR 0014): engine/calendar APIs accept only branded domain types (e.g., `CivilDate`, `LocationId`) produced by parse functions. Never accept raw strings/numbers for these, and never construct a branded value except in its parse function. Every input boundary (URL, backup import, notification payloads, forms) parses.
- A wrong tithi or festival date is a critical bug. When a convention is unclear, ask, and don't guess.
- Use terms exactly as defined in `GLOSSARY.md`; flag any new or conflicting term.
