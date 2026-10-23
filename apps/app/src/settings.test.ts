import { isParseError } from "@panchang/engine";
import { describe, expect, it } from "vitest";
import {
  AHMEDABAD,
  defaultSettings,
  parseLocation,
  parseSettings,
} from "./settings";

describe("parseSettings", () => {
  it("round-trips valid settings", () => {
    const s = defaultSettings(AHMEDABAD, "gu");
    expect(parseSettings(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });

  it.each([
    ["not an object", null],
    [
      "bad tz",
      {
        ...defaultSettings(AHMEDABAD, "gu"),
        location: { ...AHMEDABAD, tz: "Mars/Olympus" },
      },
    ],
    [
      "bad location id",
      {
        ...defaultSettings(AHMEDABAD, "gu"),
        location: { ...AHMEDABAD, id: "abc" },
      },
    ],
    ["bad language", { ...defaultSettings(AHMEDABAD, "gu"), language: "fr" }],
    [
      "bad policy kind",
      { ...defaultSettings(AHMEDABAD, "gu"), householdPolicy: { wedding: {} } },
    ],
    [
      "missing observance city",
      { ...defaultSettings(AHMEDABAD, "gu"), observanceLocation: undefined },
    ],
  ])("rejects %s", (_, input) => {
    expect(isParseError(parseSettings(input))).toBe(true);
  });

  it("rejects out-of-range coordinates", () => {
    expect(isParseError(parseLocation({ ...AHMEDABAD, lat: 91 }))).toBe(true);
    expect(isParseError(parseLocation({ ...AHMEDABAD, lng: Number.NaN }))).toBe(
      true,
    );
  });
});
