import { SearchMoonPhase } from "astronomy-engine";
import { describe, expect, it } from "vitest";
import { elongation } from "./longitude";
import { nextSunrise, type Coordinates } from "./sun";
import { instant } from "./testing";
import { tithiAt, tithiEnds, type TithiEnd } from "./tithi";
import { fromAstroTime, toAstroTime, type Instant } from "./time";

const SECOND_MS = 1000;
const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const AHMEDABAD: Coordinates = { latitude: 23.0225, longitude: 72.5714 };

function sunriseAfter(t: Instant): Instant {
  const event = nextSunrise(t, AHMEDABAD);
  if (event.kind !== "event") throw new Error("no sunrise");
  return event.at;
}

describe("tithiAt", () => {
  it("is 11 (Shukla Ekadashi) on 22 Oct 2026 at 00:00Z and 12 after 14:48 IST", () => {
    expect(tithiAt(instant("2026-10-22T00:00:00Z"))).toBe(11);
    expect(tithiAt(instant("2026-10-22T09:20:00Z"))).toBe(12);
  });

  it("is 30 (Amavasya) just before the new moon and 1 just after (360° → 0° wrap)", () => {
    expect(tithiAt(instant("2026-11-09T07:00:00Z"))).toBe(30);
    expect(tithiAt(instant("2026-11-09T07:04:00Z"))).toBe(1);
  });

  it("equals floor(elongation / 12) + 1 and stays within 1–30 over a year of samples", () => {
    for (let i = 0; i < 400; i++) {
      const t = (instant("2026-01-01T00:00:00Z") +
        Math.round(i * 0.9137 * DAY_MS)) as Instant;
      const n = tithiAt(t);
      expect(n).toBe(Math.floor(elongation(t) / 12) + 1);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(30);
    }
  });
});

describe("tithiEnds: Ahmedabad civil days (sunrise → next sunrise)", () => {
  it("22 Oct 2026: udaya tithi 11; Ekadashi ends 14:48:24 IST, within ±2 min of Drik's 14:47", () => {
    const sunrise = sunriseAfter(instant("2026-10-22T00:00:00Z"));
    const next = sunriseAfter(sunrise);
    expect(tithiAt(sunrise)).toBe(11);
    const ends = tithiEnds(sunrise, next);
    expect(ends.map((e) => e.tithi)).toEqual([11]);
    // Reference: brute-force bisection on elongation(), 2026-10-22: 09:18:24.479Z.
    expect(
      Math.abs(ends[0]!.endsAt - instant("2026-10-22T09:18:24.479Z")),
    ).toBeLessThanOrEqual(SECOND_MS);
    // Drik Panchang (retrieved 2026-10-22): "Ekadashi upto 02:47 PM" = 09:17 UTC. Budget ±2 min (§4.2).
    expect(
      Math.abs(ends[0]!.endsAt - instant("2026-10-22T09:17:00Z")),
    ).toBeLessThanOrEqual(2 * MINUTE_MS);
  });

  it("23 Oct 2026: udaya tithi 12; Dvadashi ends 09:06:15Z", () => {
    const sunrise = sunriseAfter(instant("2026-10-23T00:00:00Z"));
    expect(tithiAt(sunrise)).toBe(12);
    const ends = tithiEnds(sunrise, sunriseAfter(sunrise));
    expect(ends.map((e) => e.tithi)).toEqual([12]);
    expect(
      Math.abs(ends[0]!.endsAt - instant("2026-10-23T09:06:15.163Z")),
    ).toBeLessThanOrEqual(SECOND_MS);
  });

  it("returns [] for an interval with no tithi boundary", () => {
    expect(
      tithiEnds(
        instant("2026-10-22T02:00:00Z"),
        instant("2026-10-22T03:00:00Z"),
      ),
    ).toEqual([]);
  });
});

describe("tithiEnds: invariants over a lunation (§10)", () => {
  let cached: TithiEnd[] | undefined;
  /** Computed on first use, so a stub that throws fails each test instead of the whole file. */
  const lunation = (): TithiEnd[] => {
    if (!cached) {
      const first = fromAstroTime(
        SearchMoonPhase(0, toAstroTime(instant("2026-10-01T00:00:00Z")), 40)!,
      );
      const second = fromAstroTime(
        SearchMoonPhase(0, toAstroTime((first + DAY_MS) as Instant), 40)!,
      );
      cached = tithiEnds(
        (first + HOUR_MS) as Instant,
        (second + HOUR_MS) as Instant,
      );
    }
    return cached;
  };

  it("has exactly 30 tithi ends, numbered 1 → 30 in order", () => {
    expect(lunation().map((e) => e.tithi)).toEqual(
      Array.from({ length: 30 }, (_, i) => i + 1),
    );
  });

  it("ends Amavasya (30) at the apparent new moon, 9 Nov 2026 07:01:58Z (wraps 360° → 0°)", () => {
    expect(
      Math.abs(lunation()[29]!.endsAt - instant("2026-11-09T07:01:58.410Z")),
    ).toBeLessThanOrEqual(SECOND_MS);
  });

  it("end times strictly increase, and each tithi lasts 0.75–1.15 days", () => {
    const ends = lunation();
    for (let i = 1; i < ends.length; i++) {
      const length = ends[i]!.endsAt - ends[i - 1]!.endsAt;
      expect(length).toBeGreaterThan(0.75 * DAY_MS);
      expect(length).toBeLessThan(1.15 * DAY_MS);
    }
  });

  it("each end is a real boundary: tithi n before it, n + 1 (or 1 after 30) after it", () => {
    for (const { tithi, endsAt } of lunation()) {
      expect(tithiAt((endsAt - MINUTE_MS) as Instant)).toBe(tithi);
      expect(tithiAt((endsAt + MINUTE_MS) as Instant)).toBe((tithi % 30) + 1);
    }
  });
});
