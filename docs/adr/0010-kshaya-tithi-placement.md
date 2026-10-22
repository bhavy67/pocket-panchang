---
status: accepted; default provisional
date: 2026-10-22
---

# 0010. Kshaya-tithi placement for personal events (§13 #2)

Under the sunrise window, a kshaya tithi names no civil day: it begins after one sunrise and ends before the next. The `kshayaTithi` policy (cascading, ADR 0005) places the event on either:

- **`same-day`**: the civil day during which the tithi occurs (printed calendars usually list it alongside that day, e.g. "4/5"). UI label: "The day the tithi falls in the calendar".
- **`following-day`**: the next civil day (carry-forward custom). UI label: "The next day".

The plan's earlier values `previous-day | next-day` were renamed because "previous" had no clear reference point.

**Provisional default** (all kinds): `same-day`, pending family confirmation (§13 checklist). Under the aparahna window this policy does not apply; ADR 0003's coverage tie-break handles kshaya tithis.

## Consequences

- Required tests: a kshaya tithi under the sunrise window with each value; the same tithi under the aparahna window ignoring this policy.
