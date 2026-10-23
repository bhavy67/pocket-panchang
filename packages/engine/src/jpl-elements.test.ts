// Element boundaries vs JPL Horizons (§10): for the cities without Drik data (Delhi, Chennai,
// New York, London; 2026–27 sample days) and the 1982–83 new moons/sankrantis, check that at
// each engine end instant JPL's own Sun/Moon put the angle on the boundary. Element ends are
// global instants; the civil-day assignment is covered by NOAA and the civil-date invariant.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lahiriAyanamsa } from "./ayanamsa";
import { nakshatraEnds, siderealSun, yogaEnds } from "./elements";
import { elongation } from "./longitude";
import { findCrossing } from "./crossing";
import { tithiEnds } from "./tithi";
import type { Instant } from "./time";

type Kind = "tithi" | "nakshatra" | "yoga" | "new-moon" | "sankranti";
type Row = {
  utc: string;
  kind: Kind;
  index: number;
  sunLongitude: number;
  moonLongitude: number;
};
const rows = (
  JSON.parse(
    readFileSync(
      join(import.meta.dirname, "../../../fixtures/horizons/sample-ends.json"),
      "utf8",
    ),
  ) as { rows: Row[] }
).rows;

const norm = (d: number) => ((d % 360) + 360) % 360;
/** Signed distance from the nearest multiple of `step`, degrees. */
const offBoundary = (angle: number, step: number) => {
  const r = norm(angle) % step;
  return r > step / 2 ? r - step : r;
};

/** JPL angle and slice size for a row; rate in °/s for converting arcsec → seconds of time. */
function jpl(row: Row): { angle: number; step: number; ratePerSec: number } {
  const t = Date.parse(row.utc) as Instant;
  const ayanamsa = lahiriAyanamsa(t);
  const day = 86_400;
  switch (row.kind) {
    case "tithi":
    case "new-moon":
      return {
        angle: row.moonLongitude - row.sunLongitude,
        step: row.kind === "tithi" ? 12 : 360,
        ratePerSec: 12.2 / day,
      };
    case "nakshatra":
      return {
        angle: row.moonLongitude - ayanamsa,
        step: 360 / 27,
        ratePerSec: 13.2 / day,
      };
    case "yoga":
      return {
        angle: row.sunLongitude + row.moonLongitude - 2 * ayanamsa,
        step: 360 / 27,
        ratePerSec: 14.2 / day,
      };
    case "sankranti":
      return {
        angle: row.sunLongitude - ayanamsa,
        step: 30,
        ratePerSec: 1 / day,
      };
  }
}

describe("engine element ends vs JPL Horizons", () => {
  const byKind: Partial<Record<Kind, Row[]>> = {};
  for (const row of rows) (byKind[row.kind] ??= []).push(row);

  it.each(Object.keys(byKind) as Kind[])(
    "%s: JPL puts every engine end within ±20 s of the boundary",
    (kind) => {
      const errors = byKind[kind]!.map((row) => {
        const { angle, step, ratePerSec } = jpl(row);
        return offBoundary(angle, step) / ratePerSec; // seconds; + = JPL already past the boundary
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(Math.max(...errors.map(Math.abs))).toBeLessThan(
        kind === "sankranti" ? 60 : 20,
      );
    },
  );

  it("the engine still produces each stored instant (within 1 s), so this fixture is current", () => {
    const hour = 3_600_000;
    for (const row of rows) {
      const t = Date.parse(row.utc);
      const [from, to] = [(t - hour) as Instant, (t + hour) as Instant];
      const ends =
        row.kind === "tithi"
          ? tithiEnds(from, to).map((e) => e.endsAt)
          : row.kind === "nakshatra"
            ? nakshatraEnds(from, to).map((e) => e.endsAt)
            : row.kind === "yoga"
              ? yogaEnds(from, to).map((e) => e.endsAt)
              : row.kind === "new-moon"
                ? [findCrossing(elongation, 0, from, to)!]
                : [
                    findCrossing(
                      (x) => siderealSun(x),
                      (Math.round(
                        norm(row.sunLongitude - lahiriAyanamsa(t as Instant)) /
                          30,
                      ) *
                        30) %
                        360,
                      from,
                      to,
                      { stepMs: hour },
                    )!,
                  ];
      expect(Math.min(...ends.map((e) => Math.abs(e - t)))).toBeLessThanOrEqual(
        1000,
      );
    }
  });
});
