import type { Instant } from "@panchang/engine";
import { afterAll, expect, it } from "vitest";
import { loadLanguage } from "@/i18n";
import { range, time, timeShort } from "./format";

const at = (iso: string) => Date.parse(iso) as Instant;
const IST = "Asia/Kolkata";
const nb = (s: string) => s.replace(/\s/g, " ");

afterAll(() => loadLanguage("en"));

it("formats times and ranges in English and Gujarati", async () => {
  await loadLanguage("en");
  expect(nb(time(at("2026-10-22T09:17:00Z"), IST))).toBe("2:47 PM");
  expect(
    nb(range(at("2026-10-22T08:20:00Z"), at("2026-10-22T09:46:00Z"), IST)),
  ).toBe("1:50 – 3:16 PM");
  expect(
    nb(range(at("2026-10-22T06:10:00Z"), at("2026-10-22T07:40:00Z"), IST)),
  ).toBe("11:40 AM – 1:10 PM");
  expect(timeShort(at("2026-10-22T09:17:00Z"), IST)).toBe("2:47");
  await loadLanguage("gu");
  expect(nb(time(at("2026-10-22T09:17:00Z"), IST))).toBe("૨:૪૭ બપોરે");
  expect(
    nb(range(at("2026-10-22T08:20:00Z"), at("2026-10-22T09:46:00Z"), IST)),
  ).toBe("૧:૫૦ – ૩:૧૬ બપોરે");
  expect(timeShort(at("2026-10-22T09:17:00Z"), IST)).toBe("૨:૪૭");
});
