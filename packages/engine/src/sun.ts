import {
  Body,
  Equator,
  GeoVector,
  Horizon,
  KM_PER_AU,
  Observer,
  SearchAltitude,
} from "astronomy-engine";
import { fromAstroTime, toAstroTime, type Instant } from "./time";

/** Degrees; latitude north-positive, longitude east-positive. Sea level (ADR 0012). */
export type Coordinates = {
  readonly latitude: number;
  readonly longitude: number;
};

/** Which point of the Sun touches the horizon, and whether refraction lifts it (ADR 0012). */
export type SunriseDefinition = {
  readonly limb: "upper" | "centre";
  readonly refraction: boolean;
};

export const DEFAULT_SUNRISE: SunriseDefinition = {
  limb: "upper",
  refraction: true,
};

/**
 * A rise or set within the 48 h search window, or an explicit "none" (polar day/night, §4.4).
 * `sunUp` tells which: whether the Sun was above the definition's horizon at the search start.
 */
export type SunEvent =
  | { readonly kind: "event"; readonly at: Instant }
  | { readonly kind: "none"; readonly sunUp: boolean };

/** Standard horizontal refraction used by astronomy-engine's SearchRiseSet: 34′. */
const REFRACTION_DEG = 34 / 60;
const SUN_RADIUS_KM = 695_700;
/**
 * 48 h, not 24 h: consecutive sunrises can be more than 24 h apart (Ahmedabad in October:
 * ~24 h 0.5 min), so a 24 h window misreports "none" when searching from the previous sunrise.
 */
const SEARCH_WINDOW_DAYS = 2;
/**
 * astronomy-engine's root finder can land a few tens of ms from its previous answer, so a
 * search starting 1 ms after a sunrise can find that same sunrise again (seen: +29 ms).
 * Events within 1 s of `after` are treated as `after` itself.
 */
const SAME_EVENT_MS = 1000;

/** First sunrise more than 1 s after `after`, within 48 h. Callers check which civil day it falls on. */
export function nextSunrise(
  after: Instant,
  at: Coordinates,
  definition: SunriseDefinition = DEFAULT_SUNRISE,
): SunEvent {
  return search(+1, after, at, definition);
}

/** First sunset more than 1 s after `after`, within 48 h. Callers check which civil day it falls on. */
export function nextSunset(
  after: Instant,
  at: Coordinates,
  definition: SunriseDefinition = DEFAULT_SUNRISE,
): SunEvent {
  return search(-1, after, at, definition);
}

function search(
  direction: 1 | -1,
  after: Instant,
  at: Coordinates,
  definition: SunriseDefinition,
): SunEvent {
  const observer = new Observer(at.latitude, at.longitude, 0);
  const start = toAstroTime((after + SAME_EVENT_MS) as Instant);
  const threshold = horizonAltitude(start.ut, definition);
  const found = SearchAltitude(
    Body.Sun,
    observer,
    direction,
    start,
    SEARCH_WINDOW_DAYS,
    threshold,
  );
  if (found) return { kind: "event", at: fromAstroTime(found) };
  const sun = Equator(Body.Sun, start, observer, true, true);
  const altitude = Horizon(start, observer, sun.ra, sun.dec).altitude; // geometric, centre
  return { kind: "none", sunUp: altitude > threshold };
}

/**
 * Geometric altitude of the Sun's centre at the moment of rise/set.
 * Upper limb: the centre is one semidiameter (~16′) lower. Refraction: 34′ lower still.
 */
function horizonAltitude(ut: number, definition: SunriseDefinition): number {
  const semidiameter =
    definition.limb === "upper"
      ? (Math.asin(
          SUN_RADIUS_KM / (GeoVector(Body.Sun, ut, true).Length() * KM_PER_AU),
        ) *
          180) /
        Math.PI
      : 0;
  return -(semidiameter + (definition.refraction ? REFRACTION_DEG : 0));
}
