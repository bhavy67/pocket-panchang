---
status: accepted
date: 2026-10-23
---

# 0019. Lahiri ayanamsa: the mean (Swiss Ephemeris) variant

Nakshatra, yoga and sankranti use sidereal longitudes: tropical minus the **Lahiri ayanamsa**. "Lahiri" exists in variants that differ by up to ~17″ (nutation). We implemented two and let the reference decide (as for sunrise, ADR 0012):

- **mean** (chosen): the Swiss Ephemeris `SIDM_LAHIRI` definition — 23°15′00.658″ at 1956-03-21 (true value per the Indian Ephemeris) minus that day's nutation, precessed with IAU 1976. Matches grahan's 0.002″ fit to Swiss Ephemeris within 0.31″ over 1900–2100.
- **true**: mean + nutation in longitude (Δψ, from astronomy-engine).

## Evidence (Ahmedabad, 82 Drik Panchang days, 2026–27; engine − Drik)

| Element | mean | true |
|---|---|---|
| Nakshatra ends (79) | **+18 s** (−13…+53) | +34.5 s (+3…+74) |
| Yoga ends (88) | −16 s (−58…+24) | +15 s (−25…+61) |

Both pass ±2 min with every civil day's element sequence matching; **mean** is closer for nakshatra and equal for yoga, and it is the de-facto standard (Swiss Ephemeris default).

A consistency check supports this. Drik's tithi ends are ~60 s earlier than ours and than JPL Horizons (our Sun/Moon match JPL within 5″). Assuming Drik uses the same mean Lahiri, the three biases (tithi +60 s, nakshatra +18 s, yoga −16 s) solve consistently to **Drik's Sun ≈ 20″ behind the true apparent Sun** (≈ one extra annual aberration) with its Moon close to ours. That is the most likely cause of the Phase 4 tithi offset; we do not calibrate toward it.

Drik's *displayed* "Lahiri Ayanamsha" is a constant **24.1″** above mean Lahiri on every day, so it is not the value its element times are computed with; we do not use it.

## Consequences

- `DEFAULT_AYANAMSA = "mean"`; the variant stays an engine parameter (`AyanamsaVariant`), not user-facing.
- Changing the default bumps `engineVersion` (§7).
