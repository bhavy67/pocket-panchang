import { elongation } from "./longitude";
import { segmentEnds } from "./segments";
import type { Instant } from "./time";

const TITHI_DEG = 12;

/**
 * Tithi number 1–30 at an instant: each tithi is a 12° slice of elongation.
 * 1–15 Shukla (15 = Purnima), 16–30 Krishna (30 = Amavasya).
 */
export function tithiAt(instant: Instant): number {
  return Math.floor(elongation(instant) / TITHI_DEG) + 1;
}

export type TithiEnd = {
  /** The tithi that ends (1–30). */
  readonly tithi: number;
  readonly endsAt: Instant;
};

/**
 * Every tithi that ends in (start, end], in time order. For a civil day, pass
 * (sunrise, next sunrise]; the udaya tithi is tithiAt(sunrise) (§4.5).
 */
export function tithiEnds(start: Instant, end: Instant): TithiEnd[] {
  return segmentEnds(elongation, 30, start, end).map(({ index, endsAt }) => ({
    tithi: index,
    endsAt,
  }));
}
