import { e_tilt } from "astronomy-engine";
import { normalizeDegrees } from "./longitude";
import { toAstroTime, type Instant } from "./time";

/**
 * Lahiri (Chitrapaksha) ayanamsa variants (ADR 0019):
 * - "mean": Swiss Ephemeris SIDM_LAHIRI definition — 23°15′00.658″ at 1956-03-21 (true value
 *   per the Indian Ephemeris) minus that day's nutation, precessed with IAU 1976.
 * - "true": mean + nutation in longitude (Δψ) of the date.
 */
export type AyanamsaVariant = "mean" | "true";

export const DEFAULT_AYANAMSA: AyanamsaVariant = "mean";

const AYANAMSA_AT_T0 = 23.250182778 - 0.004658035;
/** 1956-03-21T00:00 TT, as TT days since J2000. */
const T0_TT_DAYS = 2435553.5 - 2451545.0;

/** IAU 1976 general precession in longitude since J2000, arcseconds (Lieske 1977). */
function precessionArcsec(ttDays: number): number {
  const t = ttDays / 36525;
  return 5029.0966 * t + 1.11113 * t * t - 0.000006 * t * t * t;
}

/** Lahiri ayanamsa in degrees at an instant. */
export function lahiriAyanamsa(
  instant: Instant,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): number {
  const time = toAstroTime(instant);
  const mean =
    AYANAMSA_AT_T0 +
    (precessionArcsec(time.tt) - precessionArcsec(T0_TT_DAYS)) / 3600;
  return variant === "true" ? mean + e_tilt(time).dpsi / 3600 : mean;
}

/** Tropical → sidereal (Lahiri) longitude, degrees [0, 360). */
export function siderealLongitude(
  tropicalDegrees: number,
  instant: Instant,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): number {
  return normalizeDegrees(tropicalDegrees - lahiriAyanamsa(instant, variant));
}
