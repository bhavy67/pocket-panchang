// Family-history check (Phase 6, ADR 0013): for past events your family actually observed,
// print which occurrence-policy values reproduce the observed dates. Use it to settle the
// §13 "Pending family confirmations" with real history.
//
// Input: fixtures/private/family-history.json (gitignored, personal). Format: see
// fixtures/family-history.example.json. Without the private file, the example is used.
// Run: pnpm --filter @panchang/calendar family-history
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { it } from "vitest";
import {
  occurrences,
  type EventKind,
  type OccurrencePolicy,
  type PersonalEvent,
} from "../src/occurrences";
import { clockFor, date } from "../src/testing";
import type { Location, LunarDate } from "../src/types";

type HistoryEvent = {
  title: string;
  kind: EventKind;
  lunarDate: LunarDate;
  observed: string[];
  pitruPakshaObserved?: string[];
};
type History = { observance: Location; events: HistoryEvent[] };

const AXES = {
  window: ["sunrise", "aparahna"],
  vriddhiTithi: ["first-day", "second-day"],
  kshayaTithi: ["same-day", "following-day"],
  adhikMonth: ["nija", "adhik", "both", "match-origin"],
} as const;

it("family history", { timeout: 600_000 }, () => {
  const fixtures = join(import.meta.dirname, "../../../fixtures");
  const privatePath = join(fixtures, "private/family-history.json");
  const usingExample = !existsSync(privatePath);
  const history = JSON.parse(
    readFileSync(
      usingExample
        ? join(fixtures, "family-history.example.json")
        : privatePath,
      "utf8",
    ),
  ) as History;
  if (usingExample)
    console.log(
      "No fixtures/private/family-history.json — using the example file.\n",
    );

  for (const h of history.events) {
    const years = [
      ...new Set(h.observed.map((d) => Number(d.slice(0, 4)))),
    ].sort();
    const from = date(`${years[0]}-01-01`);
    const to = date(`${years.at(-1)}-12-31`);
    const matches: string[] = [];
    for (const window of AXES.window)
      for (const vriddhiTithi of AXES.vriddhiTithi)
        for (const kshayaTithi of AXES.kshayaTithi)
          for (const adhikMonth of AXES.adhikMonth) {
            const policy: Partial<OccurrencePolicy> = {
              window,
              vriddhiTithi,
              kshayaTithi,
              adhikMonth,
              pitruPaksha: (h.pitruPakshaObserved?.length ?? 0) > 0,
            };
            const event: PersonalEvent = {
              id: "h",
              title: h.title,
              kind: h.kind,
              lunarDate: h.lunarDate,
              policyOverrides: policy,
              remindDaysBefore: [],
            };
            const got = occurrences(
              event,
              { householdPolicy: {}, location: history.observance },
              from,
              to,
              clockFor,
            );
            const annual = got
              .filter((o) => o.kind === "annual")
              .map((o) => o.date)
              .sort();
            const pitru = got
              .filter((o) => o.kind === "pitru-paksha")
              .map((o) => o.date)
              .sort();
            const sameAnnual =
              JSON.stringify(annual) === JSON.stringify([...h.observed].sort());
            const samePitru =
              !h.pitruPakshaObserved ||
              JSON.stringify(pitru) ===
                JSON.stringify([...h.pitruPakshaObserved].sort());
            if (sameAnnual && samePitru)
              matches.push(
                `window=${window}, vriddhi=${vriddhiTithi}, kshaya=${kshayaTithi}, adhik=${adhikMonth}`,
              );
          }
    const defaults = occurrences(
      {
        id: "h",
        title: h.title,
        kind: h.kind,
        lunarDate: h.lunarDate,
        policyOverrides: {},
        remindDaysBefore: [],
      },
      { householdPolicy: {}, location: history.observance },
      from,
      to,
      clockFor,
    );
    console.log(
      `## ${h.title} (${h.kind}, ${h.lunarDate.month} ${h.lunarDate.paksha === "shukla" ? "Sud" : "Vad"} ${h.lunarDate.tithi})`,
    );
    console.log(`observed:        ${h.observed.join(", ")}`);
    console.log(
      `defaults give:   ${defaults.map((o) => `${o.date}${o.kind === "pitru-paksha" ? " (PP)" : ""}`).join(", ")}`,
    );
    console.log(
      matches.length
        ? `policies matching every observed date (${matches.length}):\n  ${matches.join("\n  ")}`
        : "no policy combination reproduces every observed date: check the lunar date, city, or ask about the convention",
    );
    console.log("");
  }
});
