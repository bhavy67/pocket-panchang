import { describe, expect, it } from "vitest";
import fixture from "../../../../fixtures/ahmedabad-2026.json";
import { parseYearMonth, type YearMonth } from "@/lib/year-month";
import { AHMEDABAD } from "@/settings";
import { api } from "./api";

describe("api.month", () => {
  it("computes a whole month offline, matching Drik sunrise and weekday (Ahmedabad)", () => {
    const month = parseYearMonth("2026-10") as YearMonth;
    const start = performance.now();
    const days = api.month(AHMEDABAD, month);
    console.log(
      `month computed in ${(performance.now() - start).toFixed(0)} ms`,
    );

    expect(days.map((d) => d.date)).toEqual(
      Array.from(
        { length: 31 },
        (_, i) => `2026-10-${String(i + 1).padStart(2, "0")}`,
      ),
    );
    const checked = fixture.days.filter((f) => f.date.startsWith("2026-10"));
    expect(checked.length).toBeGreaterThan(0);
    for (const f of checked) {
      const day = days.find((d) => d.date === f.date)!.day;
      if (day.kind !== "day") throw new Error(`no civil day ${f.date}`);
      expect(Math.abs(day.sunrise - Date.parse(f.sunrise.utc))).toBeLessThan(
        60_000,
      );
      expect(day.vara + 1).toBe(f.weekday); // fixture: 1 = Sunday
    }
  });
});
