---
status: accepted
date: 2026-10-22
---

# 0011. Location model: city search plus GPS with snap-or-custom (§13 #3)

Users pick a location by **offline city search**, or optionally by **GPS**. GPS is read once on request and never leaves the device. A GPS fix **snaps to the nearest bundled city if one is within ~25 km**; otherwise it creates a **custom location**. Reason: sunrise shifts ~4 min per degree of longitude (~1 min per 25 km east–west at Gujarat's latitude), so always snapping would quietly break the ±1 min sunrise budget (§4.2) for semi-urban users, who are core users.

## Custom locations

- Same `Location` shape and snapshot rule as ADR 0007, with a generated id (e.g., `custom:23.0,72.6`) and a user-chosen name ("Home – Nadiad").
- Coordinates rounded to **0.1°** (~10 km, ≤ 0.5 min of sunrise): keeps cache keys shared (§7) and avoids storing precise coordinates.
- **Time zone**: taken from the **device** (`Intl.DateTimeFormat().resolvedOptions().timeZone`), since the user is physically there. Nearest-city tz is only a fallback when the device zone is implausible for the coordinates. A nearest-city tz can be wrong by an hour near zone boundaries (e.g., Indiana, Arizona), which is far worse than the sunrise error this ADR fixes.
  - *Implausible* (proposed): no bundled city within ~500 km uses the device's IANA zone. Revisit when building Phase 7.
- The user can **manually override the time zone** of a custom location.

## Considered options

- **City search only**: coarse for small towns.
- **GPS always snapping to the nearest city** (the plan's original proposal): breaks the sunrise budget when the nearest city is far.

## Consequences

- The city dataset choice (GeoNames `cities5000` vs `cities15000`, density vs bundle size) is made in Phase 7.
- Required tests: snap within threshold; custom location beyond it; rounding; device-tz adoption; implausible-device-tz fallback; manual tz override.
