import { assembleDay, type Instant, type PanchangDay } from "@panchang/engine";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { muhurtaFor, nextGoodTime } from "./muhurta";
import { AHMEDABAD, clockFor, date } from "./testing";

type Span = { start: { utc: string }; end: { utc: string } };
type Day = { date: string; rahuKalam: Span; yamaganda: Span; gulikai: Span };
const fixtureDays = ["2026", "2027"].flatMap(
  (y) =>
    (
      JSON.parse(
        readFileSync(
          join(import.meta.dirname, `../../../fixtures/ahmedabad-${y}.json`),
          "utf8",
        ),
      ) as { days: Day[] }
    ).days,
);
const coordinates = { latitude: AHMEDABAD.lat, longitude: AHMEDABAD.lng };
const dayAt = (d: string): PanchangDay => {
  const day = assembleDay(
    clockFor(AHMEDABAD.tz).localMidnight(date(d)),
    coordinates,
  );
  if (day.kind !== "day") throw new Error("no civil day");
  return day;
};
const ist = (t: number) =>
  new Date(t + 330 * 60_000).toISOString().slice(11, 16);

describe("Rahu Kaal, Yamaganda, Gulika vs Drik Panchang (Ahmedabad, 82 days)", () => {
  it.each([
    ["rahuKaal", "rahuKalam"],
    ["yamaganda", "yamaganda"],
    ["gulika", "gulikai"],
  ] as const)("%s start and end within ±1 min every day", (ours, theirs) => {
    for (const d of fixtureDays) {
      const m = muhurtaFor(dayAt(d.date))!;
      expect(
        Math.abs(m[ours].start - Date.parse(d[theirs].start.utc)),
        `${d.date} start`,
      ).toBeLessThanOrEqual(60_000);
      expect(
        Math.abs(m[ours].end - Date.parse(d[theirs].end.utc)),
        `${d.date} end`,
      ).toBeLessThanOrEqual(60_000);
    }
  });
});

describe("Choghadiya, Thursday 22 Oct 2026 (Drik Panchang)", () => {
  const m = muhurtaFor(dayAt("2026-10-22"))!;

  it("day: Shubh, Rog, Udveg, Char, Labh, Amrut, Kaal, Shubh with Drik's times (±1 min)", () => {
    expect(m.day.map((c) => c.name)).toEqual([
      "Shubh",
      "Rog",
      "Udveg",
      "Char",
      "Labh",
      "Amrut",
      "Kaal",
      "Shubh",
    ]);
    const drikStarts = [
      "06:39",
      "08:06",
      "09:32",
      "10:58",
      "12:24",
      "13:50",
      "15:16",
      "16:42",
    ];
    m.day.forEach((c, i) => {
      const [h, mm] = drikStarts[i]!.split(":").map(Number) as [number, number];
      expect(
        Math.abs(c.start - (Date.UTC(2026, 9, 22, h, mm) - 330 * 60_000)),
      ).toBeLessThanOrEqual(60_000);
    });
  });

  it("night: Amrut, Char, Rog, Kaal, Labh, Udveg, Shubh, Amrut", () => {
    expect(m.night.map((c) => c.name)).toEqual([
      "Amrut",
      "Char",
      "Rog",
      "Kaal",
      "Labh",
      "Udveg",
      "Shubh",
      "Amrut",
    ]);
  });

  it("qualities: Amrut/Shubh/Labh good, Char neutral, Udveg/Rog/Kaal bad", () => {
    expect(Object.fromEntries(m.day.map((c) => [c.name, c.quality]))).toEqual({
      Shubh: "good",
      Rog: "bad",
      Udveg: "bad",
      Char: "neutral",
      Labh: "good",
      Amrut: "good",
      Kaal: "bad",
    });
  });

  it("next good time at 2:10 PM skips Amrut (overlaps Rahu Kaal and Bhadra) and is Shubh 4:42 PM", () => {
    const now = (Date.UTC(2026, 9, 22, 14, 10) - 330 * 60_000) as Instant;
    const next = nextGoodTime(m, now)!;
    expect([next.name, ist(next.start)]).toEqual(["Shubh", "16:42"]);
  });

  it("Bhadra comes from the engine's day", () => {
    expect(m.bhadra).toHaveLength(1);
  });
});
