// Collects reference values from Drik Panchang day pages into fixtures/<city>-<year>.json.
//
//   node scripts/fetch-drik.mjs fixtures/sample-days.json [cityKey] [--cache-only]
//
// --cache-only re-extracts from .cache/drik/ and skips uncached dates (no network at all).
//
// Politeness (accuracy-fixtures skill): robots.txt allows /panchang/ (checked 2026-10-23);
// requests are ≥ 4 s apart; raw pages are cached in .cache/drik/ (gitignored) so re-runs
// never refetch. Only extracted values are committed. Existing days and source.notes in a
// fixture are kept; every day is re-extracted from the cache.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CACHE_DIR = ".cache/drik";
const DELAY_MS = 4000;
const USER_AGENT =
  "pocket-panchang-fixtures/0.1 (personal accuracy testing; https://github.com/bhavy67/pocket-panchang)";
const PAGE = (id, d) =>
  `https://www.drikpanchang.com/panchang/day-panchang.html?geoname-id=${id}&date=${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;
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
const ELEMENTS = {
  tithiEnds: "Tithi",
  nakshatraEnds: "Nakshatra",
  yogaEnds: "Yoga",
  karanaEnds: "Karana",
};

const args = process.argv.slice(2);
const cacheOnly = args.includes("--cache-only");
const [listFile, onlyCity] = args.filter((a) => !a.startsWith("--"));
if (!listFile) {
  console.error(
    "usage: node scripts/fetch-drik.mjs fixtures/sample-days.json [cityKey]",
  );
  process.exit(1);
}

let lastFetch = 0;
async function page(id, date) {
  const file = join(CACHE_DIR, `${id}-${date}.html`);
  try {
    return await readFile(file, "utf8");
  } catch {
    if (cacheOnly) return null;
    const wait = lastFetch + DELAY_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastFetch = Date.now();
    const res = await fetch(PAGE(id, date), {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) throw new Error(`${id} ${date}: HTTP ${res.status}`);
    const html = await res.text();
    // Drik answers automated traffic with a reCAPTCHA page. Respect it: abort, never cache it,
    // never retry or work around it (2026-10-23: hit after ~110 requests at 4 s spacing).
    if (/Recaptcha challenge/i.test(html)) {
      throw new Error(
        `Drik served a CAPTCHA at ${date}: stop automated fetching (see accuracy-fixtures skill)`,
      );
    }
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(file, html);
    console.error(`fetched ${id} ${date}`);
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

/** Cells of the "Panchang" card as [columnKey, valueHtml], continuation rows resolved. */
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

const infoIndex = (v) => Number(/data-element-info="[^"=]*=(\d+)/.exec(v)?.[1]);

function extract(html, date) {
  const all = text(html);
  const offset = /Timezone Offset: ([+-]\d{2}:\d{2})/.exec(all)?.[1];
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
  const ends = (column) =>
    cells
      // "upto Full Night" = continues past the next sunrise: no end this civil day.
      .filter(
        ([key, v]) =>
          key === column && /upto \d{2}:\d{2} (AM|PM)/.test(text(v)),
      )
      .map(([, v]) => {
        const local = localTime(text(v), date);
        return {
          index: infoIndex(v),
          name: text(v).split(" upto")[0],
          local,
          utc: toUtc(local, offset),
        };
      });
  const weekday = cells.find(([key]) => key === "Weekday");
  return {
    date,
    utcOffset: offset,
    sunrise: sun("Sunrise"),
    sunset: sun("Sunset"),
    /** Drik's weekday number (1 = Sunday). */
    weekday: weekday ? infoIndex(weekday[1]) : null,
    amantaMonth: /([A-Za-z]+(?: \(Adhik\))?) - Amanta/.exec(all)?.[1] ?? null,
    samvat: {
      gujarati: Number(/Gujarati Samvat (\d+)/.exec(all)?.[1]),
      vikram: Number(/Vikram Samvat (\d+)/.exec(all)?.[1]),
      shaka: Number(/Shaka Samvat (\d+)/.exec(all)?.[1]),
    },
    lahiriAyanamsha: Number(/Lahiri Ayanamsha ([\d.]+)/.exec(all)?.[1]),
    ...Object.fromEntries(
      Object.entries(ELEMENTS).map(([field, column]) => [field, ends(column)]),
    ),
  };
}

const list = JSON.parse(await readFile(listFile, "utf8"));
for (const [key, city] of Object.entries(list)) {
  if (onlyCity && key !== onlyCity) continue;
  for (const [year, picks] of Object.entries(city.years)) {
    const out = `fixtures/${key}-${year}.json`;
    const previous = await readFile(out, "utf8")
      .then(JSON.parse)
      .catch(() => null);
    const dates = [
      ...new Set([
        ...(previous?.days ?? []).map((d) => d.date),
        ...picks.map((p) => p.date),
      ]),
    ].sort();
    const reasons = Object.fromEntries(picks.map((p) => [p.date, p.reasons]));
    const days = [];
    let first;
    for (const date of dates) {
      const html = await page(city.geonameId, date);
      if (html === null) continue; // --cache-only and not cached
      first ??= text(html);
      days.push({
        ...extract(html, date),
        reasons: reasons[date] ?? ["October 2026 full month (Phase 4)"],
      });
    }
    if (days.length === 0) continue;
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
            urlTemplate: PAGE(city.geonameId, "YYYY-MM-DD").replace(
              "DD/MM/YYYY",
              "{DD}/{MM}/{YYYY}",
            ),
            retrievedAt: new Date().toISOString().slice(0, 10),
            settings: "site defaults for this location",
            sunriseDefinition:
              "upper limb with refraction, no elevation (ADR 0012)",
            precision:
              "minutes, rounded to nearest (inferred 2026-10-23 from sunrise/sunset errors)",
            ...(previous?.source?.notes
              ? { notes: previous.source.notes }
              : {}),
          },
          location: {
            name: city.name,
            geonameId: city.geonameId,
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
  }
}
