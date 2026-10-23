import {
  Ecliptic,
  GeoVector,
  Body,
  MoonPhase,
  Seasons,
} from "astronomy-engine";
import { describe, expect, it } from "vitest";
import {
  elongation,
  moonLongitude,
  normalizeDegrees,
  sunLongitude,
} from "./longitude";
import { angularDistance, instant } from "./testing";
import { fromAstroTime, toAstroTime, type Instant } from "./time";

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/** ~400 instants spread over 2026 at an irregular step, so no phase is favoured. */
const SAMPLES: Instant[] = Array.from({ length: 400 }, (_, i) =>
  instant(
    new Date(
      Date.UTC(2026, 0, 1) + Math.round(i * 0.9137 * DAY_MS),
    ).toISOString(),
  ),
);

describe("normalizeDegrees", () => {
  it.each([
    [0, 0],
    [360, 0],
    [720.5, 0.5],
    [-10, 350],
    [-370, 350],
    [359.25, 359.25],
  ])("normalizeDegrees(%s) = %s", (input, expected) => {
    expect(normalizeDegrees(input)).toBeCloseTo(expected, 12);
  });

  it("never returns 360, even for a tiny negative angle", () => {
    const result = normalizeDegrees(-1e-14);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(360);
  });
});

describe("sunLongitude", () => {
  it("is 0° (mod 360) at the March 2026 equinox, crossing the 360°/0° seam", () => {
    const equinox = fromAstroTime(Seasons(2026).mar_equinox);
    expect(angularDistance(sunLongitude(equinox), 0)).toBeLessThan(1e-4);
  });

  it("is the apparent position: about 20.5″ behind the geometric Sun (aberration)", () => {
    const t = instant("2026-10-22T00:00:00Z");
    const geometric = Ecliptic(GeoVector(Body.Sun, toAstroTime(t), false)).elon;
    const arcsec = (sunLongitude(t) - geometric) * 3600;
    expect(arcsec).toBeGreaterThan(-22);
    expect(arcsec).toBeLessThan(-19);
  });
});

describe("longitude ranges", () => {
  it("sun, moon and elongation always lie in [0, 360)", () => {
    for (const t of SAMPLES) {
      for (const value of [sunLongitude(t), moonLongitude(t), elongation(t)]) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(360);
      }
    }
  });
});

describe("elongation", () => {
  it("is 127.4° at 2026-10-22T00:00Z: tithi 11, Shukla Ekadashi (matches Drik)", () => {
    const e = elongation(instant("2026-10-22T00:00:00Z"));
    expect(e).toBeCloseTo(127.4, 1);
    expect(Math.floor(e / 12) + 1).toBe(11);
  });

  it("agrees with astronomy-engine's MoonPhase to within 25″ (MoonPhase omits the Sun's aberration)", () => {
    for (const t of SAMPLES) {
      expect(
        angularDistance(elongation(t), MoonPhase(toAstroTime(t))) * 3600,
      ).toBeLessThan(25);
    }
  });

  it("always increases, by 10.7°–14.5° per day (§4.2; measured 10.75–14.39 over 2020–2040), across the 360°/0° seam", () => {
    for (const t of SAMPLES) {
      const gainedPerDay =
        normalizeDegrees(elongation((t + HOUR_MS) as Instant) - elongation(t)) *
        24;
      expect(gainedPerDay).toBeGreaterThan(10.7);
      expect(gainedPerDay).toBeLessThan(14.5);
    }
  });

  it("crosses 132° (Ekadashi → Dvadashi) within ±2 min of Drik Panchang's 14:47 IST on 22 Oct 2026", () => {
    // Drik: Ekadashi upto 02:47 PM IST = 09:17 UTC (retrieved 2026-10-22). Budget §4.2: ±2 min.
    expect(elongation(instant("2026-10-22T09:15:00Z"))).toBeLessThan(132);
    expect(elongation(instant("2026-10-22T09:19:00Z"))).toBeGreaterThan(132);
  });
});
