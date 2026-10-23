---
status: accepted; confirmed by Phase 4 fixtures (2026-10-23)
date: 2026-10-22
---

# 0012. Sunrise definition: upper limb with refraction, as an engine parameter (§13 #5)

Sunrise and sunset use the **upper limb of the Sun with standard atmospheric refraction, at sea level (no elevation)**. This matches the default stated by our fixture reference: Drik Panchang's sunrise page says it "uses upper edge of sun along with refraction… by default we don't consider elevation" (drikpanchang.com/panchang/sunrise/panchang-sunrise.html, retrieved 2026-10-22). Drik's older FAQ (drikpanchang.com/faq/faq-ans2.html) contradicts it ("middle of the sun's disk… ignores refraction"). The two definitions differ by ~50′ of solar altitude, roughly 3–4 minutes at Indian latitudes, far beyond the ±1 min budget (§4.2). So the fixtures must settle which one the reference actually uses.

## Phase 4 confirmation (2026-10-23)

Against 31 days of Drik Panchang reference data for Ahmedabad (Oct 2026, `fixtures/ahmedabad-2026.json`, using Drik's own coordinates), errors engine − reference:

| Definition | Sunrise max / mean | Sunset max / mean |
|---|---|---|
| **upper + refraction (default)** | **33 s / +8 s** | **29 s / +2 s** |
| centre + refraction | 103 s / +78 s | 98 s / −69 s |
| upper, no refraction | 182 s / +158 s | 178 s / −148 s |
| centre, no refraction | 254 s / +228 s | 250 s / −219 s |

Only the default fits within ±1 min, and its mean error is near zero, so Drik's day pages use upper limb + refraction (its older FAQ page is out of date). The reference has minute precision, so ±30 s of each error is quantization.

## Engine parameter, not a constant

```ts
type SunriseDefinition = { limb: "upper" | "centre"; refraction: boolean };
// default: { limb: "upper", refraction: true }
```

The engine takes the definition as an input (consistent with the pure-engine rule, §5.2). It is **not user-facing in v1**.

## Consequences

- **Phase 4** runs both `{upper, refraction}` and `{centre, no refraction}` against the reference fixtures and records which matches. If the default doesn't match within ±1 min, this ADR is revisited before anything is built on it.
- **Fixture files** record the sunrise definition their reference uses.
- If exposed as a setting later (possible v2 "Hindu sunrise: centre of disc" for users matching a pandit's calendar), the definition joins the month cache key (§7); no engine refactor is needed. Changing the default bumps `engineVersion`.
- The "How this is calculated" page (§9) states the definition in plain language.
- Polar cases (no sunrise/sunset) return explicit states (§4.4).
