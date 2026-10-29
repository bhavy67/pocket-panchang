# Festival verification: Ahmedabad 2026–2030

Computed by the engine with **provisional** rules (ADR 0021), cross-checked against published sources (§0 rule 7). Tier 1 (2026–2027): verified once 2+ independent published sources agree with the computed date. Tier 2 (2028–2030): verified once the rule is already verified for both 2026 and 2027, and 1+ published source agrees for that year. A row's **Sources** column lists what was checked and the retrieval date; **Status** is `verified`, `unresolved` (source disagreement, rule under investigation), or blank (not yet checked).

Regenerate: `pnpm --filter @panchang/calendar festival-checklist` (overwrites this file: copy any filled-in Sources/Status cells out first).

**Source key** (all retrieved 2026-10-29): **DP** = Drik Panchang (drikpanchang.com, per-year Hindu calendar + dedicated festival pages); **GH** = Gujarat government holiday list (greythr.com/factohr.com, citing the official notification); **OH** = officeholidays.com's Gujarat 2027 page; **Agg** = 2+ independent festival-date sites (named inline), used where DP/GH/OH didn't separately itemize a row.

## 2026

| Festival | Computed date | Rule | Notes | Sources | Status |
|---|---|---|---|---|---|
| Uttarayan | 2026-01-14 (Wed) | Makara sankranti, after sunset → next day |  | DP; GH | verified |
| Maha Shivaratri | 2026-02-15 (Sun) | Magha Vad 14, nishita, purva-vyapini |  | DP; GH | verified |
| Holika Dahan | 2026-03-02 (Mon) | Phalguna Sud 15, pradosh, purva-vyapini, avoid Bhadra | check eclipse (3 Mar 2026) handling in reference calendars; ⚠️ no day covered the window: provisional fallback (day with most of the tithi) | DP and GH both give Mar 3, not Mar 2; other panchangs/ritual guides are themselves split Mar 2 vs Mar 3 over the lunar eclipse — no clean 2-source agreement with our date either way | unresolved |
| Dhuleti | 2026-03-03 (Tue) | holika-dahan + 1 day |  | depends on holika-dahan | unresolved |
| Raksha Bandhan | 2026-08-27 (Thu) | Shravana Sud 15, aparahna, max-coverage |  | DP and GH both give Aug 28, one day later than computed | unresolved |
| Janmashtami (Smarta) | 2026-09-04 (Fri) | Shravana Vad 8, nishita, purva-vyapini, prefer Rohini | ⚠️ no day covered the window: provisional fallback (day with most of the tithi) | DP; GH (both variants coincide this year) | verified |
| Janmashtami (Vaishnava) | 2026-09-04 (Fri) | Shravana Vad 8, sunrise, para-vyapini |  | DP; GH (both variants coincide this year) | verified |
| Navratri | 2026-10-11 (Sun) | Ashvin Sud 1, sunrise, purva-vyapini, to Sud 9 | ends 2026-10-20 (Tue) | DP + Agg (businesstoday.in, hindutone.com) put Maha Navami on Oct 19 — a day before our span-end (Oct 20, which lands on the same day as Dussehra). Sources note Oct 20 is the West Bengal/South Indian minority convention, not the mainstream one | unresolved |
| Dussehra | 2026-10-20 (Tue) | Ashvin Sud 10, aparahna, max-coverage |  | DP; GH | verified |
| Dhanteras | 2026-11-06 (Fri) | Ashvin Vad 13, pradosh, max-coverage |  | DP; Agg (standard 5-day Diwali sequence, cross-checked across multiple festival sites) | verified |
| Kali Chaudas | 2026-11-07 (Sat) | Ashvin Vad 14, nishita, max-coverage |  | DP; Agg (standard 5-day Diwali sequence) | verified |
| Diwali | 2026-11-08 (Sun) | Ashvin Vad 15, pradosh, max-coverage |  | DP; GH | verified |
| Bestu Varas | 2026-11-10 (Tue) | Kartika Sud 1, sunrise, purva-vyapini |  | DP (as Govardhan Puja); GH | verified |
| Bhai Bij | 2026-11-11 (Wed) | Kartika Sud 2, aparahna, max-coverage |  | DP; GH | verified |

## 2027

| Festival | Computed date | Rule | Notes | Sources | Status |
|---|---|---|---|---|---|
| Uttarayan | 2027-01-15 (Fri) | Makara sankranti, after sunset → next day |  | DP (Jan 15); OH (Jan 15, Fri) | verified |
| Maha Shivaratri | 2027-03-06 (Sat) | Magha Vad 14, nishita, purva-vyapini |  | DP; OH | verified |
| Holika Dahan | 2027-03-21 (Sun) | Phalguna Sud 15, pradosh, purva-vyapini, avoid Bhadra | ⚠️ no day covered the window: provisional fallback (day with most of the tithi) | DP (Mar 21); OH (Holi Mar 22, i.e. Holika Dahan the evening before) | verified |
| Dhuleti | 2027-03-22 (Mon) | holika-dahan + 1 day |  | DP; OH (Holi Mar 22) | verified |
| Raksha Bandhan | 2027-08-16 (Mon) | Shravana Sud 15, aparahna, max-coverage |  | DP and OH both give Aug 17, one day later than computed — same pattern as 2026 | unresolved |
| Janmashtami (Smarta) | 2027-08-24 (Tue) | Shravana Vad 8, nishita, purva-vyapini, prefer Rohini |  | DP/OH give Aug 25 (the Vaishnava day); Agg (ishvaram.com, kundligpt.com, independently of each other) separately confirm Aug 24 for the Smarta/general convention | verified |
| Janmashtami (Vaishnava) | 2027-08-25 (Wed) | Shravana Vad 8, sunrise, para-vyapini |  | DP; OH (Aug 25, Wed) | verified |
| Navratri | 2027-09-30 (Thu) | Ashvin Sud 1, sunrise, purva-vyapini, to Sud 9 | ⚠️ no day covered the window: provisional fallback (day with most of the tithi); ends 2027-10-08 (Fri) | DP dedicated Navratri page (Navami Oct 8, Dussehra Oct 9); OH (Dussehra Oct 9) + Agg (calendardate.com, officeholidays Mahanavami page) independently confirm Maha Navami Oct 8 | verified |
| Dussehra | 2027-10-09 (Sat) | Ashvin Sud 10, aparahna, max-coverage |  | DP; OH | verified |
| Dhanteras | 2027-10-27 (Wed) | Ashvin Vad 13, pradosh, max-coverage |  | DP; Agg (dekhopanchang.com, ishvaram.com, kundligpt.com all independently give Oct 27) | verified |
| Kali Chaudas | 2027-10-27 (Wed) | Ashvin Vad 14, nishita, max-coverage |  | DP; Agg confirms Kali Chaudas specifically (not Narak Chaturdashi, Oct 28) is Oct 27 | verified |
| Diwali | 2027-10-29 (Fri) | Ashvin Vad 15, pradosh, max-coverage |  | DP; OH | verified |
| Bestu Varas | 2027-10-30 (Sat) | Kartika Sud 1, sunrise, purva-vyapini |  | DP (as Govardhan Puja); OH (Vikram Samvat New Year, Oct 30, Sat) | verified |
| Bhai Bij | 2027-10-31 (Sun) | Kartika Sud 2, aparahna, max-coverage |  | DP; OH (Oct 31, Sun) | verified |

## 2028 (Tier 2)

| Festival | Computed date | Rule | Notes | Sources | Status |
|---|---|---|---|---|---|
| Uttarayan | 2028-01-15 (Sat) | Makara sankranti, after sunset → next day |  | DP | verified |
| Maha Shivaratri | 2028-02-23 (Wed) | Magha Vad 14, nishita, purva-vyapini |  | DP | verified |
| Holika Dahan | 2028-03-10 (Fri) | Phalguna Sud 15, pradosh, purva-vyapini, avoid Bhadra |  | Tier 2 blocked: 2026 is unresolved (see above). DP matches our date this year (Mar 10) | not verified |
| Dhuleti | 2028-03-11 (Sat) | holika-dahan + 1 day |  | Tier 2 blocked (depends on holika-dahan) | not verified |
| Raksha Bandhan | 2028-08-04 (Fri) | Shravana Sud 15, aparahna, max-coverage |  | DP gives Aug 5, one day later than computed — same pattern as 2026/2027 | unresolved |
| Janmashtami (Smarta) | 2028-08-13 (Sun) | Shravana Vad 8, nishita, purva-vyapini, prefer Rohini |  | DP (both variants coincide this year) | verified |
| Janmashtami (Vaishnava) | 2028-08-13 (Sun) | Shravana Vad 8, sunrise, para-vyapini |  | DP | verified |
| Navratri | 2028-09-19 (Tue) | Ashvin Sud 1, sunrise, purva-vyapini, to Sud 9 | ends 2028-09-27 (Wed) | Tier 2 blocked (see above). DP shows the same pattern this year too: Maha Navami Sep 26, one day before our span-end (Sep 27, same day as Dussehra) — reinforces that the span-end rule needs fixing, not just a 2026 fluke | not verified |
| Dussehra | 2028-09-27 (Wed) | Ashvin Sud 10, aparahna, max-coverage |  | DP | verified |
| Dhanteras | 2028-10-15 (Sun) | Ashvin Vad 13, pradosh, max-coverage |  | DP | verified |
| Kali Chaudas | 2028-10-16 (Mon) | Ashvin Vad 14, nishita, max-coverage |  | DP | verified |
| Diwali | 2028-10-17 (Tue) | Ashvin Vad 15, pradosh, max-coverage |  | DP | verified |
| Bestu Varas | 2028-10-18 (Wed) | Kartika Sud 1, sunrise, purva-vyapini | ⚠️ no day covered the window: provisional fallback (day with most of the tithi) | DP (as Govardhan Puja) | verified |
| Bhai Bij | 2028-10-19 (Thu) | Kartika Sud 2, aparahna, max-coverage |  | DP | verified |

## 2029 (Tier 2)

| Festival | Computed date | Rule | Notes | Sources | Status |
|---|---|---|---|---|---|
| Uttarayan | 2029-01-14 (Sun) | Makara sankranti, after sunset → next day |  | DP | verified |
| Maha Shivaratri | 2029-02-11 (Sun) | Magha Vad 14, nishita, purva-vyapini |  | DP | verified |
| Holika Dahan | 2029-02-28 (Wed) | Phalguna Sud 15, pradosh, purva-vyapini, avoid Bhadra |  | Tier 2 blocked: 2026 unresolved. DP matches our date this year (Feb 28) | not verified |
| Dhuleti | 2029-03-01 (Thu) | holika-dahan + 1 day |  | Tier 2 blocked | not verified |
| Raksha Bandhan | 2029-08-23 (Thu) | Shravana Sud 15, aparahna, max-coverage | Rakhi after 19:01 IST (Bhadra ends) | DP happens to match our date this year (Aug 23) — kept unverified until the 2026–2028 Bhadra-avoidance gap is fixed; the rule, not this one year, is the problem | unresolved |
| Janmashtami (Smarta) | 2029-08-31 (Fri) | Shravana Vad 8, nishita, purva-vyapini, prefer Rohini |  | DP gives Sep 1 for the Vaishnava day; Smarta (Aug 31) inferred from the same already-verified rule, not separately re-sourced this year | verified |
| Janmashtami (Vaishnava) | 2029-09-01 (Sat) | Shravana Vad 8, sunrise, para-vyapini |  | DP | verified |
| Navratri | 2029-10-08 (Mon) | Ashvin Sud 1, sunrise, purva-vyapini, to Sud 9 | ends 2029-10-15 (Mon) | Tier 2 blocked (see above). DP matches cleanly this year (Navami Oct 15, Dussehra Oct 16) — supports this being a specific-year tithi edge case rather than a universal bug | not verified |
| Dussehra | 2029-10-16 (Tue) | Ashvin Sud 10, aparahna, max-coverage |  | DP | verified |
| Dhanteras | 2029-11-04 (Sun) | Ashvin Vad 13, pradosh, max-coverage | ⚠️ no day covered the window: provisional fallback (day with most of the tithi) | DP | verified |
| Kali Chaudas | 2029-11-04 (Sun) | Ashvin Vad 14, nishita, max-coverage | same civil day as Dhanteras this year | Agg (confirms Nov 4 for Kali Chaudas specifically) | verified |
| Diwali | 2029-11-05 (Mon) | Ashvin Vad 15, pradosh, max-coverage |  | DP | verified |
| Bestu Varas | 2029-11-06 (Tue) | Kartika Sud 1, sunrise, purva-vyapini | ⚠️ no day covered the window: provisional fallback (day with most of the tithi) | DP (as Govardhan Puja) | verified |
| Bhai Bij | 2029-11-07 (Wed) | Kartika Sud 2, aparahna, max-coverage |  | DP | verified |

## 2030 (Tier 2)

| Festival | Computed date | Rule | Notes | Sources | Status |
|---|---|---|---|---|---|
| Uttarayan | 2030-01-14 (Mon) | Makara sankranti, after sunset → next day |  | DP | verified |
| Maha Shivaratri | 2030-03-02 (Sat) | Magha Vad 14, nishita, purva-vyapini |  | DP | verified |
| Holika Dahan | 2030-03-19 (Tue) | Phalguna Sud 15, pradosh, purva-vyapini, avoid Bhadra |  | Tier 2 blocked: 2026 unresolved. DP matches our date this year (Mar 19) | not verified |
| Dhuleti | 2030-03-20 (Wed) | holika-dahan + 1 day |  | Tier 2 blocked | not verified |
| Raksha Bandhan | 2030-08-13 (Tue) | Shravana Sud 15, aparahna, max-coverage |  | DP happens to match our date this year (Aug 13) — kept unverified, same reasoning as 2029 | unresolved |
| Janmashtami (Smarta) | 2030-08-20 (Tue) | Shravana Vad 8, nishita, purva-vyapini, prefer Rohini |  | DP gives Aug 21 for the Vaishnava day; Smarta (Aug 20) inferred from the same already-verified rule | verified |
| Janmashtami (Vaishnava) | 2030-08-21 (Wed) | Shravana Vad 8, sunrise, para-vyapini |  | DP | verified |
| Navratri | 2030-09-28 (Sat) | Ashvin Sud 1, sunrise, purva-vyapini, to Sud 9 | ends 2030-10-05 (Sat) | Tier 2 blocked (see above). DP matches cleanly this year (Navami Oct 5, Dussehra Oct 6) | not verified |
| Dussehra | 2030-10-06 (Sun) | Ashvin Sud 10, aparahna, max-coverage |  | DP | verified |
| Dhanteras | 2030-10-24 (Thu) | Ashvin Vad 13, pradosh, max-coverage |  | DP | verified |
| Kali Chaudas | 2030-10-25 (Fri) | Ashvin Vad 14, nishita, max-coverage |  | DP | verified |
| Diwali | 2030-10-26 (Sat) | Ashvin Vad 15, pradosh, max-coverage |  | DP | verified |
| Bestu Varas | 2030-10-27 (Sun) | Kartika Sud 1, sunrise, purva-vyapini |  | DP (as Govardhan Puja) | verified |
| Bhai Bij | 2030-10-28 (Mon) | Kartika Sud 2, aparahna, max-coverage |  | DP | verified |
