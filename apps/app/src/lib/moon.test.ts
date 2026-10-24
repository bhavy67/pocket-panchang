import { expect, it } from "vitest";
import { illuminated, moonPath } from "./moon";

it("lights the right fraction of the disc", () => {
  expect(illuminated(0)).toBeCloseTo(0);
  expect(illuminated(90)).toBeCloseTo(0.5);
  expect(illuminated(180)).toBeCloseTo(1);
  expect(illuminated(270)).toBeCloseTo(0.5);
  // Aaso Sud 11 (~130°): a waxing gibbous moon, about 82% lit.
  expect(illuminated(130)).toBeCloseTo(0.821, 2);
});

it("draws waxing on the right and waning on the left", () => {
  expect(moonPath(0, 50, 40)).toBe("");
  // First quarter: right half lit, straight terminator (rx 0).
  expect(moonPath(90, 50, 40)).toMatch(/^M 50 10 A 40 40 0 0 1 50 90 A 0 40/);
  // Last quarter: left half lit.
  expect(moonPath(270, 50, 40)).toMatch(/^M 50 10 A 40 40 0 0 0 50 90 A 0 40/);
  // Full: the terminator is the other half of the circle (rx = r).
  expect(moonPath(180, 50, 40)).toBe(
    "M 50 10 A 40 40 0 0 0 50 90 A 40 40 0 0 0 50 10 Z",
  );
  // Waxing crescent (45°): terminator bulges toward the right, the lit side.
  expect(moonPath(45, 50, 40)).toMatch(/A 28\.\d+ 40 0 0 0 50 10 Z$/);
});
