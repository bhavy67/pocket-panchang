// Cross-check against grahan (@grahan/vedic, an independent MIT panchang engine verified
// against Swiss Ephemeris), test-only per §4.1. All sample days, all 5 cities.
import { panchangAtSunrise } from "@grahan/vedic";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assembleDay } from "./day";
import { localMidnight } from "./testing";
import { CITIES } from "../tools/cities";

const samples = JSON.parse(
  readFileSync(
    join(import.meta.dirname, "../../../fixtures/sample-days.json"),
    "utf8",
  ),
) as Record<string, { years: Record<string, { date: string }[]> }>;
const EDGE_MS = 2 * 60_000;

describe.each(CITIES.map((c) => [c.name, c] as const))(
  "%s vs grahan",
  (_name, city) => {
    const dates = ["2026", "2027"].flatMap((y) =>
      samples[city.key]!.years[y]!.map((p) => p.date),
    );
    const rows = dates.map((date) => {
      const [y, m, d] = date.split("-").map(Number) as [number, number, number];
      const ours = assembleDay(localMidnight(date, city.tz), city);
      const theirs = panchangAtSunrise({
        year: y,
        month: m,
        day: d,
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.tz,
      });
      if (ours.kind !== "day" || !theirs.sunrise)
        throw new Error(`no civil day ${date}`);
      return { date, ours, theirs };
    });

    it("sunrise within ±1 min", () => {
      for (const { ours, theirs } of rows)
        expect(Math.abs(ours.sunrise - theirs.sunrise!.getTime())).toBeLessThan(
          60_000,
        );
    });

    it("same elements at sunrise and the same ends (±1 min), away from the day's edges", () => {
      for (const { date, ours, theirs } of rows) {
        for (const key of ["tithi", "nakshatra", "yoga", "karana"] as const) {
          const spans = theirs[key];
          const theirEnds = spans
            .filter((s) => s.endsAt.getTime() <= theirs.window.end.getTime())
            .map((s) => ({ index: s.index + 1, at: s.endsAt.getTime() }));
          const near = (t: number) =>
            Math.abs(t - ours.sunrise) < EDGE_MS ||
            Math.abs(t - ours.nextSunrise) < EDGE_MS;
          if (
            [
              ...theirEnds.map((e) => e.at),
              ...ours[key].ends.map((e) => e.endsAt),
            ].some(near)
          )
            continue;
          expect(`${date} ${key} ${ours[key].atSunrise}`).toBe(
            `${date} ${key} ${spans[0]!.index + 1}`,
          );
          expect(ours[key].ends.map((e) => e.index)).toEqual(
            theirEnds.map((e) => e.index),
          );
          ours[key].ends.forEach((e, i) =>
            expect(Math.abs(e.endsAt - theirEnds[i]!.at)).toBeLessThan(60_000),
          );
        }
      }
    });
  },
);
