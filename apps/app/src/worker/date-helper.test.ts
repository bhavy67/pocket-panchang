// ADR 0006 required tests for the Gregorian-date helper.
import type { CivilDate } from "@panchang/engine";
import { describe, expect, it } from "vitest";
import { localInstant } from "@/lib/clock";
import { AHMEDABAD } from "@/settings";
import { api } from "./api";

const d = (s: string) => s as CivilDate;

describe("tithiFromDate", () => {
  it("uses the udaya tithi when no time is given", () => {
    const p = api.tithiFromDate(
      AHMEDABAD,
      d("2026-10-22"),
      undefined,
      "moment",
    );
    expect(p.lunarDate).toEqual({
      month: "Ashvin",
      paksha: "shukla",
      tithi: 11,
    });
    expect(p.nearChange).toBe(false);
  });

  it("uses the tithi at the moment when a time is given", () => {
    // Sud 11 ends ~2:48 PM IST on 22 Oct 2026; 6 PM is Sud 12.
    const p = api.tithiFromDate(AHMEDABAD, d("2026-10-22"), "18:00", "moment");
    expect(p.lunarDate.tithi).toBe(12);
    // "Tithi shown on the calendar for that date" ignores the time.
    expect(
      api.tithiFromDate(AHMEDABAD, d("2026-10-22"), "18:00", "calendar-day")
        .lunarDate.tithi,
    ).toBe(11);
  });

  it("maps a pre-sunrise moment to the previous civil day", () => {
    const p = api.tithiFromDate(
      AHMEDABAD,
      d("2026-10-22"),
      "05:00",
      "calendar-day",
    );
    expect(p.civilDate).toBe("2026-10-21");
    expect(p.lunarDate.tithi).toBe(10);
  });

  it("warns within 1 hour of a tithi change, not outside it", () => {
    expect(
      api.tithiFromDate(AHMEDABAD, d("2026-10-22"), "13:52", "moment")
        .nearChange,
    ).toBe(true);
    expect(
      api.tithiFromDate(AHMEDABAD, d("2026-10-22"), "13:44", "moment")
        .nearChange,
    ).toBe(false);
  });
});

it("reads a WWII-era Asia/Kolkata time at +06:30", () => {
  expect(
    new Date(
      localInstant(d("1943-06-01"), "12:00", "Asia/Kolkata"),
    ).toISOString(),
  ).toBe("1943-06-01T05:30:00.000Z");
  expect(
    new Date(
      localInstant(d("1950-06-01"), "12:00", "Asia/Kolkata"),
    ).toISOString(),
  ).toBe("1950-06-01T06:30:00.000Z");
});

it("lists moonrise and moonset in the sunrise-to-sunrise day, as Drik does", () => {
  // Drik, Ahmedabad, Thu 22 Oct 2026: moonrise 3:41 PM, moonset 3:38 AM Fri.
  const { rise, set } = api.moon(AHMEDABAD, d("2026-10-22"));
  expect(Math.abs(rise! - Date.parse("2026-10-22T10:11:00Z"))).toBeLessThan(
    60_000,
  );
  expect(Math.abs(set! - Date.parse("2026-10-22T22:08:00Z"))).toBeLessThan(
    60_000,
  );
});
