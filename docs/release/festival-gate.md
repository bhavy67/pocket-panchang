# Festival gate: what remains before festivals can be shown

Production builds show a festival only when its rule's `verified` field is filled (`packages/calendar/src/festivals.ts`; §0 rule 7, ADR 0018/0021). **Today all 13 rules are unverified, so production shows no festivals.** Dev builds and the E2E build show them, marked "Not yet verified".

A rule becomes shippable when **every** item below for that festival is done, then its `verified` is set to `{ against: "<sources>", years: [2026, 2027] }`. Festivals are independent: verified ones can ship while others stay hidden.

## 1. Date checks (docs/verification/)

| Festival | Ahmedabad 2026 | Ahmedabad 2027 | Other cities (rows in festivals-other-cities.md) | Extra item |
|---|---|---|---|---|
| Uttarayan | ☐ family ☐ Drik | ☐ family ☐ Drik | New York 2027, London 2027 | Display rule (§2 below) |
| Maha Shivaratri | ☐ ☐ | ☐ ☐ | none | |
| Holika Dahan | ☐ ☐ | ☐ ☐ | none | Both years used the **fallback** (no day covered the pradosh window outside Bhadra): confirm the date and the evening time shown; 2026 has a lunar eclipse on 3 Mar to check against references. Bhadra rule (§2) |
| Dhuleti | ☐ ☐ | ☐ ☐ | none | Follows Holika Dahan (+1 day) |
| Raksha Bandhan | ☐ ☐ | ☐ ☐ | none | Check the "Rakhi: after … (after Bhadra)" time too |
| Janmashtami (Smarta) | ☐ ☐ | ☐ ☐ | New York 2026, London 2026 | 2026 used the **fallback**. Rule source (§2) |
| Janmashtami (Vaishnava) | ☐ ☐ | ☐ ☐ | none | Rule source (§2) |
| Navratri | ☐ ☐ (11–20 Oct) | ☐ ☐ (30 Sep–8 Oct) | Delhi 2027, Chennai 2027, New York 2026, London 2026 | 2027 start used the **fallback**; end-day rule (§2) |
| Dussehra | ☐ ☐ | ☐ ☐ | none | |
| Dhanteras | ☐ ☐ | ☐ ☐ | New York 2027 | |
| Kali Chaudas | ☐ ☐ | ☐ ☐ | none | **2027 computes to 27 Oct, the same day as Dhanteras**: check carefully (nishita rule) |
| Diwali | ☐ ☐ | ☐ ☐ | New York 2027, London 2027 | |
| Bestu Varas | ☐ ☐ | ☐ ☐ | New York 2026, London 2026 | |
| Bhai Bij | ☐ ☐ | ☐ ☐ | New York 2026 & 2027, London 2026 & 2027 | |

"family" = your family's printed panchang; "Drik" = Drik Panchang for Ahmedabad. New York and London rows: a local temple calendar.

## 2. Source verifications still open (PROJECT_PLAN.md §13)

- [ ] **Uttarayan:** Gujarat's civic 14 January vs astronomical Makar Sankranti with the after-sunset rule; check 2025–2027 against references and decide what to display (ADR 0018).
- [ ] **Janmashtami:** the Smarta and Vaishnava resolution rules, cited, and checked for the fixture years (ADR 0018).
- [ ] **Navratri end day:** confirm the last day resolves under the same window and tie-break as the first (ADR 0018).
- [ ] **Holika Dahan Bhadra rule,** including when Bhadra covers all of pradosh: classical source and reference (ADR 0018).

## 3. Then

1. Tick the rows above and in `docs/verification/*.md`.
2. Fill `verified` for each passing rule (a relative festival such as Dhuleti also needs its base, Holika Dahan, verified).
3. Run `pnpm test` (resolver tests) and check a production build (`pnpm --filter @panchang/app build && pnpm --filter @panchang/app preview`) shows exactly the verified festivals.
