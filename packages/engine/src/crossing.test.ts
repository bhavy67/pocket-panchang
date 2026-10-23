import { MoonPhase, SearchMoonPhase } from "astronomy-engine";
import { describe, expect, it } from "vitest";
import { findCrossing } from "./crossing";
import { elongation, normalizeDegrees } from "./longitude";
import { instant } from "./testing";
import { toAstroTime, type Instant } from "./time";

const SECOND_MS = 1000;
const DAY_MS = 86_400_000;
const T0 = instant("2026-10-01T00:00:00Z");
const after = (ms: number) => (T0 + ms) as Instant;

/** Synthetic angle: starts at `startDeg` at T0 and gains `perDay` degrees per day, wrapping at 360. */
const linear = (startDeg: number, perDay: number) => (t: Instant) =>
  normalizeDegrees(startDeg + (perDay * (t - T0)) / DAY_MS);

describe("findCrossing: synthetic angles (exact answers)", () => {
  it("finds a plain crossing: 10° + 12°/day reaches 46° after exactly 3 days", () => {
    const found = findCrossing(linear(10, 12), 46, T0, after(10 * DAY_MS));
    expect(found).not.toBeNull();
    expect(Math.abs(found! - after(3 * DAY_MS))).toBeLessThanOrEqual(SECOND_MS);
  });

  it("handles the 360° → 0° wraparound: 350° + 12°/day reaches 0° after 10/12 day", () => {
    const found = findCrossing(linear(350, 12), 0, T0, after(2 * DAY_MS));
    expect(Math.abs(found! - after((10 / 12) * DAY_MS))).toBeLessThanOrEqual(
      SECOND_MS,
    );
  });

  it("only searches forward: a target just behind the start angle is ~a lunation away", () => {
    const angle = linear(50, 12);
    expect(findCrossing(angle, 49.9, T0, after(25 * DAY_MS))).toBeNull();
    const found = findCrossing(angle, 49.9, T0, after(31 * DAY_MS));
    expect(Math.abs(found! - after((359.9 / 12) * DAY_MS))).toBeLessThanOrEqual(
      SECOND_MS,
    );
  });

  it("returns null when there is no crossing in the interval", () => {
    expect(findCrossing(linear(10, 12), 100, T0, after(DAY_MS))).toBeNull();
  });

  it("treats the interval as (start, end]: a crossing exactly at start is excluded, exactly at end included", () => {
    const angle = linear(10, 12);
    const crossing = after(3 * DAY_MS); // angle reaches 46° exactly here
    expect(findCrossing(angle, 46, crossing, after(4 * DAY_MS))).toBeNull();
    const atEnd = findCrossing(angle, 46, T0, crossing);
    expect(atEnd).not.toBeNull();
    expect(atEnd!).toBeLessThanOrEqual(crossing);
    expect(crossing - atEnd!).toBeLessThanOrEqual(SECOND_MS);
  });

  it("works when the interval is shorter than one bracketing step", () => {
    const crossing = after(3 * DAY_MS);
    const found = findCrossing(
      linear(10, 12),
      46,
      (crossing - 5 * 60_000) as Instant,
      (crossing + 5 * 60_000) as Instant,
    );
    expect(Math.abs(found! - crossing)).toBeLessThanOrEqual(SECOND_MS);
  });

  it("always returns an integer Instant inside (start, end]", () => {
    const end = after(10 * DAY_MS);
    const found = findCrossing(linear(10, 12.345), 77.7, T0, end)!;
    expect(Number.isInteger(found)).toBe(true);
    expect(found).toBeGreaterThan(T0);
    expect(found).toBeLessThanOrEqual(end);
  });
});

describe("findCrossing: real Moon, against astronomy-engine's own search", () => {
  // Use MoonPhase as the angle so SearchMoonPhase is an exact oracle for the same function.
  const moonPhase = (t: Instant) => MoonPhase(toAstroTime(t));

  it.each([132, 0, 180, 359.5])(
    "matches SearchMoonPhase(%s°) within 1 s",
    (target) => {
      const start = instant("2026-10-22T00:00:00Z");
      const reference = SearchMoonPhase(
        target,
        toAstroTime(start),
        40,
      )!.date.getTime();
      const found = findCrossing(
        moonPhase,
        target,
        start,
        (start + 40 * DAY_MS) as Instant,
      );
      expect(Math.abs(found! - reference)).toBeLessThanOrEqual(SECOND_MS);
    },
  );

  it("is efficient: fewer than 100 angle evaluations for a 2-day window", () => {
    let calls = 0;
    const counted = (t: Instant) => {
      calls++;
      return elongation(t);
    };
    const start = instant("2026-10-22T00:00:00Z");
    expect(
      findCrossing(counted, 132, start, (start + 2 * DAY_MS) as Instant),
    ).not.toBeNull();
    expect(calls).toBeLessThan(100);
  });
});
