import { describe, expect, it } from "vitest";
import { addDays, parseCivilDate, type CivilDate } from "./civil-date";
import { isParseError } from "./parse";

describe("parseCivilDate (ADR 0014)", () => {
  it.each(["2026-10-22", "1800-01-01", "2200-12-31", "2028-02-29"])(
    "accepts %s",
    (s) => {
      expect(parseCivilDate(s)).toBe(s);
    },
  );
  it.each([
    "2026-02-30",
    "2027-02-29",
    "2026-13-01",
    "26-10-22",
    "2026-10-22T00:00",
    "1799-12-31",
    "2201-01-01",
    "",
  ])("rejects %s", (s) => expect(isParseError(parseCivilDate(s))).toBe(true));
});

describe("addDays", () => {
  it("crosses month, year and leap-day boundaries", () => {
    expect(addDays("2026-12-31" as CivilDate, 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28" as CivilDate, 1)).toBe("2028-02-29");
    expect(addDays("2026-03-01" as CivilDate, -1)).toBe("2026-02-28");
  });
});
