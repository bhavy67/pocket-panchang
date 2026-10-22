---
status: accepted (structure); toggle default provisional
date: 2026-10-22
---

# 0004. Shraddh events derive a Pitru Paksha occurrence

A shraddh/varsi event yields two occurrences per year from one entry: the **annual occurrence** on its own lunar date, and an optional **Pitru Paksha occurrence** (Amanta Bhadrapada Krishna, plus Bhadrapada Purnima). One entry avoids two hand-made events drifting apart when edited. The "Also observe in Pitru Paksha" toggle defaults to **on (provisional)**, pending Bhavy's family convention (whether the family observes Mahalaya shraddh by tithi or only on Sarva Pitru Amavasya).

## Pitru Paksha day

- Default: **same tithi number** as the death tithi, regardless of the original paksha (e.g., Kartika Shukla 5 → Bhadrapada Krishna 5). A Purnima death maps to **Bhadrapada Purnima**; an Amavasya death to Sarva Pitru Amavasya; a Chaturdashi death to Chaturdashi. This Purnima/Chaturdashi handling is **provisional** pending family confirmation.
- **Per-event override**: the user may pick any other Pitru Paksha day (e.g., Navami, Chaturdashi, Amavasya). This covers community variations (Matru Navami, Chaturdashi for unnatural deaths, etc.) without encoding unverified rules (§0 rule 7).
- In an adhik-Bhadrapada year, Pitru Paksha falls in the **nija** month, as for festivals.
- Day placement (kshaya/vriddhi target tithi, window) uses the event's own window and the tie-break rules of **ADR 0003**. They are not restated here.

## Considered options

- **Two separate events**: rejected; users forget the second one and edits drift.
- **Model special-day rules (Chaturdashi, Navami)**: rejected for v1; community-specific and not verifiable yet. The override covers them.

## Consequences

- **Same-day collision** (death tithi already in Bhadrapada Krishna, so both occurrences land on one day): the occurrence computation emits **both** occurrences. Only the UI merges them into one row. Reminders and `.ics` export still receive both, labelled distinctly.
- The toggle is the `pitruPaksha` field of `OccurrencePolicy` (resolved by cascade, ADR 0005); the day override is `PersonalEvent.pitruPakshaDay`. Both are valid only for `kind: "shraddh"`.
- Required tests: default mapping for Shukla, Krishna, Purnima, and Amavasya deaths; an override; an adhik-Bhadrapada year; a kshaya target tithi; and the same-day collision emitting two occurrences.
