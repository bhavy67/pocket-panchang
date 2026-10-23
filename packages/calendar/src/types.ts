import type { CivilDate, Instant, LunarMonth } from "@panchang/engine";

/** A place snapshot (§6, ADR 0007). */
export type Location = {
  readonly id: string;
  readonly name: string;
  readonly lat: number;
  readonly lng: number;
  readonly tz: string;
  readonly country: string;
};

/**
 * Civil-date conversions for one IANA zone, implemented by the caller with Intl (the calendar
 * package is pure and bans Intl, §5.2 rule 3).
 */
export type CivilClock = {
  /** UTC instant of 00:00 local time on `date`. */
  localMidnight(date: CivilDate): Instant;
  /** Local calendar date of `instant`. */
  localDate(instant: Instant): CivilDate;
};

/** Returns the clock for an IANA zone. */
export type ClockFor = (tz: string) => CivilClock;

export type Interval = { readonly start: Instant; readonly end: Instant };

/** One civil day at a place: sunrise → next sunrise (§4.5). */
export type CivilDay = {
  readonly date: CivilDate;
  readonly sunrise: Instant;
  readonly sunset: Instant;
  readonly nextSunrise: Instant;
};

export type LunarDate = {
  readonly month: LunarMonth;
  /** The original date was in an adhik month (ADR 0009). */
  readonly adhik?: boolean;
  readonly paksha: "shukla" | "krishna";
  /** 1–15 within the paksha (15 = Purnima / Amavasya). */
  readonly tithi: number;
};

/** Tithi number 1–30 for a paksha + tithi-in-paksha. */
export function tithiNumber(
  paksha: "shukla" | "krishna",
  tithi: number,
): number {
  return paksha === "shukla" ? tithi : 15 + tithi;
}
