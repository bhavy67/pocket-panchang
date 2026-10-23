// Writes the hand-verification checklists for the 13 v1 festivals (Phase 6 exit criteria):
//   docs/verification/festivals-ahmedabad.md     all festivals, Ahmedabad 2026–27
//   docs/verification/festivals-other-cities.md  only dates that differ from Ahmedabad's
// Run: pnpm --filter @panchang/calendar festival-checklist
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { it } from "vitest";
import { FESTIVALS } from "../src/festivals";
import { resolveFestivals, type FestivalOccurrence } from "../src/resolver";
import { AHMEDABAD, CITIES, date, place } from "../src/testing";

const YEARS = [2026, 2027];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fmt = (d: string) =>
  `${d} (${WEEKDAYS[new Date(`${d}T12:00:00Z`).getUTCDay()]})`;
const label = (o: FestivalOccurrence) =>
  `${o.names.en}${o.variant ? ` (${o.variant.label.en})` : ""}`;

function rule(id: string): string {
  const r = FESTIVALS.find((f) => f.id === id)!;
  if (r.kind === "tithi") {
    return `${r.month} ${r.paksha === "shukla" ? "Sud" : "Vad"} ${r.tithi}, ${r.window}, ${r.tieBreak}${r.avoidBhadra ? ", avoid Bhadra" : ""}${r.span ? `, to ${r.span.end.paksha === "shukla" ? "Sud" : "Vad"} ${r.span.end.tithi}` : ""}${r.extra?.nakshatra ? ", prefer Rohini" : ""}`;
  }
  if (r.kind === "sankranti")
    return `Makara sankranti, after sunset → next day`;
  return `${r.of} + ${r.offsetDays} day`;
}

/** Hand-written reminders for specific rows, keyed "festivalId:year". */
const REVIEW_NOTES: Record<string, string> = {
  "holika-dahan:2026":
    "check eclipse (3 Mar 2026) handling in reference calendars",
};

function notes(o: FestivalOccurrence): string {
  return [
    REVIEW_NOTES[`${o.id}:${o.date.slice(0, 4)}`] ?? "",
    o.fallback
      ? "⚠️ no day covered the window: provisional fallback (day with most of the tithi)"
      : "",
    o.afterBhadra
      ? `Rakhi after ${new Date(o.afterBhadra + 330 * 60_000).toISOString().slice(11, 16)} IST (Bhadra ends)`
      : "",
    o.endDate ? `ends ${fmt(o.endDate)}` : "",
  ]
    .filter(Boolean)
    .join("; ");
}

it("writes checklists", { timeout: 600_000 }, () => {
  const docs = join(import.meta.dirname, "../../../docs/verification");
  const results = new Map(
    CITIES.map((c) => [
      c.name,
      new Map(
        YEARS.map((y) => [
          y,
          resolveFestivals(
            FESTIVALS,
            date(`${y}-01-01`),
            date(`${y}-12-31`),
            place(c),
          ),
        ]),
      ),
    ]),
  );

  const a = [
    "# Festival verification: Ahmedabad 2026–27",
    "",
    "Computed by the engine (Phase 6) with **provisional** rules (ADR 0021). For each row, check the date against your family's printed panchang and Drik Panchang in a browser, tick both boxes, and note any difference. A festival's rule is marked `verified` only after every row for it is ticked.",
    "",
    "Regenerate: `pnpm --filter @panchang/calendar festival-checklist` (overwrites this file: copy ticks first).",
    "",
  ];
  for (const y of YEARS) {
    a.push(
      `## ${y}`,
      "",
      "| Festival | Computed date | Rule | Notes | Family panchang | Drik |",
      "|---|---|---|---|---|---|",
    );
    for (const o of results.get(AHMEDABAD.name)!.get(y)!)
      a.push(
        `| ${label(o)} | ${fmt(o.date)} | ${rule(o.id)} | ${notes(o)} | [ ] | [ ] |`,
      );
    a.push("");
  }
  writeFileSync(join(docs, "festivals-ahmedabad.md"), a.join("\n"));

  const o = [
    "# Festival verification: other cities (only dates that differ from Ahmedabad)",
    "",
    "Same rules, computed for each city's own sunrise and time zone. Rows appear only where the date differs from Ahmedabad's for that festival and year; everything else matches Ahmedabad (verified separately). Check NJ/London rows against a local temple calendar.",
    "",
    "| City | Year | Festival | City date | Ahmedabad date | Notes | Checked |",
    "|---|---|---|---|---|---|---|",
  ];
  let diffs = 0;
  for (const city of CITIES.filter((c) => c !== AHMEDABAD)) {
    for (const y of YEARS) {
      const base = new Map(
        results
          .get(AHMEDABAD.name)!
          .get(y)!
          .map((x) => [x.id, x]),
      );
      for (const x of results.get(city.name)!.get(y)!) {
        const ref = base.get(x.id);
        if (ref && ref.date === x.date && ref.endDate === x.endDate) continue;
        diffs++;
        o.push(
          `| ${city.name} | ${y} | ${label(x)} | ${fmt(x.date)}${x.endDate ? ` → ${x.endDate}` : ""} | ${ref ? fmt(ref.date) : "—"}${ref?.endDate ? ` → ${ref.endDate}` : ""} | ${notes(x)} | [ ] |`,
        );
      }
    }
  }
  if (diffs === 0) o.push("| — | — | — | no differences | — | — | — |");
  writeFileSync(join(docs, "festivals-other-cities.md"), o.join("\n") + "\n");
  console.log(
    "Ahmedabad rows",
    results.get(AHMEDABAD.name)!.get(2026)!.length +
      results.get(AHMEDABAD.name)!.get(2027)!.length,
    "| other-city differences",
    diffs,
  );
});
