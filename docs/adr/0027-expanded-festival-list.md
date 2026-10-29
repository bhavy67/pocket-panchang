---
status: accepted; source verifications pending
date: 2026-10-29
---

# 0027. Expanded festival list: 17 more festivals, broadly Gujarati + ISKCON/Vaishnav

v1 shipped 13 festivals (ADR 0018). Bhavy asked to go further: more mainstream Gujarati/pan-Hindu festivals plus the ISKCON/Vaishnav calendar. This adds 17 more `FestivalRule` entries to the same table — no type or engine change, since every window these festivals need (`sunrise`, `madhyahna`, `pradosh`) already exists in `ObservanceWindow` (`windows.ts`).

They ship the same way the original 13 did: **provisional** (`verified: pending`, hidden in production, dev-visible via `SHOW_UNVERIFIED`) until checked against published sources for 2026–2030, the same process as `docs/verification/festivals-ahmedabad.md` — a separate follow-up pass, not part of this change.

## The 17, and why each rule is what it is

Window conventions below follow the Dharmasindhu/Nirnayasindhu kala-vyapti system already governing the v1 table (ADR 0018/0021), sourced per row:

| Festival | Month, paksha, tithi | Window | Tie-break | Why |
|---|---|---|---|---|
| Ganesh Chaturthi | Bhadrapada Shukla 4 | madhyahna | max-coverage | Same kala-vyapti class as Ram Navami/Akshaya Tritiya |
| Ram Navami | Chaitra Shukla 9 | madhyahna | max-coverage | Rama's birth is placed at midday |
| Vasant Panchami | Magha Shukla 5 | sunrise | purva-vyapini | Standard Panchami-tithi dating, same pattern as Bestu Varas |
| Guru Purnima | Ashadha Purnima | sunrise | purva-vyapini | Standard Purnima-tithi dating |
| Akshaya Tritiya | Vaishakha Shukla 3 | madhyahna | max-coverage | Classical kala-vyapti rule, confirmed against Dharmasindhu/Nirnayasindhu |
| Nag Panchami | Shravana Shukla 5 | sunrise | purva-vyapini | Standard Panchami-tithi dating |
| Sharad Purnima | Ashvin Purnima | sunrise | purva-vyapini | Standard Purnima-tithi dating |
| Dev Uthani Ekadashi | Kartika Shukla 11 | sunrise | purva-vyapini | Civil date only — the full Vaishnava Ekadashi dating convention (Hari-vasara, para/smarta split) is **not** modelled; this is an approximation, same caveat class as Janmashtami's variants |
| Tulsi Vivah | Kartika Shukla 12 | pradosh | max-coverage | Padma Purana: Kartika Shukla Dwadashi, pradosh kaal of that evening |
| Rath Yatra | Ashadha Shukla 2 | sunrise | purva-vyapini | Day-long procession, standard sunrise-tithi dating |
| Hanuman Jayanti | Chaitra Purnima | sunrise | purva-vyapini | North India/Gujarat convention; Maharashtra (Chaitra Krishna 14), Tamil Nadu/Kerala (Margazhi) and Karnataka/Andhra (41-day from Chaitra Purnima) all differ — not modelled, flagged for whoever revisits this |
| Chaitra Navratri | Chaitra Shukla 1 → Shukla 9 (span) | sunrise | purva-vyapini | Same span mechanism as the existing Ashvin Navratri; its 9th day coincides with Ram Navami |
| Gaura Purnima | Phalguna Purnima | pradosh | max-coverage | Same tithi as Holika Dahan (Phalguna Purnima) but no Bhadra-avoidance — Chaitanya Mahaprabhu's appearance is dated by moonrise/evening, not Bhadra |
| Nrisimha Chaturdashi | Vaishakha Shukla 14 | pradosh | max-coverage | Appeared at sunset while Chaturdashi prevailed |
| Radhashtami | Bhadrapada Shukla 8 | madhyahna | max-coverage | ISKCON/classical convention: Radha's appearance at noon |
| Jhulan Yatra | Shravana Shukla 11 → Shukla 15 (span) | sunrise | purva-vyapini | ISKCON's 5-day Ekadashi-to-Purnima swing festival |
| Govardhan Puja | Kartika Shukla 1 (same tithi as Bestu Varas) | sunrise | purva-vyapini | Shipped as its **own** rule, not a variant of Bestu Varas or a renamed label: it's a conceptually different festival (Krishna lifting Govardhan vs. the Gujarati new year) that always happens to share a tithi, the same pattern already handled for Dhanteras/Kali Chaudas coinciding in some years |

## Consequences

- `FESTIVALS` in `packages/calendar/src/festivals.ts` grows from 13 to 30 entries; `pnpm --filter @panchang/calendar festival-checklist` now writes 30 rows/year to `docs/verification/festivals-ahmedabad.md`.
- All 17 are provisional until verified (§0 rule 7) — production shows none of them until a (festival, year) is added to that rule's `verified.years`.
- Dev Uthani Ekadashi and Hanuman Jayanti ship with known regional/convention simplifications, called out above rather than silently picked.
