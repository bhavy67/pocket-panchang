---
status: accepted
date: 2026-10-22
---

# 0005. Occurrence policy resolves by cascade: event → household → built-in

Occurrence conventions (adhik month, kshaya/vriddhi placement, window, Pitru Paksha) are usually a **family** convention, not a per-event one. So the effective policy for an event is resolved field by field:

```
effective = event override ?? household default (for the event's kind) ?? built-in default (for the event's kind)
```

Events store **only their overrides** (sparse), never a full policy copy. Changing a household default therefore updates every event that doesn't override that field. A full per-event copy would freeze each event at the defaults of the day it was created, and a later family-wide correction would silently miss old events.

## Shape

- `OccurrencePolicy` fields: `adhikMonth`, `kshayaTithi`, `vriddhiTithi`, `window`, `pitruPaksha` (boolean; shraddh only), `tithiSource` (date helper only, ADR 0006).
- Built-in defaults: one complete policy per event kind, shipped in code. Fields that depend on family convention ship with **provisional** defaults, tracked in §13 "Pending family confirmations"; they must be confirmed before Phase 6 is complete.
- Household defaults: `Settings.householdPolicy`, a partial policy **per event kind**. Per kind, because one household-wide value (e.g., afternoon window) must not move birthdays along with shraddh.
- Event overrides: `PersonalEvent.policyOverrides`, a partial policy. The Pitru Paksha *day* override (ADR 0004) is per-event only and is not part of the cascade.

## UI

- Household defaults live in Settings → "Family conventions", with plain-language labels (§9).
- Per-event overrides live under "Advanced" in the event form, showing the inherited value and its source ("Family default").
- Changing a household default tells the user how many events it affects before applying it, since their dates and reminders will move.

## Consequences

- Occurrences and scheduled reminders must be recomputed when household defaults change, not only when an event changes.
- `householdPolicy` is part of `Settings`, so it is included in JSON backups.
- Required tests: each cascade level winning per field; a household change affecting non-overriding events only; an override reverting to "inherit".
