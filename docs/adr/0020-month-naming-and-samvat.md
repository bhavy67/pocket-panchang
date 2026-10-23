---
status: accepted; two source verifications pending (§13)
date: 2026-10-23
---

# 0020. Lunar month naming and samvat year boundaries

## Month naming (Amanta, §4.6)

- A lunar month runs from one new moon to the next. Let *r* be the sidereal rashi of the Sun at the starting new moon (Lahiri, ADR 0019).
- **Name** = the month after rashi *r*: the Sun normally enters rashi *r + 1* during the month, and Mesha entered → Chaitra, Vrishabha → Vaishakha, … (Sun in Meena at the new moon → Chaitra).
- **0 sankrantis → adhik**: same name, flagged adhik (it is named after the following, nija month).
- **2 sankrantis → kshaya cycle**: the month keeps the name for *r + 1* and **absorbs** the name for *r + 2* (ADR 0008).
- Verified: every month name on 82 Drik days (2026–27) incl. **Adhik Jyeshtha 2026 (17 May – 15 Jun)**; 1982–83 gives adhik Ashvin → Pausha (+Magha) → adhik Phalguna. Drik's label for that two-sankranti month could not be checked (Drik blocks automated access) and is a pending verification.

## Year boundaries (samvat)

- **Rule:** the year changes on the **first civil day whose sunrise tithi is Sud 1 or later** of the nija Kartika (Vikram Samvat, Kartikadi = Gujarati) or nija Chaitra (Vikram Chaitradi, Shaka) month — i.e. the first sunrise after that month's new moon. A **kshaya pratipada** therefore still resolves: the new year starts on a Sud 2 sunrise (a real case 2000–2040 is in the tests).
- Year numbers: Kartikadi = (UTC year of the Kartika new moon) + 57; Chaitradi = (UTC year of the Chaitra new moon) + 57; Shaka = that year − 78. Verified on 82 Drik days incl. both new-year boundaries: 0 mismatches.

## Pending source verifications (§13)

- New-year day when pratipada is kshaya (the rule above).
- Year start in a year whose Chaitra or Kartika is adhik: we start the year with the **nija** month (as festivals are nija-only); confirm.
