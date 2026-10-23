import { findCrossing, type CrossingOptions } from "./crossing";
import type { Instant } from "./time";

/** One segment (tithi, nakshatra, yoga, karana) ending at an instant. */
export type SegmentEnd = {
  /** 1-based index of the segment that ends. */
  readonly index: number;
  readonly endsAt: Instant;
};

/**
 * Splits an increasing (mod 360) angle into `count` equal segments numbered 1…count and
 * returns every segment end in (start, end], in order. Segment n ends at n × (360 / count)°.
 */
export function segmentEnds(
  angle: (t: Instant) => number,
  count: number,
  start: Instant,
  end: Instant,
  options?: CrossingOptions,
): SegmentEnd[] {
  const size = 360 / count;
  const ends: SegmentEnd[] = [];
  let from = start;
  let index = segmentAt(angle(start), count);
  for (;;) {
    const endsAt = findCrossing(
      angle,
      (index * size) % 360,
      from,
      end,
      options,
    );
    if (endsAt === null) return ends;
    ends.push({ index, endsAt });
    from = endsAt;
    index = (index % count) + 1;
  }
}

/** 1-based segment containing `degrees` (in [0, 360)). */
export function segmentAt(degrees: number, count: number): number {
  return Math.min(Math.floor(degrees / (360 / count)), count - 1) + 1;
}
