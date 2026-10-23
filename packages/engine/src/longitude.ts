import { EclipticGeoMoon, SunPosition } from "astronomy-engine";
import { toAstroTime, type Instant } from "./time";

/**
 * Normalizes any finite angle in degrees to [0, 360).
 * Must never return 360 (e.g. for a tiny negative input).
 */
export function normalizeDegrees(degrees: number): number {
  const remainder = degrees % 360; // sign follows the input: -10 % 360 === -10
  const positive = remainder < 0 ? remainder + 360 : remainder;
  // -1e-14 + 360 rounds to exactly 360 in float64; also folds -0 to 0.
  return positive === 360 || positive === 0 ? 0 : positive;
}

/**
 * Apparent geocentric ecliptic longitude of the Sun, in degrees [0, 360):
 * true ecliptic and equinox of date (tropical), including aberration and nutation.
 */
export function sunLongitude(instant: Instant): number {
  return normalizeDegrees(SunPosition(toAstroTime(instant)).elon);
}

/** Geocentric ecliptic longitude of the Moon, same frame as sunLongitude, degrees [0, 360). */
export function moonLongitude(instant: Instant): number {
  return normalizeDegrees(EclipticGeoMoon(toAstroTime(instant)).lon);
}

/**
 * Elongation = Moon − Sun, normalized to [0, 360). 0 = new moon, 180 = full moon.
 * Tropical longitudes are fine here: the ayanamsa is subtracted from both and cancels.
 */
export function elongation(instant: Instant): number {
  return normalizeDegrees(moonLongitude(instant) - sunLongitude(instant));
}
