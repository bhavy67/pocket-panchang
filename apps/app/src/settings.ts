// Settings (§6): a Zustand store hydrated from Dexie at boot and written back on change.
import {
  parseLocationId,
  type EventKind,
  type Lang,
  type Location,
  type OccurrencePolicy,
  type PolicyOverrides,
} from "@panchang/calendar";
import { isParseError, type ParseError } from "@panchang/engine";
import { create } from "zustand";
import { db } from "@/db";

/** Palettes (ADR 0025); each has light and dark. Kagaz and Mandir were removed 2026-10-27
 * (Bhavy: a palette that's also a different layout kept reflowing and ghosting on switch);
 * `parsePalette` below remaps anyone's already-saved choice to Calm. */
export const PALETTES = ["calm", "raat", "utsav", "shunya"] as const;
export type Palette = (typeof PALETTES)[number];
const RETIRED_PALETTES = new Set(["kagaz", "mandir"]);

export type Settings = {
  readonly location: Location;
  readonly tradition: "amanta" | "purnimanta"; // v1: always "amanta"
  readonly samvat: "vikram-kartikadi" | "vikram-chaitradi" | "shaka";
  readonly language: Lang;
  readonly palette: Palette;
  readonly theme: "system" | "light" | "dark";
  readonly textScale: number;
  readonly householdPolicy: Partial<Record<EventKind, PolicyOverrides>>;
  readonly observanceLocation: Location;
  /** Device-local "HH:mm" when reminders fire (ADR 0007). Added in Phase 11; older rows default. */
  readonly reminderTime: string;
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
    reminderTime: "08:00",
  };
}

// ---- Parsing (ADR 0014): IndexedDB is an input boundary. ----

export const fail = (message: string): ParseError => ({
  kind: "parse-error",
  message,
});
export const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
export const oneOf = <T extends string | boolean>(
  v: unknown,
  values: readonly T[],
): v is T => values.includes(v as T);

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

export const EVENT_KINDS: readonly EventKind[] = [
  "birthday",
  "shraddh",
  "anniversary",
  "custom",
];

/** Allowed values per policy field (§4.9). */
export const POLICY_VALUES: {
  [K in keyof OccurrencePolicy]: readonly OccurrencePolicy[K][];
} = {
  window: ["sunrise", "aparahna"],
  vriddhiTithi: ["first-day", "second-day"],
  kshayaTithi: ["same-day", "following-day"],
  adhikMonth: ["nija", "adhik", "match-origin", "both"],
  pitruPaksha: [true, false],
  tithiSource: ["moment", "calendar-day"],
};

export function parsePolicyOverrides(v: unknown): PolicyOverrides | ParseError {
  if (!isObject(v)) return fail("Policy must be an object");
  const out: Record<string, unknown> = {};
  for (const [k, value] of Object.entries(v)) {
    const allowed = (POLICY_VALUES as Record<string, readonly unknown[]>)[k];
    if (!allowed) return fail(`Unknown policy field: ${k}`);
    if (value === undefined) continue;
    if (!allowed.includes(value)) return fail(`Bad value for ${k}`);
    out[k] = value;
  }
  return out;
}

export function parseSettings(v: unknown): Settings | ParseError {
  if (!isObject(v)) return fail("Settings must be an object");
  const location = parseLocation(v.location);
  if (isParseError(location)) return location;
  const observanceLocation = parseLocation(v.observanceLocation);
  if (isParseError(observanceLocation)) return observanceLocation;
  const { tradition, samvat, language, palette, theme, textScale } = v;
  const reminderTime = v.reminderTime ?? "08:00";
  if (
    typeof reminderTime !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(reminderTime)
  )
    return fail("Bad reminder time");
  if (!oneOf(tradition, ["amanta", "purnimanta"] as const))
    return fail(`Bad tradition: ${String(tradition)}`);
  if (
    !oneOf(samvat, ["vikram-kartikadi", "vikram-chaitradi", "shaka"] as const)
  )
    return fail(`Bad samvat: ${String(samvat)}`);
  if (!oneOf(language, ["gu", "en", "hi"] as const))
    return fail(`Bad language: ${String(language)}`);
  // Kagaz and Mandir are retired: a saved choice of either falls back to Calm rather than
  // failing the whole settings row (which would force onboarding again).
  const resolvedPalette =
    typeof palette === "string" && RETIRED_PALETTES.has(palette)
      ? "calm"
      : palette;
  if (!oneOf(resolvedPalette, PALETTES))
    return fail(`Bad palette: ${String(palette)}`);
  if (!oneOf(theme, ["system", "light", "dark"] as const))
    return fail(`Bad theme: ${String(theme)}`);
  if (typeof textScale !== "number" || !(textScale >= 0.5 && textScale <= 3))
    return fail(`Bad text scale: ${String(textScale)}`);
  const policy: Partial<Record<EventKind, PolicyOverrides>> = {};
  if (!isObject(v.householdPolicy)) return fail("Bad household policy");
  for (const [k, p] of Object.entries(v.householdPolicy)) {
    if (!oneOf(k, EVENT_KINDS)) return fail(`Bad event kind in policy: ${k}`);
    const parsed = parsePolicyOverrides(p);
    if (isParseError(parsed)) return parsed;
    policy[k] = parsed;
  }
  return {
    location,
    tradition,
    samvat,
    language,
    palette: resolvedPalette,
    theme,
    // Larger/Largest (1.5, 2) were removed: older saves and backups fall back to Large.
    textScale: Math.min(textScale, 1.25),
    householdPolicy: policy,
    observanceLocation,
    reminderTime,
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
