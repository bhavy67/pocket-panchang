import {
  DEFAULT_AYANAMSA,
  siderealLongitude,
  type AyanamsaVariant,
} from "./ayanamsa";
import {
  elongation,
  moonLongitude,
  normalizeDegrees,
  sunLongitude,
} from "./longitude";
import { segmentAt, segmentEnds, type SegmentEnd } from "./segments";
import type { Instant } from "./time";

export const NAKSHATRA_COUNT = 27;
export const YOGA_COUNT = 27;
export const KARANA_COUNT = 60;
export const RASHI_COUNT = 12;

export function siderealSun(
  instant: Instant,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): number {
  return siderealLongitude(sunLongitude(instant), instant, variant);
}

export function siderealMoon(
  instant: Instant,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): number {
  return siderealLongitude(moonLongitude(instant), instant, variant);
}

/** Sidereal Sun + Moon; the ayanamsa counts twice, so it does not cancel (§3). */
export function yogaAngle(
  instant: Instant,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): number {
  return normalizeDegrees(
    siderealSun(instant, variant) + siderealMoon(instant, variant),
  );
}

/** Nakshatra 1–27 (1 = Ashvini) at an instant. */
export function nakshatraAt(
  instant: Instant,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): number {
  return segmentAt(siderealMoon(instant, variant), NAKSHATRA_COUNT);
}

/** Yoga 1–27 (1 = Vishkambha) at an instant. */
export function yogaAt(
  instant: Instant,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): number {
  return segmentAt(yogaAngle(instant, variant), YOGA_COUNT);
}

/** Karana 1–60 (half-tithi) at an instant; see karanaName for the 11 names. */
export function karanaAt(instant: Instant): number {
  return segmentAt(elongation(instant), KARANA_COUNT);
}

export const MOVABLE_KARANAS = [
  "Bava",
  "Balava",
  "Kaulava",
  "Taitila",
  "Garaja",
  "Vanija",
  "Vishti",
] as const;
export type KaranaName =
  | (typeof MOVABLE_KARANAS)[number]
  | "Kimstughna"
  | "Shakuni"
  | "Chatushpada"
  | "Naga";

/** 1 = Kimstughna; 2–57 cycle the 7 movable karanas 8 times; 58–60 = Shakuni, Chatushpada, Naga. */
export function karanaName(index: number): KaranaName {
  if (!Number.isInteger(index) || index < 1 || index > KARANA_COUNT) {
    throw new RangeError(`karana index ${index} is outside 1–60`);
  }
  if (index === 1) return "Kimstughna";
  if (index === 58) return "Shakuni";
  if (index === 59) return "Chatushpada";
  if (index === 60) return "Naga";
  return MOVABLE_KARANAS[(index - 2) % 7]!;
}

/** Vishti karana = Bhadra (ADR 0018). */
export function isVishti(index: number): boolean {
  return index >= 2 && index <= 57 && (index - 2) % 7 === 6;
}

export function nakshatraEnds(
  start: Instant,
  end: Instant,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): SegmentEnd[] {
  return segmentEnds(
    (t) => siderealMoon(t, variant),
    NAKSHATRA_COUNT,
    start,
    end,
  );
}

export function yogaEnds(
  start: Instant,
  end: Instant,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): SegmentEnd[] {
  return segmentEnds((t) => yogaAngle(t, variant), YOGA_COUNT, start, end);
}

export function karanaEnds(start: Instant, end: Instant): SegmentEnd[] {
  return segmentEnds(elongation, KARANA_COUNT, start, end);
}
