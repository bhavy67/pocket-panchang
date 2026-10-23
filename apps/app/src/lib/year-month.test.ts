import { isParseError } from "@panchang/engine";
import { expect, it } from "vitest";
import { parseYearMonth } from "./year-month";

it("parses YYYY-MM and rejects malformed months", () => {
  expect(parseYearMonth("2026-10")).toBe("2026-10");
  for (const bad of [
    "2026-13",
    "2026-00",
    "2026-1",
    "26-10",
    "2026-10-01",
    "2300-01",
    "",
  ])
    expect(isParseError(parseYearMonth(bad))).toBe(true);
});
