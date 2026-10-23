// The CivilClock (calendar types.ts): time zones applied only at the edge, via Intl (§5.2 rule 3).
// Used by the worker (to feed the engine local midnights) and by the UI (to show local times).
import type { CivilClock } from "@panchang/calendar";
import type { CivilDate, Instant } from "@panchang/engine";

const offsetFormats = new Map<string, Intl.DateTimeFormat>();
const dateFormats = new Map<string, Intl.DateTimeFormat>();

function cached(
  map: Map<string, Intl.DateTimeFormat>,
  tz: string,
  make: () => Intl.DateTimeFormat,
) {
  let f = map.get(tz);
  if (!f) map.set(tz, (f = make()));
  return f;
}

/** UTC offset of `tz` at `ms`, in minutes east of UTC. */
function offsetMinutes(ms: number, tz: string): number {
  const name = cached(
    offsetFormats,
    tz,
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "longOffset",
      }),
  )
    .formatToParts(ms)
    .find((p) => p.type === "timeZoneName")?.value;
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name ?? "");
  return m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0; // "GMT" = UTC
}

/**
 * UTC instant of local wall time `hh:mm` on `date` in `tz`, using the zone's history (e.g.
 * Asia/Kolkata at +06:30 in 1943, ADR 0006). A time inside a DST gap resolves just after it.
 */
export function localInstant(
  date: CivilDate,
  time: string,
  tz: string,
): Instant {
  const utc = Date.parse(`${date}T${time}:00Z`);
  const guess = utc - offsetMinutes(utc, tz) * 60_000;
  return (utc - offsetMinutes(guess, tz) * 60_000) as Instant;
}

export function clockFor(tz: string): CivilClock {
  const dateFormat = cached(
    dateFormats,
    tz,
    () =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
  );
  return {
    localMidnight(date) {
      // Two passes settle the offset in force at local midnight. If midnight falls in a DST
      // gap, the result is the first instant after the gap that maps to `date`.
      const utc = Date.parse(`${date}T00:00:00Z`);
      const guess = utc - offsetMinutes(utc, tz) * 60_000;
      const at = utc - offsetMinutes(guess, tz) * 60_000;
      return (this.localDate(at as Instant) === date ? at : guess) as Instant;
    },
    localDate(instant) {
      return dateFormat.format(instant) as CivilDate;
    },
  };
}
