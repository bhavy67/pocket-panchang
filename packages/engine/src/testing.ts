// Test-only helpers. Not exported from index.ts.
import { isParseError } from "./parse";
import { parseInstant, type Instant } from "./time";

/** Parses an ISO string to an Instant, or throws. */
export function instant(iso: string): Instant {
  const parsed = parseInstant(Date.parse(iso));
  if (isParseError(parsed)) throw new Error(parsed.message);
  return parsed;
}

/** Smallest angle between two directions, in degrees, in [0, 180]. */
export function angularDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}
