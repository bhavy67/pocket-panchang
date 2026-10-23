import { expect, it } from "vitest";
import { nextMoonrise, nextMoonset } from "./moon";
import type { Instant } from "./time";

// Drik Panchang, Ahmedabad, 22 Oct 2026 (brief §2): moonrise 3:41 PM, moonset 3:38 AM Fri (IST).
const AHMEDABAD = { latitude: 23.0258, longitude: 72.5873 };
const at = (iso: string) => Date.parse(iso) as Instant;
const minutesFrom = (e: ReturnType<typeof nextMoonrise>, iso: string) =>
  e.kind === "event" ? Math.abs(e.at - Date.parse(iso)) / 60_000 : Infinity;

it("matches Drik's moonrise and moonset to the rounded minute", () => {
  const midnight = at("2026-10-21T18:30:00Z");
  const rise = nextMoonrise(midnight, AHMEDABAD);
  expect(minutesFrom(rise, "2026-10-22T10:11:00Z")).toBeLessThan(1);
  expect(
    minutesFrom(
      nextMoonset(at("2026-10-22T18:30:00Z"), AHMEDABAD),
      "2026-10-22T22:08:00Z",
    ),
  ).toBeLessThan(1);
});
