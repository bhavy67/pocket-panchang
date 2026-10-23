// Lists the engine's element-end instants on the sample days of the cities without Drik
// data, plus the 1982–83 new moons and sankrantis, for the JPL Horizons check (§10).
// Writes fixtures/horizons/instants.json. Run: pnpm --filter @panchang/engine jpl-instants
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { it } from "vitest";
import { assembleDay } from "../src/day";
import { lunationAt } from "../src/months";
import { localMidnight } from "../src/testing";
import type { Instant } from "../src/time";
import { CITIES } from "./cities";

type Row = {
  utc: string;
  kind: "tithi" | "nakshatra" | "yoga" | "new-moon" | "sankranti";
  index: number;
};

it("lists instants", { timeout: 600_000 }, () => {
  const fixtures = join(import.meta.dirname, "../../../fixtures");
  const samples = JSON.parse(
    readFileSync(join(fixtures, "sample-days.json"), "utf8"),
  ) as Record<string, { years: Record<string, { date: string }[]> }>;
  const rows = new Map<string, Row>();
  for (const city of CITIES.filter((c) => c.key !== "ahmedabad")) {
    for (const year of ["2026", "2027"]) {
      for (const { date } of samples[city.key]!.years[year]!) {
        const d = assembleDay(localMidnight(date, city.tz), city);
        if (d.kind !== "day") continue;
        for (const kind of ["tithi", "nakshatra", "yoga"] as const) {
          for (const e of d[kind].ends)
            rows.set(`${kind}:${e.endsAt}`, {
              utc: new Date(e.endsAt).toISOString(),
              kind,
              index: e.index,
            });
        }
      }
    }
  }
  let t = Date.parse("1982-08-25T00:00:00Z");
  for (let i = 0; i < 9; i++) {
    const l = lunationAt(t as Instant);
    rows.set(`nm:${l.start}`, {
      utc: new Date(l.start).toISOString(),
      kind: "new-moon",
      index: 0,
    });
    for (const s of l.sankrantis)
      rows.set(`s:${s}`, {
        utc: new Date(s).toISOString(),
        kind: "sankranti",
        index: 0,
      });
    t = l.end + 86_400_000;
  }
  const list = [...rows.values()].sort((a, b) => a.utc.localeCompare(b.utc));
  writeFileSync(
    join(fixtures, "horizons/instants.json"),
    JSON.stringify(list, null, 2) + "\n",
  );
  const counts: Record<string, number> = {};
  for (const r of list) counts[r.kind] = (counts[r.kind] ?? 0) + 1;
  console.log(
    "instants",
    list.length,
    Object.entries(counts)
      .map(([k, n]) => `${k}:${n}`)
      .join(" "),
  );
});
