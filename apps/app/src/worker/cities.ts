// Offline city search over the bundled GeoNames subset (§8, built by scripts/build-cities.mjs).
import { parseLocationId, type Location } from "@panchang/calendar";
import { isParseError } from "@panchang/engine";

/** The file format of public/data/cities.json. Rows are in population order. */
export type CityFile = {
  readonly tz: readonly string[];
  readonly admin: readonly string[];
  readonly rows: readonly (readonly [
    id: number,
    name: string,
    ascii: string,
    lat: number,
    lng: number,
    country: string,
    admin: number,
    tz: number,
    alt?: readonly string[],
  ])[];
};

export type City = { readonly location: Location; readonly admin: string };

type Indexed = { readonly city: City; readonly keys: readonly string[] };

/** Lowercase, accents stripped: "Mehsāna" → "mehsana". */
export const fold = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

/** Parses the file (an input boundary, ADR 0014); malformed rows are dropped. */
export function indexCities(file: CityFile): Indexed[] {
  const out: Indexed[] = [];
  for (const [
    id,
    name,
    ascii,
    lat,
    lng,
    country,
    admin,
    tz,
    alt,
  ] of file.rows) {
    const locationId = parseLocationId(String(id));
    const zone = file.tz[tz];
    if (isParseError(locationId) || !zone) continue;
    out.push({
      city: {
        location: { id: locationId, name, lat, lng, tz: zone, country },
        admin: file.admin[admin] ?? "",
      },
      keys: [name, ascii, ...(alt ?? [])].filter(Boolean).map(fold),
    });
  }
  return out;
}

/** Name-prefix matches first, then word-prefix, then substring; each tier by population. */
export function searchCities(
  index: readonly Indexed[],
  query: string,
  limit = 20,
): City[] {
  const q = fold(query);
  if (q.length < 2) return [];
  const tiers: City[][] = [[], [], []];
  for (const { city, keys } of index) {
    const tier = keys.some((k) => k.startsWith(q))
      ? 0
      : keys.some((k) => k.includes(` ${q}`) || k.includes(`-${q}`))
        ? 1
        : keys.some((k) => k.includes(q))
          ? 2
          : -1;
    if (tier >= 0) tiers[tier]!.push(city);
    if (tiers[0]!.length >= limit) break;
  }
  return tiers.flat().slice(0, limit);
}
