---
status: accepted; to be confirmed by Phase 4 fixtures
date: 2026-10-22
---

# 0012. Sunrise definition: upper limb with refraction, as an engine parameter (§13 #5)

Sunrise and sunset use the **upper limb of the Sun with standard atmospheric refraction, at sea level (no elevation)**. This matches the default stated by our fixture reference: Drik Panchang's sunrise page says it "uses upper edge of sun along with refraction… by default we don't consider elevation" (drikpanchang.com/panchang/sunrise/panchang-sunrise.html, retrieved 2026-10-22). Drik's older FAQ (drikpanchang.com/faq/faq-ans2.html) contradicts it ("middle of the sun's disk… ignores refraction"). The two definitions differ by ~50′ of solar altitude, roughly 3–4 minutes at Indian latitudes, far beyond the ±1 min budget (§4.2). So the fixtures must settle which one the reference actually uses.

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
