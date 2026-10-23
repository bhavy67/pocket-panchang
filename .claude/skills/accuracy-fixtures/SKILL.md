---
name: accuracy-fixtures
description: Golden reference fixtures and the accuracy report for Pocket Panchang. Use when adding or updating a fixture city/year in fixtures/, recording reference data from Drik Panchang, writing property tests or the grahan cross-check, running or reading the accuracy report, or deciding whether engine output is within tolerance.
---

# Accuracy fixtures

Source of truth: `PROJECT_PLAN.md` §10 (testing strategy) and §4.2 (error budget).

## Fixture coverage

- Cities: **Ahmedabad, Delhi, Chennai, New York, London**.
- Years: at least **2 full years** per city in v1. Phase 4 starts with Ahmedabad, ~1 month.
- Values: tithi/nakshatra/yoga/karana end times, sunrise/sunset, festival dates.

## Adding a fixture city/year

1. Location: name, lat, lng, IANA tz. Use the same values the reference used (wrong coordinates show up as fake sunrise error).
2. Reference: Drik Panchang (§17). Every fixture file **must record its source, URL/settings used (tradition, ayanamsa), sunrise definition (ADR 0012), and retrieval date**.
3. Store as JSON in `fixtures/`, with one file per city per year (exact naming and schema are set in Phase 4; follow what exists).
4. Store times as UTC instants (ISO 8601 `Z` or epoch ms) and keep the reference's local string alongside for audit. The engine never takes local time.
5. Never hand-edit a reference value to match engine output. If the reference looks wrong, flag it to Bhavy with evidence.

## Collecting reference data (Phase 4 method)

- `node scripts/fetch-drik.mjs <geonameId> <name> <from> <to> <out.json>` scrapes Drik day pages.
- Politeness rules: check robots.txt first (2026-10-23: `/panchang/` allowed; `/ajax/`, `/dp-api/` disallowed); ≥ 4 s between requests; raw pages cached in `.cache/drik/` (gitignored, never committed); commit only extracted values with source, URL template, retrieval date, and Drik's own coordinates.
- "upto Full Night" on Drik means the tithi continues past the next sunrise (no end that civil day).
- `pnpm --filter @panchang/engine accuracy` prints the error table (max |err|, mean bias) for every fixture file.

## Phase 5 coverage: sampling, not full scraping (proposed 2026-10-23)

Do **not** scrape 5 cities × 2 years in full. Per city-year, collect **~24 chosen days**:

| Days | What | Why |
|---|---|---|
| 6 | Seasonal anchors, every 2nd month (incl. both solstices) | Sunrise drift with declination and equation of time |
| 10 | The v1 festival days that year (Diwali sequence, Navratri start/end, Holika Dahan/Dhuleti, Janmashtami, Raksha Bandhan, Maha Shivaratri, Uttarayan) | Festival resolver (Phase 6) |
| 4 | 2 vriddhi + 2 kshaya tithi days (found from engine output, then checked against the reference) | Day assembly edge cases |
| 2 | Lunar-month edges: an Amavasya day, and an adhik-month start/end or sankranti day | Month naming, adhik/kshaya masa |
| 2 | DST transition days (New York, London); for Indian cities, 2 more anchors | Time zone handling at the edge |

That is ~240 pages for 5 cities × 2 years (~16 min at 4 s/request, cached). Overlaps free slots for more edge days.

**Independent sunrise cross-check (no scraping):** implement NOAA's published solar equations (public domain; zenith 90.833° = upper limb + 34′ refraction, the same definition) in a test-only helper and compare engine sunrise/sunset for **every day** of both years in all 5 cities, aiming for ±1 min (NOAA states ~1 min accuracy within ±72° latitude). Spot-check a handful of days against the USNO API if NOAA and the engine disagree.

## Tolerances

| Element | Tolerance |
|---|---|
| Sunrise / sunset | ±1 min |
| Tithi / nakshatra end times | ±2 min |
| Festival dates | exact date match |

Do not widen tolerances to make tests pass. A breach is a bug to investigate (wraparound, ayanamsa, refraction, sunrise definition, tz handling).

## Property tests (fast-check)

Exactly 30 tithis per lunation · elongation monotonic between new moons · nakshatras cycle in order · karana sequence correct · vriddhi/kshaya counts consistent per lunation · end times strictly increasing within a day.

## Cross-check and edge cases

- Compare against **grahan** in tests only (never a runtime dep). Flag disagreements beyond tolerance, and don't assume either side is right.
- Must cover: DST transition days (New York, London), date-line-adjacent zones, high latitudes (no-sunrise states), adhik-month years, kshaya tithis, leap years.

## Accuracy report

- A script in `scripts/` prints **max and mean error per element** per city/year; it runs in CI on every run.
- Reading it: max error drives pass/fail; mean error reveals systematic bias (e.g. a constant sunrise offset points to refraction or the limb definition).
- Measured numbers go in the README accuracy section. When reporting results, quote actual output.
