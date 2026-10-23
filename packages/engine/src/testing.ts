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

/** UTC offset of `timeZone` at `instantMs`, in minutes (test/tool only: uses Intl). */
export function utcOffsetMinutes(instantMs: number, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date(instantMs))
    .find((p) => p.type === "timeZoneName")!.value; // "GMT+05:30" or "GMT"
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  return m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
}

/** UTC instant of 00:00 local time on `date` (YYYY-MM-DD) in `timeZone`; DST-safe. */
export function localMidnight(date: string, timeZone: string): Instant {
  const utcMidnight = Date.parse(`${date}T00:00:00Z`);
  let guess = utcMidnight - utcOffsetMinutes(utcMidnight, timeZone) * 60_000;
  guess = utcMidnight - utcOffsetMinutes(guess, timeZone) * 60_000;
  return guess as Instant;
}

/** Local calendar date (YYYY-MM-DD) of an instant in `timeZone`. */
export function localDate(instantMs: number, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(instantMs));
}
