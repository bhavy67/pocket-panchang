import {
  addDays,
  nextSunrise,
  nextSunset,
  type CivilDate,
  type Coordinates,
  type Instant,
} from "@panchang/engine";
import type { CivilClock, CivilDay, Interval } from "./types";

/** The civil day of `date` at `place`, or null in polar conditions. */
export function civilDay(
  date: CivilDate,
  place: Coordinates,
  clock: CivilClock,
): CivilDay | null {
  const rise = nextSunrise(clock.localMidnight(date), place);
  if (rise.kind !== "event") return null;
  const set = nextSunset(rise.at, place);
  const next = nextSunrise(rise.at, place);
  if (set.kind !== "event" || next.kind !== "event") return null;
  return { date, sunrise: rise.at, sunset: set.at, nextSunrise: next.at };
}

/** The civil day whose span (sunrise, next sunrise] contains `t`. */
export function civilDayContaining(
  t: Instant,
  place: Coordinates,
  clock: CivilClock,
): CivilDay {
  let date = clock.localDate(t);
  for (let guard = 0; guard < 3; guard++) {
    const day = civilDay(date, place, clock);
    if (!day) throw new Error(`no civil day on ${date}`);
    if (t < day.sunrise) date = addDays(date, -1);
    else if (t >= day.nextSunrise) date = addDays(date, 1);
    else return day;
  }
  throw new Error(`civil day for ${new Date(t).toISOString()} not found`);
}

/** Consecutive civil days overlapping `interval`. */
export function civilDaysOverlapping(
  interval: Interval,
  place: Coordinates,
  clock: CivilClock,
): CivilDay[] {
  const days = [civilDayContaining(interval.start, place, clock)];
  while (days.at(-1)!.nextSunrise < interval.end) {
    const next = civilDay(addDays(days.at(-1)!.date, 1), place, clock);
    if (!next) break;
    days.push(next);
  }
  return days;
}
