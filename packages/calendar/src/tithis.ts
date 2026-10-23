import {
  elongation,
  findCrossing,
  isVishti,
  lunationAt,
  type Instant,
  type Lunation,
} from "@panchang/engine";
import type { Interval } from "./types";

const DAY_MS = 86_400_000;
const STEP = { stepMs: 6 * 3_600_000 }; // elongation moves ~3° in 6 h: far below 180°

/** When tithi `n` (1–30) runs within `lunation`. */
export function tithiInterval(lunation: Lunation, n: number): Interval {
  const start =
    n === 1
      ? lunation.start
      : findCrossing(
          elongation,
          (n - 1) * 12,
          lunation.start,
          lunation.end,
          STEP,
        );
  const end =
    n === 30
      ? lunation.end
      : findCrossing(elongation, n * 12, lunation.start, lunation.end, STEP);
  if (start === null || end === null)
    throw new Error(`tithi ${n} not found in lunation`);
  return { start, end };
}

/** The Vishti (Bhadra) half of tithi `n`, if it has one (karanas 2n−1 and 2n). */
export function bhadraWithin(
  lunation: Lunation,
  n: number,
  tithi: Interval,
): Interval | null {
  const mid = findCrossing(
    elongation,
    (2 * n - 1) * 6,
    tithi.start,
    tithi.end,
    STEP,
  );
  if (mid === null) throw new Error("half-tithi boundary not found");
  if (isVishti(2 * n - 1)) return { start: tithi.start, end: mid };
  if (isVishti(2 * n)) return { start: mid, end: tithi.end };
  return null;
}

/** Lunations overlapping [from, to]. */
export function lunationsBetween(from: Instant, to: Instant): Lunation[] {
  const out = [lunationAt(from)];
  while (out.at(-1)!.end <= to)
    out.push(lunationAt((out.at(-1)!.end + DAY_MS / 2) as Instant));
  return out;
}
