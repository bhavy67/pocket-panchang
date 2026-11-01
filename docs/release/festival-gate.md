# Festival gate: what ships and what remains

Production builds show a festival for a year only when that year is in its rule's `verified.years` (`packages/calendar/src/festivals.ts`; §0 rule 7, ADR 0018/0021). Dev builds and the E2E build show every rule, marked "Not yet verified".

**Status (2026-10-31), from `festivals.ts` and `docs/verification/festivals-ahmedabad.md`:** 10 of the 13 v1 rules (11 entries, Janmashtami has two variants) are verified for 2026–2030, three are partly or not verified, and the 17 festivals added later are all unverified.

Verification method (set in that file): **Tier 1** (2026–2027) needs 2+ independent published sources agreeing with the computed Ahmedabad date (Drik Panchang, the Gujarat government holiday list, officeholidays.com, festival sites); **Tier 2** (2028–2030) needs the rule verified for both 2026 and 2027 plus 1+ source for that year. A family printed panchang was not used as a source.

## 1. v1 festivals (Ahmedabad)

| Festival | Ships in production | Why not the rest |
|---|---|---|
| Uttarayan | 2026–2030 | |
| Maha Shivaratri | 2026–2030 | |
| Janmashtami (Smarta) | 2026–2030 | |
| Janmashtami (Vaishnava) | 2026–2030 | |
| Dussehra | 2026–2030 | |
| Dhanteras | 2026–2030 | |
| Kali Chaudas | 2026–2030 | |
| Diwali | 2026–2030 | |
| Bestu Varas | 2026–2030 | |
| Bhai Bij | 2026–2030 | |
| Holika Dahan | **2027 only** | 2026: the 3 Mar lunar eclipse split published panchangs between 2 and 3 Mar (we compute 2 Mar; Drik and the Gujarat list say 3 Mar). Blocks Tier 2 for 2028–2030 although Drik matches those years |
| Dhuleti | **2027 only** | Follows Holika Dahan (+1 day), inherits its 2026 status |
| Navratri | **2027 only** | 2026: our span ends on Sud 9 = the same day as Dussehra (20 Oct); mainstream sources put Maha Navami a day earlier (19 Oct). Blocks Tier 2 |
| Raksha Bandhan | **Never** | Every checked year (2026–2028) sources date it one day later than computed; the rule likely needs Bhadra avoidance in date resolution, not just in the "Rakhi after …" time |

## 2. Festivals added later (all unverified, hidden in production)

Ganesh Chaturthi, Ram Navami, Vasant Panchami, Guru Purnima, Akshaya Tritiya, Nag Panchami, Sharad Purnima, Dev Uthani Ekadashi, Tulsi Vivah, Rath Yatra, Hanuman Jayanti, Chaitra Navratri, Gaura Purnima, Nrisimha Chaturdashi, Radhashtami, Jhulan Yatra, Govardhan Puja. Rules are provisional (ADR 0027); none has rows in `docs/verification/` yet.

## 3. Open items

- [ ] **Raksha Bandhan rule:** add Bhadra avoidance to date resolution, re-run the checklist, verify (ADR 0018).
- [ ] **Navratri end day:** decide whether the span ends on Sud 9 by the mainstream convention when Sud 9 and Sud 10 share a day; then re-check 2026 (ADR 0018).
- [ ] **Holika Dahan 2026:** decide how to handle the eclipse-year split (show 3 Mar per Drik/Gujarat, or keep 2026 hidden). 2026's date has already passed, so this now only matters for unblocking Tier 2 (2028–2030).
- [ ] **Other cities:** gating is per rule and year, not per city, so a verified festival also ships for every other city. The dates that differ from Ahmedabad (`docs/verification/festivals-other-cities.md`, e.g. New York and London Diwali 2027 on 28 Oct vs 29 Oct) are all still unchecked. Check them against a local temple calendar.
- [ ] **The 17 later festivals:** generate their checklist rows and verify the same way.
- [x] Uttarayan display rule (civic 14 Jan vs astronomical sankranti): the astronomical after-sunset rule matched the sources every year 2026–2030 (e.g. 15 Jan 2027, not the civic 14 Jan).
- [x] Janmashtami Smarta/Vaishnava rules: verified 2026–2030 (both variants coincide in 2026).

## 4. To verify a rule

1. `pnpm --filter @panchang/calendar festival-checklist` (overwrites `festivals-ahmedabad.md`: copy the Sources/Status cells out first), then fill in the sources and status per year.
2. Set the rule's `verified` (`{ against: "<sources>", years: [...] }`); a relative festival such as Dhuleti also needs its base verified.
3. Run `pnpm test`, then check a production build (`pnpm --filter @panchang/app build && pnpm --filter @panchang/app preview`) shows exactly the verified festivals.
