---
status: accepted
date: 2026-10-22
---

# 0007. Observance location, separate from the viewing city

A personal event's occurrence is computed for its **observance location**, not the city the user is currently viewing. Sunrise (and the aparahna window) differ by place, so the same tithi can fall on different Gregorian days in Ahmedabad and New Jersey. Tying events to the viewing city would make travel or casual browsing silently move every event and its reminders.

```
observance location = event override ?? household "Observance city" (Family conventions) ?? Settings.location
```

Onboarding sets the household Observance city to the city picked, so most users never see this. The per-event override lives under "Advanced". The observance location is distinct from an event's origin place (ADR 0006).

## Snapshot, not reference

Observance locations (household and per-event) are stored as a **snapshot** `{ id, name, lat, lng, tz }`, not just a city id. A city-database update must never silently shift an event's day; same principle as ADR 0006's never-recomputed origin.

## Reminder timing across time zones

- The occurrence is a **civil date in the observance city**.
- A reminder "N days before" fires at the user's chosen **device-local** time, on the **latest device-local day whose firing instant is no later than that same wall-clock time in the observance city on (occurrence date − N)**.
  - Same zone: unchanged; a 08:00 day-of reminder fires at 08:00 on the day.
  - Device west of the observance city (NRI in New Jersey, observance in Ahmedabad): 08:00 IST Tue = Mon 22:30 EDT, so the day-of reminder fires **Mon 08:00 EDT**, never later than 08:00 Ahmedabad time on the day.
  - Device east of the observance city: fires on the same date, before the observance city's morning.
- When the observance city differs from the device or viewing city, labels name it: "Ba's varsi · Tue 14 Oct (Ahmedabad)".

## Considered options

- **Viewing city for everything**: rejected; travel moves events and reminders.
- **Required location on every event**: rejected; adds a near-constant field to every form.

## Consequences

- `Settings` gains `observanceLocation`; `PersonalEvent` gains an optional `observanceLocation` override; both are snapshots.
- Occurrences may need panchang data for a city other than the viewing city; computed and cached per city like any other (§7).
- `.ics` events are all-day dates on the observance-city civil date with the city in the title. `.ics` alarms are relative to the all-day start in the calendar app's zone and cannot express the rule above. This is a known limitation, mitigated by the label.
- Required tests: the reminder rule for same-zone, west, and east devices (including a DST-transition week in New York and London); snapshot unaffected by a city-database change.
