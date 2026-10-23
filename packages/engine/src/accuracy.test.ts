// Accuracy report: engine vs golden fixtures (§10, accuracy-fixtures skill).
// Prints the error table with `pnpm --filter @panchang/engine accuracy`.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SUNRISE,
  nextSunrise,
  nextSunset,
  type Coordinates,
  type SunEvent,
  type SunriseDefinition,
} from "./sun";
import { tithiEnds } from "./tithi";
import type { Instant } from "./time";

type Stamp = { local: string; utc: string };
type Fixture = {
  source: { name: string; retrievedAt: string };
  location: { name: string; latitude: number; longitude: number };
  days: {
    date: string;
    utcOffset: string;
    sunrise: Stamp;
    sunset: Stamp;
    tithiEnds: (Stamp & { tithi: number })[];
  }[];
};

const FIXTURES_DIR = join(import.meta.dirname, "../../../fixtures");
const fixtures: Fixture[] = readdirSync(FIXTURES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map(
    (f) => JSON.parse(readFileSync(join(FIXTURES_DIR, f), "utf8")) as Fixture,
  );

const DEFINITIONS: [string, SunriseDefinition][] = [
  ["upper + refraction (default)", DEFAULT_SUNRISE],
  ["centre + refraction", { limb: "centre", refraction: true }],
  ["upper, no refraction", { limb: "upper", refraction: false }],
  ["centre, no refraction", { limb: "centre", refraction: false }],
];

function eventAt(e: SunEvent): Instant {
  if (e.kind !== "event") throw new Error("expected a sun event");
  return e.at;
}

/** Local midnight of the fixture's civil date, as a UTC instant. */
function localMidnight(date: string, utcOffset: string): Instant {
  const sign = utcOffset.startsWith("-") ? -1 : 1;
  const [h, m] = utcOffset.slice(1).split(":").map(Number) as [number, number];
  return (Date.parse(`${date}T00:00:00Z`) -
    sign * (h * 60 + m) * 60_000) as Instant;
}

type Stats = { max: number; mean: number; n: number };
const stats = (errorsSec: number[]): Stats => ({
  max: Math.max(...errorsSec.map(Math.abs)),
  mean: errorsSec.reduce((a, b) => a + b, 0) / errorsSec.length,
  n: errorsSec.length,
});
const fmt = (s: Stats) =>
  `max |err| ${s.max.toFixed(0).padStart(4)} s   mean ${s.mean >= 0 ? "+" : ""}${s.mean.toFixed(0)} s   (n=${s.n})`;

describe.each(fixtures.map((f) => [f.location.name, f] as const))(
  "%s",
  (_name, fixture) => {
    const place: Coordinates = {
      latitude: fixture.location.latitude,
      longitude: fixture.location.longitude,
    };

    const sunErrors = DEFINITIONS.map(([label, definition]) => {
      const rise: number[] = [];
      const set: number[] = [];
      for (const day of fixture.days) {
        const midnight = localMidnight(day.date, day.utcOffset);
        rise.push(
          (eventAt(nextSunrise(midnight, place, definition)) -
            Date.parse(day.sunrise.utc)) /
            1000,
        );
        set.push(
          (eventAt(nextSunset(midnight, place, definition)) -
            Date.parse(day.sunset.utc)) /
            1000,
        );
      }
      return { label, rise: stats(rise), set: stats(set) };
    });

    const tithiErrors: number[] = [];
    const mismatches: string[] = [];
    for (const day of fixture.days) {
      const sunrise = eventAt(
        nextSunrise(localMidnight(day.date, day.utcOffset), place),
      );
      const ours = tithiEnds(sunrise, eventAt(nextSunrise(sunrise, place)));
      const ourTithis = ours.map((e) => e.tithi).join(",");
      const refTithis = day.tithiEnds.map((e) => e.tithi).join(",");
      if (ourTithis !== refTithis)
        mismatches.push(
          `${day.date}: ours [${ourTithis}] vs reference [${refTithis}]`,
        );
      else
        ours.forEach((e, i) =>
          tithiErrors.push(
            (e.endsAt - Date.parse(day.tithiEnds[i]!.utc)) / 1000,
          ),
        );
    }
    const tithi = stats(tithiErrors);

    it("prints the accuracy report (errors = engine − reference; reference has minute precision)", () => {
      const lines = [
        `${fixture.location.name}: ${fixture.days[0]!.date} … ${fixture.days.at(-1)!.date}, ${fixture.source.name} (retrieved ${fixture.source.retrievedAt})`,
        ...sunErrors.flatMap((r) => [
          `  sunrise  ${r.label.padEnd(30)} ${fmt(r.rise)}`,
          `  sunset   ${r.label.padEnd(30)} ${fmt(r.set)}`,
        ]),
        `  tithi ends (default sunrise)            ${fmt(tithi)}`,
        `  tithi sets differing per civil day: ${mismatches.length}${mismatches.length ? "\n    " + mismatches.join("\n    ") : ""}`,
      ];
      console.log(lines.join("\n"));
      expect(lines.length).toBeGreaterThan(0);
    });

    it("default sunrise and sunset are within ±1 min of the reference every day (§4.2)", () => {
      expect(sunErrors[0]!.rise.max).toBeLessThanOrEqual(60);
      expect(sunErrors[0]!.set.max).toBeLessThanOrEqual(60);
    });

    it("every civil day has the same tithis ending as the reference (vriddhi and kshaya days included)", () => {
      expect(mismatches).toEqual([]);
    });

    it("tithi end times are within ±2 min of the reference (§4.2)", () => {
      expect(tithi.max).toBeLessThanOrEqual(120);
    });
  },
);
