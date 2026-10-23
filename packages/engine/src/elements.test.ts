import { describe, expect, it } from "vitest";
import {
  isVishti,
  karanaAt,
  karanaEnds,
  karanaName,
  nakshatraAt,
  nakshatraEnds,
  yogaAt,
  yogaEnds,
} from "./elements";
import { instant } from "./testing";
import type { Instant } from "./time";

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;
const SUNRISE = instant("2026-10-22T01:09:30.540Z"); // Ahmedabad (engine)

describe("elements on 22 Oct 2026, Ahmedabad (Drik Panchang, retrieved 2026-10-22)", () => {
  it("nakshatra 24 Shatabhisha at sunrise, ending within ±2 min of Drik's 20:49 IST", () => {
    expect(nakshatraAt(SUNRISE)).toBe(24);
    const end = nakshatraEnds(SUNRISE, (SUNRISE + DAY_MS) as Instant)[0]!;
    expect(end.index).toBe(24);
    expect(
      Math.abs(end.endsAt - instant("2026-10-22T15:19:00Z")),
    ).toBeLessThanOrEqual(2 * MINUTE_MS);
  });

  it("yoga 11 Vriddhi at sunrise, ending within ±2 min of Drik's 23:40 IST", () => {
    expect(yogaAt(SUNRISE)).toBe(11);
    const end = yogaEnds(SUNRISE, (SUNRISE + DAY_MS) as Instant)[0]!;
    expect(end.index).toBe(11);
    expect(
      Math.abs(end.endsAt - instant("2026-10-22T18:10:00Z")),
    ).toBeLessThanOrEqual(2 * MINUTE_MS);
  });

  it("karana 22 Vishti, then Bava, matching Drik's sequence", () => {
    expect(karanaAt(SUNRISE)).toBe(22);
    expect(karanaName(22)).toBe("Vishti");
    expect(
      karanaEnds(SUNRISE, (SUNRISE + DAY_MS) as Instant).map((e) =>
        karanaName(e.index),
      ),
    ).toEqual(["Vishti", "Bava"]);
  });
});

describe("karana naming (11 names over 60 half-tithis)", () => {
  it("1 is Kimstughna, 2–57 cycle the 7 movable karanas, 58–60 are Shakuni, Chatushpada, Naga", () => {
    expect([1, 2, 3, 8, 9, 57, 58, 59, 60].map(karanaName)).toEqual([
      "Kimstughna",
      "Bava",
      "Balava",
      "Vishti",
      "Bava",
      "Vishti",
      "Shakuni",
      "Chatushpada",
      "Naga",
    ]);
    expect(() => karanaName(61)).toThrow(RangeError);
  });

  it("Vishti (Bhadra) occurs exactly 8 times per lunation", () => {
    expect(
      Array.from({ length: 60 }, (_, i) => i + 1).filter(isVishti),
    ).toEqual([8, 15, 22, 29, 36, 43, 50, 57]);
  });
});

describe("sequences over a month", () => {
  const start = instant("2026-10-01T00:00:00Z");
  const end = (start + 30 * DAY_MS) as Instant;

  it.each([
    ["nakshatra", nakshatraEnds(start, end), 27],
    ["yoga", yogaEnds(start, end), 27],
    ["karana", karanaEnds(start, end), 60],
  ] as const)(
    "%s ends advance by exactly one index each time (cyclic)",
    (_name, ends, count) => {
      expect(ends.length).toBeGreaterThan(25);
      for (let i = 1; i < ends.length; i++) {
        expect(ends[i]!.index).toBe((ends[i - 1]!.index % count) + 1);
        expect(ends[i]!.endsAt).toBeGreaterThan(ends[i - 1]!.endsAt);
      }
    },
  );
});
