import type { Instant } from "@panchang/engine";
import type { CivilDay, Interval } from "./types";

/** Time of day an observance's tithi must cover (§3, ADR 0018/0003). */
export type ObservanceWindow =
  "sunrise" | "madhyahna" | "aparahna" | "pradosh" | "nishita";

/**
 * Windows within a civil day (Phase 6 definitions):
 * daylight is split into fifths — madhyahna = 3rd, aparahna = 4th; the night (sunset → next
 * sunrise) into 15 muhurtas — pradosh = first 3, nishita = the 8th (around midnight).
 * "sunrise" is the instant of sunrise.
 */
export function windowInterval(
  window: ObservanceWindow,
  day: CivilDay,
): Interval {
  const daylight = day.sunset - day.sunrise;
  const night = day.nextSunrise - day.sunset;
  const at = (base: Instant, offset: number) =>
    (base + Math.round(offset)) as Instant;
  switch (window) {
    case "sunrise":
      return { start: day.sunrise, end: day.sunrise };
    case "madhyahna":
      return {
        start: at(day.sunrise, (2 / 5) * daylight),
        end: at(day.sunrise, (3 / 5) * daylight),
      };
    case "aparahna":
      return {
        start: at(day.sunrise, (3 / 5) * daylight),
        end: at(day.sunrise, (4 / 5) * daylight),
      };
    case "pradosh":
      return { start: day.sunset, end: at(day.sunset, (3 / 15) * night) };
    case "nishita":
      return {
        start: at(day.sunset, (7 / 15) * night),
        end: at(day.sunset, (8 / 15) * night),
      };
  }
}

/** Overlap (ms) of `spans` with `window`; for the instant "sunrise" window, 1 if covered. */
export function coverage(window: Interval, spans: readonly Interval[]): number {
  if (window.start === window.end) {
    return spans.some((s) => s.start <= window.start && window.start < s.end)
      ? 1
      : 0;
  }
  return spans.reduce(
    (sum, s) =>
      sum +
      Math.max(
        0,
        Math.min(s.end, window.end) - Math.max(s.start, window.start),
      ),
    0,
  );
}

/** `span` minus every interval in `holes`. */
export function subtract(
  span: Interval,
  holes: readonly Interval[],
): Interval[] {
  let pieces: Interval[] = [span];
  for (const h of holes) {
    pieces = pieces.flatMap((p) => {
      if (h.end <= p.start || h.start >= p.end) return [p];
      const out: Interval[] = [];
      if (h.start > p.start) out.push({ start: p.start, end: h.start });
      if (h.end < p.end) out.push({ start: h.end, end: p.end });
      return out;
    });
  }
  return pieces;
}
