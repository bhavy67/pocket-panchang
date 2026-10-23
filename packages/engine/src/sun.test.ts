import { Body, Observer, SearchRiseSet } from "astronomy-engine";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SUNRISE,
  nextSunrise,
  nextSunset,
  type Coordinates,
  type SunEvent,
  type SunriseDefinition,
} from "./sun";
import { instant } from "./testing";
import { toAstroTime, type Instant } from "./time";

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;
const AHMEDABAD: Coordinates = { latitude: 23.0225, longitude: 72.5714 };
const NEW_YORK: Coordinates = { latitude: 40.7128, longitude: -74.006 };
const LONDON: Coordinates = { latitude: 51.5074, longitude: -0.1278 };
const TROMSO: Coordinates = { latitude: 69.6492, longitude: 18.9553 };

function at(event: SunEvent): Instant {
  if (event.kind !== "event")
    throw new Error(`expected an event, got ${JSON.stringify(event)}`);
  return event.at;
}

describe("Ahmedabad, 22 Oct 2026, default definition (upper limb + refraction)", () => {
  const midnightUtc = instant("2026-10-22T00:00:00Z");

  it("sunrise is within ±1 min of Drik Panchang's 06:39 IST (01:09 UTC)", () => {
    // Drik Panchang, Ahmedabad, retrieved 2026-10-22: sunrise 06:39 AM, sunset 06:09 PM.
    expect(
      Math.abs(
        at(nextSunrise(midnightUtc, AHMEDABAD)) -
          instant("2026-10-22T01:09:00Z"),
      ),
    ).toBeLessThanOrEqual(MINUTE_MS);
  });

  it("sunset is within ±1 min of Drik Panchang's 18:09 IST (12:39 UTC)", () => {
    expect(
      Math.abs(
        at(nextSunset(midnightUtc, AHMEDABAD)) -
          instant("2026-10-22T12:39:00Z"),
      ),
    ).toBeLessThanOrEqual(MINUTE_MS);
  });
});

describe("SunriseDefinition (ADR 0012)", () => {
  const midnightUtc = instant("2026-10-22T00:00:00Z");
  const definitions: SunriseDefinition[] = [
    DEFAULT_SUNRISE, // centre at −(16′ + 34′)
    { limb: "centre", refraction: true }, // −34′
    { limb: "upper", refraction: false }, // −16′
    { limb: "centre", refraction: false }, // 0°
  ];

  it("a higher horizon threshold means a later sunrise and an earlier sunset", () => {
    const rises = definitions.map((d) =>
      at(nextSunrise(midnightUtc, AHMEDABAD, d)),
    );
    const sets = definitions.map((d) =>
      at(nextSunset(midnightUtc, AHMEDABAD, d)),
    );
    expect([...rises].sort((a, b) => a - b)).toEqual(rises);
    expect([...sets].sort((a, b) => b - a)).toEqual(sets);
  });

  it("centre without refraction is 3.5–4 min after the default sunrise in Ahmedabad", () => {
    const diff =
      at(
        nextSunrise(midnightUtc, AHMEDABAD, {
          limb: "centre",
          refraction: false,
        }),
      ) - at(nextSunrise(midnightUtc, AHMEDABAD));
    expect(diff).toBeGreaterThan(3.5 * MINUTE_MS);
    expect(diff).toBeLessThan(4 * MINUTE_MS);
  });

  it("the default matches astronomy-engine's SearchRiseSet within 1 s (3 cities × 30 days, rise and set)", () => {
    for (const place of [AHMEDABAD, NEW_YORK, LONDON]) {
      const observer = new Observer(place.latitude, place.longitude, 0);
      for (let day = 0; day < 30; day++) {
        const start = (instant("2026-10-01T00:00:00Z") +
          day * DAY_MS) as Instant;
        for (const [direction, ours] of [
          [+1, nextSunrise(start, place)],
          [-1, nextSunset(start, place)],
        ] as const) {
          const reference = SearchRiseSet(
            Body.Sun,
            observer,
            direction,
            toAstroTime(start),
            1,
          );
          expect(Math.abs(at(ours) - reference!.date.getTime())).toBeLessThan(
            1000,
          );
        }
      }
    }
  });
});

describe("search semantics", () => {
  it("returns the next event strictly after `after`, never the same one again", () => {
    const first = at(nextSunrise(instant("2026-10-22T00:00:00Z"), AHMEDABAD));
    const second = at(nextSunrise(first, AHMEDABAD));
    expect(second - first).toBeGreaterThan(23.9 * 3_600_000);
    expect(second - first).toBeLessThan(24.1 * 3_600_000);
  });

  it("chains sunrise → next sunrise (~24 h) every day for a month, at both Ahmedabad coordinate sets", () => {
    // Regression: searching from sunrise + 1 ms used to re-find the same sunrise 29 ms later.
    const drikAhmedabad: Coordinates = {
      latitude: 23.025556,
      longitude: 72.587222,
    };
    for (const place of [AHMEDABAD, drikAhmedabad, NEW_YORK, LONDON]) {
      let rise = at(nextSunrise(instant("2026-10-01T00:00:00Z"), place));
      for (let day = 0; day < 31; day++) {
        const next = at(nextSunrise(rise, place));
        expect(next - rise).toBeGreaterThan(23.9 * 3_600_000);
        expect(next - rise).toBeLessThan(24.1 * 3_600_000);
        rise = next;
      }
    }
  });

  it("works across a DST change (UTC in, UTC out): New York, 1 Nov 2026", () => {
    const rise = at(nextSunrise(instant("2026-11-01T00:00:00Z"), NEW_YORK));
    expect(new Date(rise).toISOString().slice(0, 10)).toBe("2026-11-01");
  });
});

describe("polar cases (§4.4): explicit states, no crash", () => {
  it("midnight sun in Tromsø on 21 Jun 2026: no rise or set, sun up", () => {
    const start = instant("2026-06-21T00:00:00Z");
    expect(nextSunrise(start, TROMSO)).toEqual({ kind: "none", sunUp: true });
    expect(nextSunset(start, TROMSO)).toEqual({ kind: "none", sunUp: true });
  });

  it("polar night in Tromsø on 21 Dec 2026: no rise or set, sun down", () => {
    const start = instant("2026-12-21T00:00:00Z");
    expect(nextSunrise(start, TROMSO)).toEqual({ kind: "none", sunUp: false });
    expect(nextSunset(start, TROMSO)).toEqual({ kind: "none", sunUp: false });
  });
});
