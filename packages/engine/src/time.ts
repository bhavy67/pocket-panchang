import { AstroTime } from "astronomy-engine";
import { parseError, type ParseError } from "./parse";

declare const instantBrand: unique symbol;

/**
 * A UTC instant as integer milliseconds since the Unix epoch (1970-01-01T00:00:00Z).
 * The only time type in the engine's public API (§5.2, ADR 0014).
 * Produced only by `parseInstant` and `fromAstroTime`.
 */
export type Instant = number & { readonly [instantBrand]: true };

/** Supported range: 1800-01-01T00:00:00Z ≤ instant < 2201-01-01T00:00:00Z. */
export const MIN_INSTANT_MS = Date.UTC(1800, 0, 1);
export const MAX_INSTANT_MS = Date.UTC(2201, 0, 1);

const MS_PER_DAY = 86_400_000;
/** astronomy-engine's epoch: J2000 = 2000-01-01T12:00:00Z (noon, not midnight). */
const J2000_MS = Date.UTC(2000, 0, 1, 12);

/**
 * Accepts a finite, integer millisecond value inside the supported range.
 * Everything else (NaN, ±Infinity, fractions, out of range) is a ParseError.
 */
export function parseInstant(ms: number): Instant | ParseError {
  if (!Number.isInteger(ms)) {
    return parseError(
      `Instant must be an integer number of milliseconds, got ${ms}`,
    );
  }
  if (ms < MIN_INSTANT_MS || ms >= MAX_INSTANT_MS) {
    return parseError(
      `Instant ${ms} is outside the supported range (1800–2200)`,
    );
  }
  return ms as Instant;
}

/** Converts to astronomy-engine's time (UT days since J2000 = 2000-01-01T12:00:00Z). */
export function toAstroTime(instant: Instant): AstroTime {
  return new AstroTime((instant - J2000_MS) / MS_PER_DAY);
}

/**
 * Converts back, rounding to the nearest millisecond so round trips are exact.
 * Throws RangeError outside [MIN, MAX): every constructor of Instant must uphold the
 * brand, and an out-of-range library result is a bug, not user input.
 */
export function fromAstroTime(time: AstroTime): Instant {
  const ms = Math.round(time.ut * MS_PER_DAY) + J2000_MS;
  if (ms < MIN_INSTANT_MS || ms >= MAX_INSTANT_MS) {
    throw new RangeError(
      `AstroTime ${time.toString()} is outside the supported range (1800–2200)`,
    );
  }
  return ms as Instant;
}
