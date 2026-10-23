// JSON backup (§6): `{ schemaVersion, exportedAt, settings, events }`. The month cache is never
// exported. Import is an input boundary (ADR 0014): every field is parsed, nothing trusted.
import {
  isParseError,
  LUNAR_MONTHS,
  parseCivilDate,
  type ParseError,
} from "@panchang/engine";
import type { StoredEvent } from "@/db";
import {
  EVENT_KINDS,
  fail,
  isObject,
  oneOf,
  parseLocation,
  parsePolicyOverrides,
  parseSettings,
  type Settings,
} from "@/settings";

/** Bump with every backup-format change; parse older versions forward, refuse newer ones. */
export const BACKUP_SCHEMA_VERSION = 1;

export type Backup = {
  readonly schemaVersion: number;
  readonly exportedAt: number;
  readonly settings: Settings;
  readonly events: readonly StoredEvent[];
};

export const buildBackup = (
  settings: Settings,
  events: readonly StoredEvent[],
  exportedAt: number,
): Backup => ({
  schemaVersion: BACKUP_SCHEMA_VERSION,
  exportedAt,
  settings,
  events,
});

export function parseEvent(v: unknown): StoredEvent | ParseError {
  if (!isObject(v)) return fail("Event must be an object");
  const {
    id,
    title,
    kind,
    lunarDate,
    pitruPakshaDay,
    remindDaysBefore,
    notes,
    createdAt,
    updatedAt,
  } = v;
  if (typeof id !== "string" || !/^[\w-]{1,64}$/.test(id))
    return fail("Bad event id");
  if (typeof title !== "string" || !title.trim() || title.length > 200)
    return fail("Bad event title");
  if (!oneOf(kind, EVENT_KINDS)) return fail(`Bad event kind: ${String(kind)}`);
  if (!isObject(lunarDate)) return fail("Bad lunar date");
  const { month, adhik, paksha, tithi } = lunarDate;
  if (!oneOf(month, LUNAR_MONTHS)) return fail(`Bad month: ${String(month)}`);
  if (adhik !== undefined && typeof adhik !== "boolean")
    return fail("Bad adhik flag");
  if (!oneOf(paksha, ["shukla", "krishna"] as const)) return fail("Bad paksha");
  if (
    typeof tithi !== "number" ||
    !Number.isInteger(tithi) ||
    tithi < 1 ||
    tithi > 15
  )
    return fail("Bad tithi");
  const policyOverrides = parsePolicyOverrides(v.policyOverrides ?? {});
  if (isParseError(policyOverrides)) return policyOverrides;
  if (
    pitruPakshaDay !== undefined &&
    !oneOf(pitruPakshaDay, ["same-tithi", "bhadrapada-purnima"] as const) &&
    !(
      typeof pitruPakshaDay === "number" &&
      Number.isInteger(pitruPakshaDay) &&
      pitruPakshaDay >= 1 &&
      pitruPakshaDay <= 15
    )
  )
    return fail("Bad Pitru Paksha day");
  if (
    !Array.isArray(remindDaysBefore) ||
    !remindDaysBefore.every((n) => Number.isInteger(n) && n >= 0 && n <= 30)
  )
    return fail("Bad reminders");
  if (notes !== undefined && (typeof notes !== "string" || notes.length > 5000))
    return fail("Bad notes");
  if (typeof createdAt !== "number" || typeof updatedAt !== "number")
    return fail("Bad timestamps");
  const observanceLocation =
    v.observanceLocation === undefined
      ? undefined
      : parseLocation(v.observanceLocation);
  if (isParseError(observanceLocation)) return observanceLocation;
  let origin: StoredEvent["origin"];
  if (v.origin !== undefined) {
    if (!isObject(v.origin)) return fail("Bad origin");
    const date = parseCivilDate(String(v.origin.date));
    if (isParseError(date)) return date;
    const time = v.origin.time;
    if (
      time !== undefined &&
      (typeof time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    )
      return fail("Bad origin time");
    const place = parseLocation(v.origin.place);
    if (isParseError(place)) return place;
    origin = { date, ...(time !== undefined && { time }), place };
  }
  return {
    id,
    title,
    kind,
    lunarDate: { month, ...(adhik !== undefined && { adhik }), paksha, tithi },
    policyOverrides,
    ...(pitruPakshaDay !== undefined && { pitruPakshaDay }),
    ...(observanceLocation && { observanceLocation }),
    ...(origin && { origin }),
    remindDaysBefore: remindDaysBefore as number[],
    ...(notes !== undefined && { notes }),
    createdAt,
    updatedAt,
  };
}

export function parseBackup(text: string): Backup | ParseError {
  let v: unknown;
  try {
    v = JSON.parse(text);
  } catch {
    return fail("This file is not a backup (not valid JSON).");
  }
  if (!isObject(v)) return fail("This file is not a backup.");
  const { schemaVersion, exportedAt } = v;
  if (typeof schemaVersion !== "number")
    return fail("This file is not a backup.");
  if (schemaVersion > BACKUP_SCHEMA_VERSION)
    return fail(
      "This backup was made by a newer version of the app. Please update the app first.",
    );
  if (schemaVersion < 1) return fail("Unknown backup version.");
  if (typeof exportedAt !== "number")
    return fail("Backup is missing its date.");
  const settings = parseSettings(v.settings);
  if (isParseError(settings)) return settings;
  if (!Array.isArray(v.events)) return fail("Backup has no events list.");
  const events: StoredEvent[] = [];
  for (const raw of v.events) {
    const e = parseEvent(raw);
    if (isParseError(e))
      return fail(`An event in the backup is damaged: ${e.message}`);
    events.push(e);
  }
  if (new Set(events.map((e) => e.id)).size !== events.length)
    return fail("Backup has duplicate events.");
  return { schemaVersion, exportedAt, settings, events };
}
