// Builds the offline city list (§8, ADR 0011) from GeoNames (CC-BY 4.0) into
// apps/app/public/data/cities.json.
//
//   node scripts/build-cities.mjs
//
// Scope: cities1000 for India (small Gujarat towns), cities5000 for the diaspora countries
// below. Indian cities also get alternate names (Latin: "Baroda", "Bombay"; Gujarati script). Downloads are cached in .cache/geonames/ (gitignored); unzip uses the system `unzip`.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CACHE = ".cache/geonames";
const OUT = "apps/app/public/data/cities.json";
const BASE = "https://download.geonames.org/export/dump/";
const DIASPORA = new Set(
  "US GB CA AU NZ AE KE UG TZ ZA SG MY FJ MU OM QA KW BH SA NL DE FR IT PT IE BE CH SE NO DK HK NP LK BD PK TT GY SR".split(
    " ",
  ),
);

async function download(name) {
  const path = join(CACHE, name.replaceAll("/", "-"));
  if (!existsSync(path)) {
    const res = await fetch(BASE + name);
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    await writeFile(path, new Uint8Array(await res.arrayBuffer()));
  }
  return path;
}

const unzipRows = (path, ...members) =>
  execFileSync("unzip", ["-p", path, ...members], {
    maxBuffer: 1 << 30,
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split("\t"));

await mkdir(CACHE, { recursive: true });
const c1000 = unzipRows(await download("cities1000.zip"));
const c5000 = unzipRows(await download("cities5000.zip"));
const admin1 = new Map(
  (await readFile(await download("admin1CodesASCII.txt"), "utf8"))
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split("\t"))
    .map(([code, name]) => [code, name]),
);

// GeoNames columns: 0 id, 1 name, 2 asciiname, 4 lat, 5 lng, 8 country, 10 admin1, 14 pop, 17 tz.
const picked = [
  ...c1000.filter((r) => r[8] === "IN"),
  ...c5000.filter((r) => DIASPORA.has(r[8])),
].sort((a, b) => Number(b[14]) - Number(a[14])); // population order = search rank

const tz = [...new Set(picked.map((r) => r[17]))].sort();
const admin = [
  ...new Set(picked.map((r) => admin1.get(`${r[8]}.${r[10]}`) ?? "")),
].sort();
// Indian names display in ASCII ("Nadiad", not "Nadiād"): that's how users and Drik spell them.
// Alternate names, India only. Latin: untagged or English names (other languages' exonyms
// like "Mumbajus" are noise). Gujarati: lang "gu". Codes (iata, link, wkdt, …) are skipped.
const fold = (s) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
const indian = new Map(
  picked.filter((r) => r[8] === "IN").map((r) => [r[0], r]),
);
const alternates = new Map();
for (const [, id, lang, alt] of unzipRows(
  await download("alternatenames/IN.zip"),
  "IN.txt",
)) {
  const r = indian.get(id);
  if (!r || !alt) continue;
  const latin =
    (lang === "" || lang === "en") && /^[A-Za-z][A-Za-z .'-]*$/.test(alt);
  if (!latin && lang !== "gu") continue;
  if (fold(alt) === fold(r[1]) || fold(alt) === fold(r[2])) continue;
  const names = alternates.get(id) ?? new Map();
  alternates.set(id, names.set(fold(alt), alt));
}

const rows = picked
  .map((r) => [r[8] === "IN" ? r[2] : r[1], ...r])
  .map(([name, ...r]) => [
    Number(r[0]),
    name,
    r[2] === name ? "" : r[2],
    Number(Number(r[4]).toFixed(4)),
    Number(Number(r[5]).toFixed(4)),
    r[8],
    admin.indexOf(admin1.get(`${r[8]}.${r[10]}`) ?? ""),
    tz.indexOf(r[17]),
    ...(alternates.has(r[0]) ? [[...alternates.get(r[0]).values()]] : []),
  ]);

await mkdir("apps/app/public/data", { recursive: true });
await writeFile(
  OUT,
  JSON.stringify({
    attribution: "GeoNames (geonames.org), CC-BY 4.0",
    columns: [
      "id",
      "name",
      "ascii",
      "lat",
      "lng",
      "country",
      "admin",
      "tz",
      "alt?",
    ],
    tz,
    admin,
    rows,
  }),
);
console.log(`${OUT}: ${rows.length} cities, ${tz.length} zones`);
