import { lahiriAyanamsa as grahanLahiri } from "@grahan/vedic";
import { e_tilt } from "astronomy-engine";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_AYANAMSA,
  lahiriAyanamsa,
  siderealLongitude,
} from "./ayanamsa";
import { instant } from "./testing";
import { toAstroTime, type Instant } from "./time";

const jdUt = (t: Instant) => t / 86_400_000 + 2440587.5;

describe("lahiriAyanamsa (ADR 0019)", () => {
  it("defaults to the mean variant (chosen against Drik's nakshatra/yoga end times)", () => {
    expect(DEFAULT_AYANAMSA).toBe("mean");
  });

  it("mean matches Swiss Ephemeris SIDM_LAHIRI (via grahan's 0.002″ fit) within 0.5″, 1900–2100 (measured max 0.31″ at the ends: IAU 1976 vs newer precession)", () => {
    for (let year = 1900; year <= 2100; year += 10) {
      const t = instant(`${year}-06-01T00:00:00Z`);
      expect(
        Math.abs(lahiriAyanamsa(t, "mean") - grahanLahiri(jdUt(t))) * 3600,
      ).toBeLessThan(0.5);
    }
  });

  it("is 23°15′00.658″ minus that day's nutation at the 1956-03-21 epoch", () => {
    expect(lahiriAyanamsa(instant("1956-03-21T00:00:00Z"), "mean")).toBeCloseTo(
      23.250182778 - 0.004658035,
      4,
    );
  });

  it("true = mean + nutation in longitude (Δψ)", () => {
    const t = instant("2026-10-22T01:09:30Z");
    const dpsi = e_tilt(toAstroTime(t)).dpsi / 3600;
    expect(lahiriAyanamsa(t, "true") - lahiriAyanamsa(t, "mean")).toBeCloseTo(
      dpsi,
      9,
    );
  });

  it("is about 24.2316° on 22 Oct 2026 and grows ~50.3″ per year", () => {
    const a = lahiriAyanamsa(instant("2026-10-22T00:00:00Z"));
    expect(a).toBeCloseTo(24.2316, 3);
    const perYear =
      (lahiriAyanamsa(instant("2027-10-22T00:00:00Z")) - a) * 3600;
    expect(perYear).toBeGreaterThan(50);
    expect(perYear).toBeLessThan(50.6);
  });

  it("siderealLongitude subtracts the ayanamsa and wraps into [0, 360)", () => {
    const t = instant("2026-10-22T00:00:00Z");
    expect(siderealLongitude(10, t)).toBeCloseTo(
      360 + 10 - lahiriAyanamsa(t),
      9,
    );
  });
});
