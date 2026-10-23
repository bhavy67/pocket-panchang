// Settings (§6): a Zustand store hydrated from Dexie at boot and written back on change.
import {
  parseLocationId,
  type EventKind,
  type Lang,
  type Location,
  type PolicyOverrides,
} from "@panchang/calendar";
import { isParseError, type ParseError } from "@panchang/engine";
import { create } from "zustand";
import { db } from "@/db";

export type Settings = {
  readonly location: Location;
  readonly tradition: "amanta" | "purnimanta"; // v1: always "amanta"
  readonly samvat: "vikram-kartikadi" | "vikram-chaitradi" | "shaka";
  readonly language: Lang;
  readonly palette: "calm" | "mandir" | "raat";
  readonly theme: "system" | "light" | "dark";
  readonly textScale: number;
  readonly householdPolicy: Partial<Record<EventKind, PolicyOverrides>>;
  readonly observanceLocation: Location;
};

/** GeoNames 1279233; the onboarding "Skip" city. */
export const AHMEDABAD = {
  id: "1279233",
  name: "Ahmedabad",
  lat: 23.0258,
  lng: 72.5873,
  tz: "Asia/Kolkata",
  country: "IN",
} as Location;

export function defaultSettings(location: Location, language: Lang): Settings {
  return {
    location,
    tradition: "amanta",
    samvat: "vikram-kartikadi",
    language,
    palette: "calm",
    theme: "system",
    textScale: 1,
    householdPolicy: {},
    observanceLocation: location, // ADR 0007: set at onboarding
  };
}

// ---- Parsing (ADR 0014): IndexedDB is an input boundary. ----

const fail = (message: string): ParseError => ({
  kind: "parse-error",
  message,
});
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const oneOf = <T extends string>(v: unknown, values: readonly T[]): v is T =>
  values.includes(v as T);

export function parseLocation(v: unknown): Location | ParseError {
  if (!isObject(v)) return fail("Location must be an object");
  const { id, name, lat, lng, tz, country } = v;
  const parsedId = parseLocationId(String(id));
  if (isParseError(parsedId)) return parsedId;
  if (typeof name !== "string" || !name) return fail("Location needs a name");
  if (typeof lat !== "number" || !(Math.abs(lat) <= 90))
    return fail(`Bad latitude: ${String(lat)}`);
  if (typeof lng !== "number" || !(Math.abs(lng) <= 180))
    return fail(`Bad longitude: ${String(lng)}`);
  if (typeof tz !== "string" || !isTimeZone(tz))
    return fail(`Unknown time zone: ${String(tz)}`);
  if (typeof country !== "string" || !/^[A-Z]{2}$/.test(country))
    return fail(`Bad country code: ${String(country)}`);
  return { id: parsedId, name, lat, lng, tz, country };
}

function isTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const EVENT_KINDS: readonly EventKind[] = [
  "birthday",
  "shraddh",
  "anniversary",
  "custom",
];

export function parseSettings(v: unknown): Settings | ParseError {
  if (!isObject(v)) return fail("Settings must be an object");
  const location = parseLocation(v.location);
  if (isParseError(location)) return location;
  const observanceLocation = parseLocation(v.observanceLocation);
  if (isParseError(observanceLocation)) return observanceLocation;
  const { tradition, samvat, language, palette, theme, textScale } = v;
  if (!oneOf(tradition, ["amanta", "purnimanta"] as const))
    return fail(`Bad tradition: ${String(tradition)}`);
  if (
    !oneOf(samvat, ["vikram-kartikadi", "vikram-chaitradi", "shaka"] as const)
  )
    return fail(`Bad samvat: ${String(samvat)}`);
  if (!oneOf(language, ["gu", "en", "hi"] as const))
    return fail(`Bad language: ${String(language)}`);
  if (!oneOf(palette, ["calm", "mandir", "raat"] as const))
    return fail(`Bad palette: ${String(palette)}`);
  if (!oneOf(theme, ["system", "light", "dark"] as const))
    return fail(`Bad theme: ${String(theme)}`);
  if (typeof textScale !== "number" || !(textScale >= 0.5 && textScale <= 3))
    return fail(`Bad text scale: ${String(textScale)}`);
  const policy = v.householdPolicy;
  // ponytail: kind-level shape only; per-field policy parsing lands with the Phase 9 editor.
  if (
    !isObject(policy) ||
    !Object.entries(policy).every(
      ([k, p]) => oneOf(k, EVENT_KINDS) && isObject(p),
    )
  )
    return fail("Bad household policy");
  return {
    location,
    tradition,
    samvat,
    language,
    palette,
    theme,
    textScale,
    householdPolicy: policy,
    observanceLocation,
  };
}

// ---- Store ----

/** `null` until onboarding completes. */
export const useSettings = create<{ settings: Settings | null }>(() => ({
  settings: null,
}));

export const saveSettings = (settings: Settings) =>
  useSettings.setState({ settings });

const ROW = "current";

/** Reads settings from IndexedDB into the store; unreadable settings re-run onboarding. */
export async function hydrateSettings(): Promise<Settings | null> {
  const row = await db.settings.get(ROW);
  const parsed = row ? parseSettings(row.value) : null;
  const settings = isParseError(parsed) ? null : parsed;
  if (isParseError(parsed)) console.error("Ignoring stored settings:", parsed);
  useSettings.setState({ settings });
  return settings;
}

/** Writes every settings change to IndexedDB. Returns the unsubscribe function. */
export function persistSettings(): () => void {
  return useSettings.subscribe(({ settings }, prev) => {
    if (settings && settings !== prev.settings)
      db.settings
        .put({ key: ROW, value: settings })
        .catch((e: unknown) => console.error("Saving settings failed:", e));
  });
}
