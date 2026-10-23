---
status: accepted (structure); rule table provisional until hand-verified (Phase 6 exit criteria)
date: 2026-10-23
---

# 0021. Festival rule table, observance windows, and tie-breaks

## Observance windows (within a civil day, sunrise → next sunrise)

| Window | Definition |
|---|---|
| sunrise | the instant of sunrise (the tithi prevailing at sunrise) |
| madhyahna | 3rd fifth of daylight |
| aparahna | 4th fifth of daylight (also used for personal events, ADR 0003) |
| pradosh | first 3 of the night's 15 muhurtas after sunset |
| nishita | the 8th night muhurta (around midnight) |

## Tie-breaks (when the tithi covers the window on more than one day)

- `purva-vyapini`: the earlier day. `para-vyapini`: the later day. `max-coverage`: more coverage; equal → earlier.
- `extra.nakshatra` (Janmashtami Smarta, Rohini): among covering days, prefer the one where that nakshatra prevails at the window's midpoint, if exactly one does.
- `avoidBhadra` (Holika Dahan): coverage inside the tithi's Vishti half does not count.
- **No day covers the window:** provisional fallback = the civil day containing most of the tithi, flagged `fallback` in the output and in the verification checklist. Real rules for these cases (e.g. Bhadra covering all of pradosh) are pending source verification (§13).

## Rule table (provisional; Amanta months)

| Festival | Month / tithi | Window | Tie-break / extras |
|---|---|---|---|
| Maha Shivaratri | Magha Vad 14 | nishita | purva |
| Holika Dahan | Phalguna Sud 15 | pradosh | purva, avoid Bhadra |
| Dhuleti | Holika Dahan + 1 day | — | relative |
| Raksha Bandhan | Shravana Sud 15 | aparahna | max-coverage, show "after Bhadra" |
| Janmashtami (Smarta) | Shravana Vad 8 | nishita | purva, prefer Rohini |
| Janmashtami (Vaishnava) | Shravana Vad 8 | sunrise | para |
| Navratri | Ashvin Sud 1 → Sud 9 | sunrise | purva (span end resolved the same way) |
| Dussehra | Ashvin Sud 10 | aparahna | max-coverage |
| Dhanteras | Ashvin Vad 13 | pradosh | max-coverage |
| Kali Chaudas | Ashvin Vad 14 | nishita | max-coverage |
| Diwali | Ashvin Vad 15 (Amavasya) | pradosh | max-coverage |
| Bestu Varas | Kartika Sud 1 | sunrise | purva |
| Bhai Bij | Kartika Sud 2 | aparahna | max-coverage |
| Uttarayan | Makara sankranti | — | after sunset → next day (civic 14 Jan pending, ADR 0018) |

Tithi festivals use the nija month only; a month absorbed in a kshaya cycle counts (ADR 0008).

## Verification

Rules are judged by their **dates**, not argued in the abstract: `docs/verification/festivals-ahmedabad.md` (all 13, 2026–27) is checked by hand against a family printed panchang and Drik in a browser; `docs/verification/festivals-other-cities.md` lists only the other cities' dates that differ from Ahmedabad's, checked against local temple calendars. A rule's `verified` field is filled only after its rows are ticked. Any disagreement changes this table (and bumps `engineVersion`), never the checklist.
