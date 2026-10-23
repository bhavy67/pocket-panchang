import { isParseError } from "@panchang/engine";
import { describe, expect, it } from "vitest";
import { buildBackup, parseBackup } from "./backup";
import type { StoredEvent } from "./db";
import { AHMEDABAD, defaultSettings } from "./settings";

const NADIAD = {
  ...AHMEDABAD,
  id: "1261481",
  name: "Nadiad",
  lat: 22.69,
  lng: 72.86,
} as typeof AHMEDABAD;

const events: StoredEvent[] = [
  {
    id: "a1",
    title: "Ba's varsi",
    kind: "shraddh",
    lunarDate: { month: "Kartika", paksha: "krishna", tithi: 5 },
    policyOverrides: { window: "sunrise", pitruPaksha: false },
    pitruPakshaDay: 15,
    observanceLocation: AHMEDABAD,
    origin: { date: "1998-11-12" as never, time: "05:40", place: NADIAD },
    remindDaysBefore: [0, 1],
    notes: "Mandir at 10",
    createdAt: 1,
    updatedAt: 2,
  },
  {
    id: "b2",
    title: "Dad's janma tithi",
    kind: "birthday",
    lunarDate: { month: "Shravana", adhik: true, paksha: "shukla", tithi: 15 },
    policyOverrides: {},
    remindDaysBefore: [],
    createdAt: 3,
    updatedAt: 3,
  },
];

describe("backup", () => {
  it("round-trips settings and events losslessly", () => {
    const settings = {
      ...defaultSettings(AHMEDABAD, "gu"),
      householdPolicy: {
        shraddh: {
          window: "aparahna" as const,
          kshayaTithi: "following-day" as const,
        },
      },
      observanceLocation: NADIAD,
    };
    const backup = buildBackup(settings, events, 42);
    expect(parseBackup(JSON.stringify(backup))).toEqual(backup);
  });

  it("rejects damaged, foreign and newer files with a plain message", () => {
    const good = JSON.parse(
      JSON.stringify(buildBackup(defaultSettings(AHMEDABAD, "en"), events, 1)),
    ) as {
      schemaVersion: number;
      events: { lunarDate: { tithi: number } }[];
    };
    expect(isParseError(parseBackup("not json"))).toBe(true);
    expect(isParseError(parseBackup("{}"))).toBe(true);
    const newer = parseBackup(JSON.stringify({ ...good, schemaVersion: 99 }));
    expect(isParseError(newer) && "reason" in newer && newer.reason).toBe(
      "newer",
    );
    good.events[0]!.lunarDate.tithi = 16;
    expect(isParseError(parseBackup(JSON.stringify(good)))).toBe(true);
  });
});
