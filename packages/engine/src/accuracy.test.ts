// Accuracy report: engine vs Drik Panchang golden fixtures (§10, accuracy-fixtures skill).
//   pnpm --filter @panchang/engine accuracy                 → prints the table
//   ACCURACY_REPORT=report.md pnpm --filter … accuracy      → also writes Markdown (CI artifact)
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { assembleDay, type ElementDay, type PanchangDay } from "./day";
import { lahiriAyanamsa } from "./ayanamsa";
import {
  DEFAULT_SUNRISE,
  nextSunrise,
  nextSunset,
  type SunEvent,
  type SunriseDefinition,
} from "./sun";
import { localMidnight } from "./testing";
import type { Instant } from "./time";

type Stamp = { local: string; utc: string };
type End = Stamp & { index: number };
type Day = {
  date: string;
  sunrise: Stamp;
  sunset: Stamp;
  weekday: number | null;
  amantaMonth: string | null;
  samvat: { gujarati: number; vikram: number; shaka: number };
  lahiriAyanamsha: number;
  tithiEnds: End[];
  nakshatraEnds: End[];
  yogaEnds: End[];
  karanaEnds: End[];
};
type Fixture = {
  file: string;
  source: { name: string; retrievedAt: string };
  location: { name: string; latitude: number; longitude: number; tz: string };
  days: Day[];
};

const FIXTURES_DIR = join(import.meta.dirname, "../../../fixtures");
const fixtures: Fixture[] = readdirSync(FIXTURES_DIR)
  .filter((f) => /^[a-z-]+-\d{4}(-\d{2})?\.json$/.test(f))
  .map((f) => ({
    file: f,
    ...(JSON.parse(readFileSync(join(FIXTURES_DIR, f), "utf8")) as Omit<
      Fixture,
      "file"
    >),
  }));

const DEFINITIONS: [string, SunriseDefinition][] = [
  ["upper + refraction (default)", DEFAULT_SUNRISE],
  ["centre + refraction", { limb: "centre", refraction: true }],
  ["upper, no refraction", { limb: "upper", refraction: false }],
  ["centre, no refraction", { limb: "centre", refraction: false }],
];
const ELEMENTS = [
  ["tithi", "tithiEnds"],
  ["nakshatra", "nakshatraEnds"],
  ["yoga", "yogaEnds"],
  ["karana", "karanaEnds"],
] as const;
/** Drik month spellings → canonical names (GLOSSARY.md). */
const MONTH_ALIASES: Record<string, string> = { Ashwina: "Ashvin" };

const eventAt = (e: SunEvent): Instant => {
  if (e.kind !== "event") throw new Error("expected a sun event");
  return e.at;
};

type Stats = { max: number; mean: number; n: number };
const stats = (errorsSec: number[]): Stats => ({
  max: errorsSec.length ? Math.max(...errorsSec.map(Math.abs)) : 0,
  mean: errorsSec.length
    ? errorsSec.reduce((a, b) => a + b, 0) / errorsSec.length
    : 0,
  n: errorsSec.length,
});
const fmt = (s: Stats) =>
  `${s.max.toFixed(0)} s | ${s.mean >= 0 ? "+" : ""}${s.mean.toFixed(0)} s | ${s.n}`;

const markdown: string[] = [
  "# Accuracy report",
  "",
  "Engine − reference. The reference shows whole minutes (±30 s of every error is rounding). Tolerances (§4.2): sunrise/sunset ±1 min, element end times ±2 min.",
  "",
];

afterAll(() => {
  const out = process.env["ACCURACY_REPORT"];
  if (out) writeFileSync(out, markdown.join("\n") + "\n");
});

describe.each(fixtures.map((f) => [f.file, f] as const))(
  "%s",
  (_file, fixture) => {
    const place = {
      latitude: fixture.location.latitude,
      longitude: fixture.location.longitude,
    };
    const midnight = (date: string) => localMidnight(date, fixture.location.tz);

    const sunRows = DEFINITIONS.map(([label, definition]) => {
      const rise: number[] = [];
      const set: number[] = [];
      for (const day of fixture.days) {
        rise.push(
          (eventAt(nextSunrise(midnight(day.date), place, definition)) -
            Date.parse(day.sunrise.utc)) /
            1000,
        );
        set.push(
          (eventAt(nextSunset(midnight(day.date), place, definition)) -
            Date.parse(day.sunset.utc)) /
            1000,
        );
      }
      return { label, rise: stats(rise), set: stats(set) };
    });

    const days = fixture.days.map((ref) => {
      const ours = assembleDay(midnight(ref.date), place);
      if (ours.kind !== "day") throw new Error(`${ref.date}: no civil day`);
      return { ref, ours };
    });

    const elementRows = ELEMENTS.map(([key, field]) => {
      const errors: number[] = [];
      const mismatches: string[] = [];
      for (const { ref, ours } of days) {
        const element: ElementDay = ours[key];
        const refEnds = ref[field];
        if (
          element.ends.map((e) => e.index).join() !==
          refEnds.map((e) => e.index).join()
        ) {
          mismatches.push(
            `${ref.date}: ours [${element.ends.map((e) => e.index).join(",")}] vs reference [${refEnds.map((e) => e.index).join(",")}]`,
          );
        } else {
          element.ends.forEach((e, i) =>
            errors.push((e.endsAt - Date.parse(refEnds[i]!.utc)) / 1000),
          );
        }
      }
      return { key, stats: stats(errors), mismatches };
    });

    const calendarMismatches: string[] = [];
    const ayanamsaOffsets: number[] = [];
    for (const { ref, ours } of days) {
      const month = (d: PanchangDay) =>
        `${d.month.name}${d.month.adhik ? " (Adhik)" : ""}`;
      const refMonth = ref.amantaMonth?.replace(
        /^\w+/,
        (m) => MONTH_ALIASES[m] ?? m,
      );
      if (refMonth && refMonth !== month(ours))
        calendarMismatches.push(
          `${ref.date}: month ${month(ours)} vs ${ref.amantaMonth}`,
        );
      const s = ours.samvat;
      if (
        s.vikramKartikadi !== ref.samvat.gujarati ||
        s.vikramChaitradi !== ref.samvat.vikram ||
        s.shaka !== ref.samvat.shaka
      ) {
        calendarMismatches.push(
          `${ref.date}: samvat ${JSON.stringify(s)} vs ${JSON.stringify(ref.samvat)}`,
        );
      }
      if (ref.weekday !== null && ours.vara + 1 !== ref.weekday)
        calendarMismatches.push(
          `${ref.date}: weekday ${ours.vara + 1} vs ${ref.weekday}`,
        );
      if (ref.lahiriAyanamsha)
        ayanamsaOffsets.push(
          (lahiriAyanamsa(ours.sunrise) - ref.lahiriAyanamsha) * 3600,
        );
    }

    it("reports (and writes the Markdown section)", () => {
      const title = `${fixture.location.name}: ${fixture.days.length} days (${fixture.days[0]!.date} … ${fixture.days.at(-1)!.date}), ${fixture.source.name}, retrieved ${fixture.source.retrievedAt}`;
      const lines = [
        `## ${title}`,
        "",
        "| What | max \\|err\\| | mean | n |",
        "|---|---|---|---|",
        ...sunRows.flatMap((r) => [
          `| sunrise, ${r.label} | ${fmt(r.rise)} |`,
          `| sunset, ${r.label} | ${fmt(r.set)} |`,
        ]),
        ...elementRows.map((r) => `| ${r.key} ends | ${fmt(r.stats)} |`),
        "",
        `Element sets differing per civil day: ${elementRows.reduce((a, r) => a + r.mismatches.length, 0)}. Month/samvat/weekday mismatches: ${calendarMismatches.length}.`,
        ayanamsaOffsets.length
          ? `Engine Lahiri − Drik's displayed ayanamsa: mean ${(ayanamsaOffsets.reduce((a, b) => a + b, 0) / ayanamsaOffsets.length).toFixed(1)}″ (a constant offset; see ADR 0019).`
          : "",
        "",
      ];
      markdown.push(...lines);
      console.log(lines.join("\n"));
      expect(lines.length).toBeGreaterThan(0);
    });

    it("default sunrise and sunset are within ±1 min every day (§4.2)", () => {
      expect(sunRows[0]!.rise.max).toBeLessThanOrEqual(60);
      expect(sunRows[0]!.set.max).toBeLessThanOrEqual(60);
    });

    it.each(ELEMENTS.map(([key]) => key))(
      "%s: same ends every civil day, each within ±2 min (§4.2)",
      (key) => {
        const row = elementRows.find((r) => r.key === key)!;
        expect(row.mismatches).toEqual([]);
        expect(row.stats.max).toBeLessThanOrEqual(120);
      },
    );

    it("month, samvat and weekday match the reference every day", () => {
      expect(calendarMismatches).toEqual([]);
    });
  },
);
