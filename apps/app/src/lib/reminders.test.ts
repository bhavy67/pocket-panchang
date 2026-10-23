// ADR 0007 required tests: same-zone, west and east devices, DST weeks in New York and London.
import type { CivilDate, Instant } from "@panchang/engine";
import { describe, expect, it } from "vitest";
import { notificationId, reminderInstant } from "./reminders";

const d = (s: string) => s as CivilDate;
const iso = (t: Instant) => new Date(t).toISOString();
const IST = "Asia/Kolkata";
const NY = "America/New_York";
const LON = "Europe/London";
const SYD = "Australia/Sydney";

describe("reminderInstant (ADR 0007)", () => {
  it("same zone: the chosen time on the day, or N days before", () => {
    expect(iso(reminderInstant(d("2026-11-10"), 0, "08:00", IST, IST))).toBe(
      "2026-11-10T02:30:00.000Z",
    );
    expect(iso(reminderInstant(d("2026-11-10"), 1, "08:00", IST, IST))).toBe(
      "2026-11-09T02:30:00.000Z",
    );
  });

  it("device west (New Jersey) of an Ahmedabad date: the device morning before", () => {
    // 08:00 IST Tue 10 Nov = Mon 21:30 EST, so the day-of reminder is Mon 08:00 EST.
    expect(iso(reminderInstant(d("2026-11-10"), 0, "08:00", IST, NY))).toBe(
      "2026-11-09T13:00:00.000Z",
    );
    expect(iso(reminderInstant(d("2026-11-10"), 1, "08:00", IST, NY))).toBe(
      "2026-11-08T13:00:00.000Z",
    );
  });

  it("device east (Sydney) of an Ahmedabad date: same date, before Ahmedabad's morning", () => {
    const fire = reminderInstant(d("2026-11-10"), 0, "08:00", IST, SYD);
    expect(iso(fire)).toBe("2026-11-09T21:00:00.000Z"); // Tue 08:00 AEDT
    expect(fire).toBeLessThanOrEqual(Date.parse("2026-11-10T02:30:00Z"));
  });

  it("New York DST end week (1 Nov 2026): fires at 08:00 local on both sides of the change", () => {
    // Sat 31 Oct EDT (−4) and Mon 2 Nov EST (−5), observance in New York itself.
    expect(iso(reminderInstant(d("2026-10-31"), 0, "08:00", NY, NY))).toBe(
      "2026-10-31T12:00:00.000Z",
    );
    expect(iso(reminderInstant(d("2026-11-02"), 1, "08:00", NY, NY))).toBe(
      "2026-11-01T13:00:00.000Z",
    );
    // NRI case across the change: Ahmedabad Mon 2 Nov 08:00 IST = Sun 21:30 EST → Sun 08:00 EST.
    expect(iso(reminderInstant(d("2026-11-02"), 0, "08:00", IST, NY))).toBe(
      "2026-11-01T13:00:00.000Z",
    );
  });

  it("London DST end week (25 Oct 2026)", () => {
    expect(iso(reminderInstant(d("2026-10-24"), 0, "08:00", LON, LON))).toBe(
      "2026-10-24T07:00:00.000Z",
    );
    expect(iso(reminderInstant(d("2026-10-26"), 0, "08:00", LON, LON))).toBe(
      "2026-10-26T08:00:00.000Z",
    );
    // Ahmedabad Mon 26 Oct 08:00 IST = 02:30 GMT, before London's 08:00: the Sunday before.
    expect(iso(reminderInstant(d("2026-10-26"), 0, "08:00", IST, LON))).toBe(
      "2026-10-25T08:00:00.000Z",
    );
  });
});

it("notification ids are stable positive int32s", () => {
  const id = notificationId("a1|2026-11-10|annual||0");
  expect(id).toBe(notificationId("a1|2026-11-10|annual||0"));
  expect(id).toBeGreaterThan(0);
  expect(id).toBeLessThanOrEqual(2 ** 31 - 1);
  expect(notificationId("a1|2026-11-10|annual||1")).not.toBe(id);
});
