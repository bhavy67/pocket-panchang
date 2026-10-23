import { describe, expect, it } from "vitest";
import { assembleDay, type PanchangDay } from "./day";
import { karanaName } from "./elements";
import type { Coordinates } from "./sun";
import { localDate, localMidnight } from "./testing";
import { CITIES } from "../tools/cities";

const MINUTE_MS = 60_000;
const AHMEDABAD: Coordinates = { latitude: 23.025556, longitude: 72.587222 };

function day(
  date: string,
  place: Coordinates = AHMEDABAD,
  tz = "Asia/Kolkata",
): PanchangDay {
  const d = assembleDay(localMidnight(date, tz), place);
  if (d.kind !== "day") throw new Error(`no civil day on ${date}`);
  return d;
}

describe("assembleDay: Ahmedabad, 22 Oct 2026 (Drik Panchang, retrieved 2026-10-22)", () => {
  const d = day("2026-10-22");

  it("names the day: Thursday, Shukla Ekadashi, Shatabhisha, Vriddhi yoga, Vishti karana, Ashvin", () => {
    expect(d.vara).toBe(4);
    expect([
      d.tithi.atSunrise,
      d.paksha,
      d.nakshatra.atSunrise,
      d.yoga.atSunrise,
      d.karana.atSunrise,
    ]).toEqual([11, "shukla", 24, 11, 22]);
    expect(d.month).toEqual({ name: "Ashvin", adhik: false, absorbs: null });
    expect(d.samvat).toEqual({
      vikramKartikadi: 2082,
      vikramChaitradi: 2083,
      shaka: 1948,
    });
  });

  it("lists ends inside (sunrise, next sunrise], strictly increasing (§10)", () => {
    for (const element of [d.tithi, d.nakshatra, d.yoga, d.karana]) {
      let previous: number = d.sunrise;
      for (const e of element.ends) {
        expect(e.endsAt).toBeGreaterThan(previous);
        expect(e.endsAt).toBeLessThanOrEqual(d.nextSunrise);
        previous = e.endsAt;
      }
    }
    expect(d.karana.ends.map((e) => karanaName(e.index))).toEqual([
      "Vishti",
      "Bava",
    ]);
  });

  it("Bhadra: the Vishti window started before sunrise and ends with Ekadashi (~14:48 IST)", () => {
    expect(d.bhadra).toHaveLength(1);
    const [w] = d.bhadra;
    expect(w!.start).toBeLessThan(d.sunrise);
    expect(Math.abs(w!.end - d.tithi.ends[0]!.endsAt)).toBeLessThanOrEqual(
      1000,
    );
  });
});

describe("vriddhi and kshaya (Drik, Oct 2026)", () => {
  it("17 Oct 2026: Saptami 'upto Full Night' → vriddhi tithi, no tithi end that day", () => {
    const d = day("2026-10-17");
    expect(d.tithi.vriddhi).toBe(true);
    expect(d.tithi.ends).toEqual([]);
  });

  it("3 Oct 2026: Saptami and Ashtami both end → Ashtami (23) is kshaya", () => {
    const d = day("2026-10-03");
    expect(d.tithi.ends.map((e) => e.index)).toEqual([22, 23]);
    expect(d.tithi.kshaya).toEqual([23]);
    expect(d.tithi.vriddhi).toBe(false);
  });
});

describe("civil date invariant: the computed sunrise falls on the requested local date", () => {
  it.each(CITIES.map((c) => [c.name, c] as const))(
    "%s, every 5th day of 2026–2027 incl. DST days",
    (_name, city) => {
      const dates: string[] = [];
      for (
        let t = Date.parse("2026-01-01T12:00:00Z");
        t < Date.parse("2028-01-01T00:00:00Z");
        t += 5 * 86_400_000
      ) {
        dates.push(new Date(t).toISOString().slice(0, 10));
      }
      dates.push("2026-03-08", "2026-11-01", "2026-03-29", "2026-10-25"); // US and UK DST days
      for (const date of dates) {
        const d = assembleDay(localMidnight(date, city.tz), city);
        expect(d.kind).toBe("day");
        if (d.kind === "day") expect(localDate(d.sunrise, city.tz)).toBe(date);
      }
    },
  );
});

describe("polar (§4.4)", () => {
  it("Tromsø on 21 Dec 2026: no civil day, sun down", () => {
    expect(
      assembleDay(localMidnight("2026-12-21", "Europe/Oslo"), {
        latitude: 69.6492,
        longitude: 18.9553,
      }),
    ).toEqual({
      kind: "no-civil-day",
      sunUp: false,
    });
  });
});

describe("Bhadra windows over a month", () => {
  it("every window is one Vishti karana: half a tithi long (9–14 h) and overlapping its day", () => {
    let count = 0;
    for (let i = 1; i <= 30; i++) {
      const d = day(`2026-11-${String(i).padStart(2, "0")}`);
      for (const w of d.bhadra) {
        count++;
        expect(w.end - w.start).toBeGreaterThan(9 * 60 * MINUTE_MS);
        expect(w.end - w.start).toBeLessThan(14 * 60 * MINUTE_MS);
        expect(w.end).toBeGreaterThan(d.sunrise);
        expect(w.start).toBeLessThan(d.nextSunrise);
      }
    }
    // 8 Vishti per lunation, some spanning two civil days.
    expect(count).toBeGreaterThanOrEqual(8);
    expect(count).toBeLessThanOrEqual(16);
  });
});
