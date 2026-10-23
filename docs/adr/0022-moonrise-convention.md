---
status: accepted (provisional: one reference day)
date: 2026-10-24
---

# 0022. Moonrise and moonset convention

Moonrise and moonset are the moments the **topocentric centre of the Moon is at 0° geometric altitude** (no refraction, no semidiameter), listed for the **sunrise-to-sunrise civil day** as printed panchangs do (so Thursday's moonset can read "3:38 AM Fri"). On the reference day (Drik Panchang, Ahmedabad, 22 Oct 2026: 3:41 PM / 3:38 AM) this lands within a minute of Drik's rounded times for both events; the sunrise-style convention (upper limb + 34′ refraction, ADR 0012) ran about 4 minutes early for moonrise.

## Consequences

- Display only: no tithi, festival, or personal-event date depends on the Moon's rise or set, so no `ENGINE_VERSION` bump.
- Provisional until more reference days are compared (add moonrise/moonset to the fixture years when they are next refreshed).
