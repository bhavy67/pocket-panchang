// Picks ~24–28 sample days per city-year (accuracy-fixtures skill, §10) and writes
// fixtures/sample-days.json with the reason for each day. Run:
//   pnpm --filter @panchang/engine select-days
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { it } from "vitest";
import { assembleDay, type PanchangDay } from "../src/day";
import { localMidnight } from "../src/testing";
import { CITIES, DST_DAYS } from "./cities";

type Festival = { name: string; month: string; tithi: number };
const FESTIVALS: Festival[] = [
  { name: "Maha Shivaratri", month: "Magha", tithi: 29 },
  { name: "Holika Dahan", month: "Phalguna", tithi: 15 },
  { name: "Dhuleti", month: "Phalguna", tithi: 16 },
  { name: "Raksha Bandhan", month: "Shravana", tithi: 15 },
  { name: "Janmashtami", month: "Shravana", tithi: 23 },
  { name: "Navratri start", month: "Ashvin", tithi: 1 },
  { name: "Navratri end", month: "Ashvin", tithi: 9 },
  { name: "Dussehra", month: "Ashvin", tithi: 10 },
  { name: "Dhanteras", month: "Ashvin", tithi: 28 },
  { name: "Kali Chaudas", month: "Ashvin", tithi: 29 },
  { name: "Diwali", month: "Ashvin", tithi: 30 },
  { name: "Bestu Varas", month: "Kartika", tithi: 1 },
  { name: "Bhai Bij", month: "Kartika", tithi: 2 },
];

it("selects sample days", { timeout: 600_000 }, () => {
  type Pick = { date: string; reasons: string[] };
  const out: Record<
    string,
    { name: string; geonameId: number; years: Record<string, Pick[]> }
  > = {};
  for (const city of CITIES) {
    out[city.key] = { name: city.name, geonameId: city.geonameId, years: {} };
    for (const year of [2026, 2027]) {
      const picks = new Map<string, string[]>();
      const add = (date: string, reason: string) =>
        picks.set(date, [...(picks.get(date) ?? []), reason]);
      for (const d of ["01-15", "03-15", "05-15", "06-21", "09-15", "12-21"])
        add(`${year}-${d}`, "seasonal anchor");
      add(`${year}-01-14`, "Uttarayan / Makar Sankranti");
      for (const d of DST_DAYS[city.key]?.[year] ?? [
        `${year}-04-15`,
        `${year}-11-15`,
      ])
        add(d, DST_DAYS[city.key] ? "DST transition" : "seasonal anchor");

      const days: { date: string; day: PanchangDay }[] = [];
      for (
        let t = Date.parse(`${year}-01-01T12:00:00Z`);
        t < Date.parse(`${year + 1}-01-01T00:00:00Z`);
        t += 86_400_000
      ) {
        const date = new Date(t).toISOString().slice(0, 10);
        const day = assembleDay(localMidnight(date, city.tz), city);
        if (day.kind === "day") days.push({ date, day });
      }
      for (const f of FESTIVALS) {
        const hit = days.find(
          (d) =>
            !d.day.month.adhik &&
            d.day.month.name === f.month &&
            d.day.tithi.atSunrise === f.tithi,
        );
        if (hit) add(hit.date, `near ${f.name}`);
      }
      for (const d of days.filter((d) => d.day.tithi.vriddhi).slice(0, 2))
        add(d.date, "vriddhi tithi");
      for (const d of days
        .filter((d) => d.day.tithi.kshaya.length > 0)
        .slice(0, 2))
        add(d.date, "kshaya tithi");
      const adhik = days.find((d) => d.day.month.adhik);
      if (adhik) add(adhik.date, "adhik month");
      const mesha = days.find(
        (d, i) =>
          i > 0 &&
          d.day.month.name === "Vaishakha" &&
          days[i - 1]!.day.month.name === "Chaitra",
      );
      if (mesha) add(mesha.date, "lunar month start (Vaishakha)");
      out[city.key]!.years[year] = [...picks]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, reasons]) => ({ date, reasons }));
    }
  }
  // 1982–83: the kshaya-masa cycle (ADR 0008), Ahmedabad only: mid-lunation days Sep 1982 – Apr 1983.
  out["ahmedabad"]!.years["1982-83"] = [
    "1982-09-05",
    "1982-10-01",
    "1982-10-30",
    "1982-11-29",
    "1982-12-29",
    "1983-01-14",
    "1983-01-15",
    "1983-01-28",
    "1983-02-12",
    "1983-02-13",
    "1983-02-27",
    "1983-03-28",
    "1983-04-25",
  ].map((date) => ({ date, reasons: ["kshaya-masa cycle (ADR 0008)"] }));
  writeFileSync(
    join(import.meta.dirname, "../../../fixtures/sample-days.json"),
    JSON.stringify(out, null, 2) + "\n",
  );
  for (const [k, c] of Object.entries(out))
    console.log(
      k,
      Object.entries(c.years)
        .map(([y, d]) => `${y}: ${d.length}`)
        .join(", "),
    );
});
