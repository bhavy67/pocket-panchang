// Invariant / property tests (§10), fast-check over random instants 1900–2100.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { assembleDay } from "./day";
import { karanaEnds, nakshatraEnds } from "./elements";
import { elongation, normalizeDegrees } from "./longitude";
import { lunationAt } from "./months";
import { tithiAt, tithiEnds } from "./tithi";
import type { Coordinates } from "./sun";
import type { Instant } from "./time";

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const AHMEDABAD: Coordinates = { latitude: 23.025556, longitude: 72.587222 };
const anyInstant = fc
  .integer({ min: Date.UTC(1900, 0, 1), max: Date.UTC(2100, 0, 1) })
  .map((ms) => ms as Instant);
const RUNS = { numRuns: 25 };

describe("properties (§10)", () => {
  it("exactly 30 tithis per lunation, numbered 1 → 30", () => {
    fc.assert(
      fc.property(anyInstant, (t) => {
        const l = lunationAt(t);
        const ends = tithiEnds(
          (l.start + HOUR_MS) as Instant,
          (l.end + HOUR_MS) as Instant,
        );
        expect(ends.map((e) => e.tithi)).toEqual(
          Array.from({ length: 30 }, (_, i) => i + 1),
        );
      }),
      RUNS,
    );
  });

  it("karana sequence: 60 per lunation, in order 1 → 60", () => {
    fc.assert(
      fc.property(anyInstant, (t) => {
        const l = lunationAt(t);
        const ends = karanaEnds(
          (l.start + HOUR_MS) as Instant,
          (l.end + HOUR_MS) as Instant,
        );
        expect(ends.map((e) => e.index)).toEqual(
          Array.from({ length: 60 }, (_, i) => i + 1),
        );
      }),
      RUNS,
    );
  });

  it("elongation increases monotonically between new moons (10.7–14.5°/day)", () => {
    fc.assert(
      fc.property(
        anyInstant,
        fc.integer({ min: 1, max: 6 * 60 }),
        (t, minutes) => {
          const gained = normalizeDegrees(
            elongation((t + minutes * 60_000) as Instant) - elongation(t),
          );
          const perDay = (gained / minutes) * 1440;
          expect(perDay).toBeGreaterThan(10.7);
          expect(perDay).toBeLessThan(14.5);
        },
      ),
      { numRuns: 200 },
    );
  });

  it("nakshatras cycle in order 1 → 27 → 1 over any 30 days", () => {
    fc.assert(
      fc.property(anyInstant, (t) => {
        const ends = nakshatraEnds(t, (t + 30 * DAY_MS) as Instant);
        expect(ends.length).toBeGreaterThanOrEqual(27);
        for (let i = 1; i < ends.length; i++)
          expect(ends[i]!.index).toBe((ends[i - 1]!.index % 27) + 1);
      }),
      RUNS,
    );
  });

  it("vriddhi/kshaya bookkeeping: next day's sunrise tithi = this day's + number of ends (mod 30)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: Date.UTC(1950, 0, 1), max: Date.UTC(2090, 0, 1) }),
        (ms) => {
          const midnight = (Math.floor(ms / DAY_MS) * DAY_MS -
            330 * 60_000) as Instant; // IST midnight
          const today = assembleDay(midnight, AHMEDABAD);
          const tomorrow = assembleDay(
            (midnight + DAY_MS) as Instant,
            AHMEDABAD,
          );
          if (today.kind !== "day" || tomorrow.kind !== "day")
            throw new Error("no civil day");
          expect(tomorrow.tithi.atSunrise).toBe(
            ((today.tithi.atSunrise - 1 + today.tithi.ends.length) % 30) + 1,
          );
          expect(today.tithi.vriddhi).toBe(today.tithi.ends.length === 0);
          expect(today.tithi.kshaya.length).toBe(
            Math.max(0, today.tithi.ends.length - 1),
          );
          expect(tithiAt(today.sunrise)).toBe(today.tithi.atSunrise);
        },
      ),
      RUNS,
    );
  });

  it("end times strictly increase within a day, for every element", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: Date.UTC(1950, 0, 1), max: Date.UTC(2090, 0, 1) }),
        (ms) => {
          const d = assembleDay(
            (Math.floor(ms / DAY_MS) * DAY_MS - 330 * 60_000) as Instant,
            AHMEDABAD,
          );
          if (d.kind !== "day") throw new Error("no civil day");
          for (const el of [d.tithi, d.nakshatra, d.yoga, d.karana]) {
            const times = [d.sunrise, ...el.ends.map((e) => e.endsAt)];
            for (let i = 1; i < times.length; i++)
              expect(times[i]!).toBeGreaterThan(times[i - 1]!);
            expect(times.at(-1)!).toBeLessThanOrEqual(d.nextSunrise);
          }
        },
      ),
      RUNS,
    );
  });

  it("every lunation has 0, 1 or 2 sankrantis, and is adhik exactly when it has 0", () => {
    fc.assert(
      fc.property(anyInstant, (t) => {
        const l = lunationAt(t);
        expect(l.sankrantis.length).toBeLessThanOrEqual(2);
        expect(l.adhik).toBe(l.sankrantis.length === 0);
        expect(l.absorbs !== null).toBe(l.sankrantis.length === 2);
        expect((l.end - l.start) / DAY_MS).toBeGreaterThan(29.2);
        expect((l.end - l.start) / DAY_MS).toBeLessThan(29.9);
      }),
      { numRuns: 60 },
    );
  });
});
