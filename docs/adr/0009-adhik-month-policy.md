---
status: accepted (structure); defaults provisional
date: 2026-10-22
---

# 0009. Personal events in adhik-month years (§13 #1)

`lunarDate` records whether the original date fell in an **adhik** month (`adhik?: boolean`, set by the date helper of ADR 0006 or by choosing "Adhik" in the month picker). Without it, events for people born or deceased in an adhik month lose that fact. The `adhikMonth` occurrence policy (cascading, ADR 0005) takes four values, covering every convention we know of:

| Value | In a year where the event's month is adhik |
|---|---|
| `nija` | Observe in the regular (nija) month |
| `adhik` | Observe in the adhik month |
| `match-origin` | Adhik if the original date was adhik, otherwise nija |
| `both` | One occurrence in each month |

In years without an adhik month of that name, there is one month and one occurrence regardless of policy or flag.

**Provisional default** (all kinds): `nija`, matching festivals (§4.7 `nija-only`). Pending family confirmation (§13 checklist) before Phase 6 is complete.

## Considered options

- **`nija | adhik` only**: rejected; silently mishandles events whose original date was adhik.

## Consequences

- `both` yields two occurrences per year; the occurrence model already supports several per event (ADR 0004).
- Required tests: each value × (original adhik / not adhik) × (adhik year / normal year), plus the 1982–83 cycle from ADR 0008.
