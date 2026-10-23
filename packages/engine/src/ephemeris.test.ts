// Independent ephemeris check: engine Sun/Moon vs JPL Horizons (DE-series), apparent
// geocentric ecliptic-of-date longitudes, at the 32 Drik tithi-end instants of Oct 2026.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { moonLongitude, sunLongitude } from "./longitude";
import type { Instant } from "./time";

type Row = { utc: string; sunLongitude: number; moonLongitude: number };
const rows = (
  JSON.parse(
    readFileSync(
      join(
        import.meta.dirname,
        "../../../fixtures/horizons/ahmedabad-2026-10-tithi-ends.json",
      ),
      "utf8",
    ),
  ) as { rows: Row[] }
).rows;

/** Signed difference a − b in arcseconds, wrapped to (−648000″, 648000″]. */
const arcsec = (a: number, b: number) =>
  (((((a - b) % 360) + 540) % 360) - 180) * 3600;

describe("engine vs JPL Horizons (fixtures/horizons)", () => {
  it("Sun longitude within ±3″ (measured −1.7…−0.7″)", () => {
    for (const r of rows)
      expect(
        Math.abs(
          arcsec(sunLongitude(Date.parse(r.utc) as Instant), r.sunLongitude),
        ),
      ).toBeLessThan(3);
  });

  it("Moon longitude within ±10″ (measured +1.5…+4.9″); 10″ of elongation ≈ 20 s of tithi time", () => {
    for (const r of rows)
      expect(
        Math.abs(
          arcsec(moonLongitude(Date.parse(r.utc) as Instant), r.moonLongitude),
        ),
      ).toBeLessThan(10);
  });
});
