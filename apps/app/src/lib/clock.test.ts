import { parseCivilDate, type CivilDate, type Instant } from "@panchang/engine";
import { describe, expect, it } from "vitest";
import { clockFor } from "./clock";

const d = (s: string) => parseCivilDate(s) as CivilDate;
const iso = (t: Instant) => new Date(t).toISOString();

describe("clockFor", () => {
  it("finds local midnight in fixed and DST zones", () => {
    expect(iso(clockFor("Asia/Kolkata").localMidnight(d("2026-10-23")))).toBe(
      "2026-10-22T18:30:00.000Z",
    );
    // New York: EDT (−4) the day before the change, EST (−5) on it (change at 02:00).
    expect(
      iso(clockFor("America/New_York").localMidnight(d("2026-11-01"))),
    ).toBe("2026-11-01T04:00:00.000Z");
    expect(
      iso(clockFor("America/New_York").localMidnight(d("2026-11-02"))),
    ).toBe("2026-11-02T05:00:00.000Z");
    expect(iso(clockFor("Europe/London").localMidnight(d("2026-03-29")))).toBe(
      "2026-03-29T00:00:00.000Z",
    );
  });

  it("returns the first instant of the day when midnight is skipped", () => {
    // Santiago, 2022-09-11: clocks jumped 00:00 → 01:00 (−04 → −03).
    const t = clockFor("America/Santiago").localMidnight(d("2022-09-11"));
    expect(iso(t)).toBe("2022-09-11T04:00:00.000Z");
    expect(clockFor("America/Santiago").localDate(t)).toBe("2022-09-11");
  });

  it("round-trips localDate(localMidnight(date)) across a year of DST zones", () => {
    for (const tz of [
      "America/New_York",
      "Europe/London",
      "Australia/Sydney",
      "Asia/Kolkata",
    ]) {
      const clock = clockFor(tz);
      for (let i = 0; i < 366; i++) {
        const date = new Date(Date.UTC(2026, 0, 1 + i))
          .toISOString()
          .slice(0, 10);
        expect(clock.localDate(clock.localMidnight(d(date)))).toBe(date);
        expect(
          clock.localDate((clock.localMidnight(d(date)) - 1) as Instant),
        ).not.toBe(date);
      }
    }
  });
});
