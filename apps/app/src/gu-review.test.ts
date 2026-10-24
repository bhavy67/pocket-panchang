// docs/i18n/gu-review.md: every Gujarati string next to its English source, as a checklist for
// a native reader. Regenerate with `GU_REVIEW_WRITE=1 pnpm --filter @panchang/app test
// gu-review` (ticks already made are kept). Fails when a string is missing from the checklist.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FESTIVALS } from "@panchang/calendar";
import * as names from "@panchang/i18n";
import { en } from "@panchang/i18n/en";
import { gu } from "@panchang/i18n/gu";
import { expect, it } from "vitest";

const FILE = join(import.meta.dirname, "../../../docs/i18n/gu-review.md");
const previous = existsSync(FILE) ? readFileSync(FILE, "utf8") : "";
const ticked = new Set(
  [...previous.matchAll(/^\| \[x\] \| `([^`]+)`/gm)].map((m) => m[1]),
);

type Row = [key: string, english: string, gujarati: string];
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");
const table = (title: string, rows: Row[]) =>
  [
    `### ${title}`,
    "",
    "| OK | Key | English | ગુજરાતી (draft) |",
    "|---|---|---|---|",
    ...rows.map(
      ([k, a, b]) =>
        `| [${ticked.has(k) ? "x" : " "}] | \`${k}\` | ${cell(a)} | ${cell(b)} |`,
    ),
    "",
  ].join("\n");

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
const MONTHS = [
  "Kartika",
  "Margashirsha",
  "Pausha",
  "Magha",
  "Phalguna",
  "Chaitra",
  "Vaishakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadrapada",
  "Ashvin",
] as const;
const KARANAS = [
  "Bava",
  "Balava",
  "Kaulava",
  "Taitila",
  "Garaja",
  "Vanija",
  "Vishti",
  "Kimstughna",
  "Shakuni",
  "Chatushpada",
  "Naga",
];

const sections: [string, Row[]][] = [
  [
    "UI strings",
    Object.keys(en).map((k) => [
      k,
      en[k as keyof typeof en],
      gu[k as keyof typeof en],
    ]),
  ],
  [
    "Months (Gujarati year order)",
    MONTHS.map((m) => [
      `month.${m}`,
      names.monthName(m, "en"),
      names.monthName(m, "gu"),
    ]),
  ],
  [
    "Tithis",
    range(30).map((n) => [
      `tithi.${n}`,
      names.tithiLabel(n, "en"),
      names.tithiLabel(n, "gu"),
    ]),
  ],
  [
    "Nakshatras",
    range(27).map((n) => [
      `nakshatra.${n}`,
      names.nakshatraName(n, "en"),
      names.nakshatraName(n, "gu"),
    ]),
  ],
  [
    "Yogas",
    range(27).map((n) => [
      `yoga.${n}`,
      names.yogaName(n, "en"),
      names.yogaName(n, "gu"),
    ]),
  ],
  [
    "Karanas",
    KARANAS.map((k) => [`karana.${k}`, k, names.karanaDisplay(k, "gu")]),
  ],
  [
    "Choghadiya",
    ["Amrut", "Shubh", "Labh", "Char", "Udveg", "Kaal", "Rog"].map((c) => [
      `choghadiya.${c}`,
      c,
      names.choghadiyaName(c, "gu"),
    ]),
  ],
  [
    "Weekdays",
    range(7).map((n) => [
      `vara.${n - 1}`,
      names.weekdayName(n - 1, "en"),
      names.weekdayName(n - 1, "gu"),
    ]),
  ],
  [
    "Festivals",
    FESTIVALS.map((f) => [
      `festival.${f.id}`,
      f.names.en + (f.variant ? ` (${f.variant.label.en})` : ""),
      f.names.gu + (f.variant ? ` (${f.variant.label.gu})` : ""),
    ]),
  ],
  [
    "Festival short names (Month grid cells)",
    FESTIVALS.map((f) => [
      `festivalShort.${f.id}`,
      names.festivalShortName(f.id, "en") ?? "",
      names.festivalShortName(f.id, "gu") ?? "",
    ]),
  ],
];

const doc = `# Gujarati strings: native review checklist

**Every Gujarati string is a draft** until a native reader ticks it here. Mark a row \`[x]\` when it reads naturally to an older Gujarati reader, or write the better wording beside it and leave it unticked. Generated from \`packages/i18n\` and the festival table by \`apps/app/src/gu-review.test.ts\`; regenerating keeps ticks.

## Open questions for the reviewer (brief §9)

- [ ] **Digits:** Gujarati digits everywhere in Gujarati mode (૧૧, ૨:૪૭). Keep, or Latin digits (11, 2:47)?
- [ ] **Clock:** 12-hour, with the time-of-day word after the time as the browser writes it: "૨:૪૭ બપોરે". Would "બપોરે ૨:૪૭" read better? Are સવારે / બપોરે / સાંજે / રાત્રે the right words and boundaries?
- [ ] **Dates:** "ગુરુ, ૨૨ ઑક્ટો" and "ગુરુવાર, ૨૨ ઑક્ટોબર, ૨૦૨૬" (the browser's Gujarati month names).
- [ ] **Palette names:** શાંત / મંદિર / રાત; does "મંદિર" read as sect-specific?
- [ ] **Tone:** warm, plain and respectful, like a helpful family member; no fear words around Rahu Kaal.
- [ ] **Month-grid markers:** "૨×" (two-day tithi) and "છૂટી" (skipped tithi).
- [ ] **Event kinds:** વરસી / શ્રાદ્ધ, લગ્નતિથિ, જન્મદિવસ (તિથિ મુજબ).

${sections.map(([title, rows]) => table(`${title} (${rows.length})`, rows)).join("\n")}`;

it("lists every Gujarati string for native review", () => {
  if (process.env.GU_REVIEW_WRITE) writeFileSync(FILE, doc);
  const current = existsSync(FILE) ? readFileSync(FILE, "utf8") : "";
  const missing = sections
    .flatMap(([, rows]) => rows)
    .filter(([k]) => !current.includes(`\`${k}\``))
    .map(([k]) => k);
  expect(missing, "run with GU_REVIEW_WRITE=1 to add them").toEqual([]);
});
