import type { Instant } from "@panchang/engine";
import { describe, expect, it } from "vitest";
import { icsCalendar, occurrenceEntry, occurrenceUid } from "./ics";
import { occurrences, type PersonalEvent } from "./occurrences";
import { AHMEDABAD, clockFor, date } from "./testing";

const GENERATED = Date.UTC(2026, 9, 23, 12, 0, 0) as Instant;
const shraddh: PersonalEvent = {
  id: "ba-varsi",
  title: "Ba's varsi",
  kind: "shraddh",
  lunarDate: { month: "Bhadrapada", paksha: "krishna", tithi: 10 },
  policyOverrides: {},
  remindDaysBefore: [0, 1],
};
const occ = occurrences(
  shraddh,
  { householdPolicy: {}, location: AHMEDABAD },
  date("2026-01-01"),
  date("2026-12-31"),
  clockFor,
);
const ics = icsCalendar(
  occ.map((o) => occurrenceEntry(shraddh, o)),
  GENERATED,
);

describe(".ics generation (RFC 5545)", () => {
  it("uses CRLF line endings and wraps every event in VCALENDAR", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics.replace(/\r\n/g, "").includes("\n")).toBe(false);
  });

  it("writes all-day events: DTSTART as a date and DTEND the next day", () => {
    const d = occ[0]!.date.replace(/-/g, "");
    expect(ics).toContain(`DTSTART;VALUE=DATE:${d}`);
    expect(ics).toMatch(/DTEND;VALUE=DATE:\d{8}/);
  });

  it("gives the annual and Pitru Paksha occurrences of the same year distinct, stable UIDs (ADR 0016)", () => {
    const uids = occ.map(occurrenceUid);
    expect(new Set(uids).size).toBe(uids.length);
    expect(
      uids.every((u) =>
        /^ba-varsi-\d{4}-(annual|pitru-paksha|adhik|nija)@panchang\.bhavyladani\.in$/.test(
          u,
        ),
      ),
    ).toBe(true);
    expect(
      icsCalendar(
        occ.map((o) => occurrenceEntry(shraddh, o)),
        GENERATED,
      ),
    ).toBe(ics);
  });

  it("names the observance city in the summary (ADR 0007) and escapes , ; \\", () => {
    expect(ics).toContain("SUMMARY:Ba's varsi · Ahmedabad");
    const special = icsCalendar(
      [
        {
          uid: "x",
          date: date("2026-10-22"),
          summary: "a,b;c\\d",
          remindDaysBefore: [],
        },
      ],
      GENERATED,
    );
    expect(special).toContain("SUMMARY:a\\,b\\;c\\\\d");
  });

  it("escapes all four RFC 5545 TEXT characters in one title: ; → \\; , → \\, \\ → \\\\ newline → \\n", () => {
    const title = "Ba; Dada, C:\\path\nline two";
    const out = icsCalendar(
      [
        {
          uid: "z",
          date: date("2026-10-22"),
          summary: title,
          description: title,
          remindDaysBefore: [],
        },
      ],
      GENERATED,
    );
    const expected = String.raw`Ba\; Dada\, C:\\path\nline two`;
    expect(out).toContain(`SUMMARY:${expected}\r\n`);
    expect(out).toContain(`DESCRIPTION:${expected}\r\n`);
    // The raw newline must not survive into the file (it would end the property line early).
    expect(out).not.toContain("Dada, C");
    expect(out.split("\r\n").some((l) => l === "line two")).toBe(false);
  });

  it("alarms at 08:00 on the day and the day before, relative to the all-day start", () => {
    expect(ics).toContain("TRIGGER;RELATED=START:PT8H0M");
    expect(ics).toContain("TRIGGER;RELATED=START:-PT16H0M");
  });

  it("folds lines to ≤ 75 octets without splitting a Gujarati character", () => {
    const long = icsCalendar(
      [
        {
          uid: "y",
          date: date("2026-10-22"),
          summary: "બાની વરસી ".repeat(12),
          remindDaysBefore: [],
        },
      ],
      GENERATED,
    );
    for (const line of long.split("\r\n"))
      expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
    const unfolded = long.replace(/\r\n /g, "");
    expect(unfolded).toContain(
      "SUMMARY:" + "બાની વરસી ".repeat(12).trimEnd().slice(0, 10),
    );
  });

  it("stamps DTSTAMP from the passed-in time (no clock in the pure package)", () => {
    expect(ics).toContain("DTSTAMP:20261023T120000Z");
  });
});
