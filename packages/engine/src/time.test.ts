import { AstroTime, MakeTime, SearchMoonPhase } from "astronomy-engine";
import { describe, expect, it } from "vitest";
import { isParseError } from "./parse";
import { instant } from "./testing";
import {
  fromAstroTime,
  MAX_INSTANT_MS,
  MIN_INSTANT_MS,
  parseInstant,
  toAstroTime,
} from "./time";

describe("parseInstant", () => {
  it("accepts an integer ms value in range and returns the same number", () => {
    const ms = Date.UTC(2026, 9, 22, 1, 9, 30);
    expect(parseInstant(ms)).toBe(ms);
  });

  it("accepts the range edges: MIN inclusive, MAX exclusive", () => {
    expect(isParseError(parseInstant(MIN_INSTANT_MS))).toBe(false);
    expect(isParseError(parseInstant(MAX_INSTANT_MS - 1))).toBe(false);
    expect(isParseError(parseInstant(MAX_INSTANT_MS))).toBe(true);
    expect(isParseError(parseInstant(MIN_INSTANT_MS - 1))).toBe(true);
  });

  it("accepts instants before 1970 (negative ms), e.g. a 1942 birth (ADR 0006)", () => {
    expect(parseInstant(Date.UTC(1942, 5, 1))).toBe(Date.UTC(1942, 5, 1));
  });

  it.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1.5,
  ])("rejects %s", (bad) => {
    const result = parseInstant(bad);
    expect(isParseError(result)).toBe(true);
  });
});

describe("toAstroTime", () => {
  it("maps the J2000 epoch (2000-01-01T12:00:00Z) to ut = 0", () => {
    expect(toAstroTime(instant("2000-01-01T12:00:00Z")).ut).toBe(0);
  });

  it("maps 2026-10-22T00:00:00Z to ut = 9790.5 days", () => {
    expect(toAstroTime(instant("2026-10-22T00:00:00Z")).ut).toBeCloseTo(
      9790.5,
      12,
    );
  });

  it("agrees with astronomy-engine's own Date conversion", () => {
    const i = instant("1942-06-01T03:30:00Z");
    expect(toAstroTime(i).ut).toBeCloseTo(MakeTime(new Date(i)).ut, 12);
  });
});

describe("fromAstroTime", () => {
  it.each([
    "2000-01-01T12:00:00Z",
    "2026-10-22T01:09:30.538Z",
    "1942-06-01T03:30:00.001Z",
    "1800-01-01T00:00:00Z",
  ])("round-trips %s exactly to the millisecond", (iso) => {
    const i = instant(iso);
    expect(fromAstroTime(toAstroTime(i))).toBe(i);
  });

  it("throws RangeError when the result is outside [MIN, MAX), keeping the brand honest", () => {
    const dayMs = 86_400_000;
    const j2000Ms = Date.UTC(2000, 0, 1, 12);
    const utOf = (ms: number) => (ms - j2000Ms) / dayMs;
    expect(() => fromAstroTime(new AstroTime(utOf(MAX_INSTANT_MS)))).toThrow(
      RangeError,
    );
    expect(() =>
      fromAstroTime(new AstroTime(utOf(MIN_INSTANT_MS - 1))),
    ).toThrow(RangeError);
    expect(fromAstroTime(new AstroTime(utOf(MAX_INSTANT_MS - 1)))).toBe(
      MAX_INSTANT_MS - 1,
    );
    expect(fromAstroTime(new AstroTime(utOf(MIN_INSTANT_MS)))).toBe(
      MIN_INSTANT_MS,
    );
  });

  it("converts a library search result (next new moon) to an integer-ms Instant", () => {
    const newMoon = SearchMoonPhase(
      0,
      toAstroTime(instant("2026-10-22T00:00:00Z")),
      40,
    );
    expect(newMoon).not.toBeNull();
    const result = fromAstroTime(newMoon!);
    expect(Number.isInteger(result)).toBe(true);
    expect(new Date(result).toISOString()).toBe("2026-11-09T07:02:42.392Z");
  });
});
