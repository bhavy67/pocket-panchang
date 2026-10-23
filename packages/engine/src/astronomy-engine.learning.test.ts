// Learning tests: they pin down facts about astronomy-engine that the engine relies on.
// They test the library, not our code, so they pass from day one. If one fails after a
// library upgrade, our assumptions changed: stop and re-read the docs.
import {
  Body,
  MakeTime,
  MoonPhase,
  Observer,
  SearchAltitude,
  SearchMoonPhase,
  SearchRiseSet,
} from "astronomy-engine";
import { describe, expect, it } from "vitest";

const AHMEDABAD = new Observer(23.0225, 72.5714, 0);
const OCT_22_2026_UTC_MIDNIGHT = new Date("2026-10-22T00:00:00Z");

describe("astronomy-engine time scale", () => {
  it("counts UT days from J2000 = 2000-01-01T12:00:00Z (noon, not midnight)", () => {
    expect(MakeTime(new Date("2000-01-01T12:00:00Z")).ut).toBe(0);
    expect(MakeTime(new Date("2000-01-01T00:00:00Z")).ut).toBe(-0.5);
  });

  it("applies ΔT (TT − UT) internally: about 75 s in 2026 with its model", () => {
    const t = MakeTime(OCT_22_2026_UTC_MIDNIGHT);
    const deltaTSeconds = (t.tt - t.ut) * 86_400;
    expect(deltaTSeconds).toBeGreaterThan(60);
    expect(deltaTSeconds).toBeLessThan(80);
  });
});

describe("astronomy-engine as a test oracle", () => {
  it("MoonPhase is the Moon−Sun elongation in [0, 360): 127.4° → tithi 11 on 22 Oct 2026", () => {
    const phase = MoonPhase(OCT_22_2026_UTC_MIDNIGHT);
    expect(phase).toBeGreaterThanOrEqual(0);
    expect(phase).toBeLessThan(360);
    expect(Math.floor(phase / 12) + 1).toBe(11); // Shukla Ekadashi, matching Drik Panchang
  });

  it("SearchMoonPhase finds an elongation crossing (its own crossing finder)", () => {
    const newMoon = SearchMoonPhase(0, OCT_22_2026_UTC_MIDNIGHT, 40);
    expect(newMoon?.toString()).toBe("2026-11-09T07:02:42.392Z");
  });
});

describe("astronomy-engine sunrise definitions (ADR 0012)", () => {
  const upperLimbRefracted = SearchRiseSet(
    Body.Sun,
    AHMEDABAD,
    +1,
    OCT_22_2026_UTC_MIDNIGHT,
    1,
  );
  const centreGeometric = SearchAltitude(
    Body.Sun,
    AHMEDABAD,
    +1,
    OCT_22_2026_UTC_MIDNIGHT,
    1,
    0,
  );

  it("SearchRiseSet = upper limb + 34′ refraction: 06:39:30 IST, matching Drik's 06:39", () => {
    expect(upperLimbRefracted?.toString()).toBe("2026-10-22T01:09:30.538Z");
  });

  it("SearchAltitude(…, 0) = centre, no refraction: about 3.7 min later", () => {
    const diffMinutes = (centreGeometric!.ut - upperLimbRefracted!.ut) * 1440;
    expect(diffMinutes).toBeGreaterThan(3.5);
    expect(diffMinutes).toBeLessThan(4);
  });
});
