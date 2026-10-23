// Collects reference values from Drik Panchang day pages into a fixture file.
//
//   node scripts/fetch-drik.mjs <geonameId> <name> <from YYYY-MM-DD> <to YYYY-MM-DD> <out.json>
//
// Politeness (Phase 4 rules): robots.txt allows /panchang/ (checked 2026-10-23); requests
// are at least 4 s apart; raw pages are cached in .cache/drik/ (gitignored) so a re-run
// never refetches. Only extracted values are written to the fixture.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CACHE_DIR = ".cache/drik";
const DELAY_MS = 4000;
const USER_AGENT =
  "pocket-panchang-fixtures/0.1 (personal accuracy testing; https://github.com/bhavy67/pocket-panchang)";
const PAGE = (id, d) =>
  `https://www.drikpanchang.com/panchang/day-panchang.html?geoname-id=${id}&date=${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;

const TITHI_NAMES = [
  "pratipada",
  "dwitiya",
  "tritiya",
  "chaturthi",
  "panchami",
  "shashthi",
  "saptami",
  "ashtami",
  "navami",
  "dashami",
  "ekadashi",
  "dwadashi",
  "trayodashi",
  "chaturdashi",
];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const [id, name, from, to, out] = process.argv.slice(2);
if (!out) {
  console.error(
    "usage: node scripts/fetch-drik.mjs <geonameId> <name> <from> <to> <out.json>",
  );
  process.exit(1);
}

let lastFetch = 0;
async function page(date) {
  const file = join(CACHE_DIR, `${id}-${date}.html`);
  try {
    return await readFile(file, "utf8");
  } catch {
    const wait = lastFetch + DELAY_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastFetch = Date.now();
    const res = await fetch(PAGE(id, date), {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) throw new Error(`${date}: HTTP ${res.status}`);
    const html = await res.text();
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(file, html);
    console.error(`fetched ${date}`);
    return html;
  }
}

const text = (s) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, " ")
    .trim();

/** Rows of the "Panchang" card as [key, valueHtml] per column, continuations resolved. */
function panchangCells(html) {
  const start = html.indexOf('<h3 class="dpTableCardTitle">Panchang</h3>');
  const card = html.slice(start, html.indexOf("dpTableCardTitle", start + 50));
  const current = ["", ""];
  const cells = [];
  for (const row of card.split('<div class="dpTableRow">').slice(1)) {
    const pairs = [
      ...row.matchAll(
        /dpTableKey">(.*?)<\/div><div class="dpTableCell dpTableValue">(.*?)(?=<div class="dpTableCell dpTableKey"|$)/gs,
      ),
    ];
    pairs.forEach((m, col) => {
      const key = text(m[1]);
      if (key) current[col] = key;
      cells.push([current[col], m[2]]);
    });
  }
  return cells;
}

/** "02:47 PM" (+ optional ", Oct 23") on page date `date` → local "YYYY-MM-DD HH:mm". */
function localTime(valueText, date) {
  const m = /(\d{2}):(\d{2}) (AM|PM)(?: , (\w{3}) (\d{1,2}))?/.exec(valueText);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3] === "PM") h += 12;
  let day = date;
  if (m[4]) {
    const year =
      Number(date.slice(0, 4)) +
      (m[4] === "Jan" && date.slice(5, 7) === "12" ? 1 : 0);
    day = `${year}-${String(MONTHS.indexOf(m[4]) + 1).padStart(2, "0")}-${m[5].padStart(2, "0")}`;
  }
  return `${day} ${String(h).padStart(2, "0")}:${m[2]}`;
}

function toUtc(local, offset) {
  const sign = offset[0] === "-" ? -1 : 1;
  const [oh, om] = offset.slice(1).split(":").map(Number);
  const ms =
    Date.parse(`${local.replace(" ", "T")}:00Z`) -
    sign * (oh * 60 + om) * 60_000;
  return new Date(ms).toISOString().replace(".000Z", "Z");
}

function tithiNumber(href) {
  const m = /\/tithi\/daily\/(shukla|krishna)?-?([a-z]+)-date-time/.exec(href);
  if (!m) throw new Error(`unknown tithi link ${href}`);
  if (m[2] === "purnima") return 15;
  if (m[2] === "amavasya") return 30;
  const i = TITHI_NAMES.indexOf(m[2]);
  if (i < 0) throw new Error(`unknown tithi ${m[2]}`);
  return (m[1] === "krishna" ? 15 : 0) + i + 1;
}

function extract(html, date) {
  const offset = /Timezone Offset: ([+-]\d{2}:\d{2})/.exec(text(html))?.[1];
  if (!offset) throw new Error(`${date}: no timezone offset on page`);
  const cells = panchangCells(html);
  const sun = (label) => {
    const m = new RegExp(
      `dpTableKey">(?:<a[^>]*>)?${label}(?:</a>)?</div><div class="dpTableCell dpTableValue">(.*?)<div`,
      "s",
    ).exec(html);
    const local = m && localTime(text(m[1]), date);
    if (!local) throw new Error(`${date}: no ${label}`);
    return { local, utc: toUtc(local, offset) };
  };
  const tithiEnds = cells
    // "upto Full Night" means the tithi continues past the next sunrise: no end this day.
    .filter(
      ([key, v]) => key === "Tithi" && /upto \d{2}:\d{2} (AM|PM)/.test(text(v)),
    )
    .map(([, v]) => {
      const local = localTime(text(v), date);
      return {
        tithi: tithiNumber(/href="([^"]+)"/.exec(v)[1]),
        name: text(v).split(" upto")[0],
        local,
        utc: toUtc(local, offset),
      };
    });
  return {
    date,
    utcOffset: offset,
    sunrise: sun("Sunrise"),
    sunset: sun("Sunset"),
    tithiEnds,
  };
}

const days = [];
let first;
for (
  let t = Date.parse(`${from}T00:00:00Z`);
  t <= Date.parse(`${to}T00:00:00Z`);
  t += 86_400_000
) {
  const date = new Date(t).toISOString().slice(0, 10);
  const html = await page(date);
  first ??= text(html);
  days.push(extract(html, date));
}

const dms = (label) => {
  const m = new RegExp(`${label}: (\\d+)° (\\d+)′ (\\d+)″ ([NSEW])`).exec(
    first,
  );
  const v = Number(m[1]) + Number(m[2]) / 60 + Number(m[3]) / 3600;
  return {
    value: Math.round((m[4] === "S" || m[4] === "W" ? -v : v) * 1e6) / 1e6,
    text: m[0],
  };
};
const lat = dms("Latitude");
const lng = dms("Longitude");

await writeFile(
  out,
  JSON.stringify(
    {
      source: {
        name: "Drik Panchang",
        urlTemplate: PAGE(id, "YYYY-MM-DD").replace(
          "DD/MM/YYYY",
          "{DD}/{MM}/{YYYY}",
        ),
        retrievedAt: new Date().toISOString().slice(0, 10),
        settings: "site defaults for this location",
        sunriseDefinition:
          "upper limb with refraction, no elevation (stated on Drik's sunrise page; ADR 0012)",
        precision: "minutes as displayed; rounding vs truncation unknown",
      },
      location: {
        name,
        geonameId: Number(id),
        latitude: lat.value,
        longitude: lng.value,
        coordinatesAsShown: `${lat.text}, ${lng.text}`,
        tz: /Olson Timezone: ([\w/]+)/.exec(first)[1],
      },
      days,
    },
    null,
    2,
  ) + "\n",
);
console.error(`wrote ${days.length} days to ${out}`);
