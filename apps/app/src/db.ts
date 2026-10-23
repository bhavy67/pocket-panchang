// IndexedDB via Dexie (§6 Persistence). Every schema change is a new version with a migration;
// never edit a shipped version in place, and never wipe user data (ADR 0013).
import type { Location, PersonalEvent } from "@panchang/calendar";
import type { CivilDate, NoCivilDay, PanchangDay } from "@panchang/engine";
import { Dexie, type EntityTable } from "dexie";

/** A personal event as stored (§6): the calendar's event plus display/audit fields. */
export type StoredEvent = PersonalEvent & {
  /** Display/audit only; never recomputed (ADR 0006). */
  readonly origin?: {
    readonly date: CivilDate;
    /** "HH:mm" local to `place`, in its historical zone. */
    readonly time?: string;
    readonly place: Location;
  };
  readonly notes?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
};

export type MonthDay = {
  readonly date: CivilDate;
  readonly day: PanchangDay | NoCivilDay;
};

export type CachedMonth = {
  /** `${ENGINE_VERSION}|${locationId}|${tradition}|${yyyy-mm}` (§7). */
  readonly key: string;
  readonly days: readonly MonthDay[];
  readonly computedAt: number;
};

/** Key "current": settings; key "meta": `{ lastBackupAt }`. `value` is parsed on read. */
type SettingsRow = { readonly key: string; readonly value: unknown };

export const db = new Dexie("panchang") as Dexie & {
  settings: EntityTable<SettingsRow, "key">;
  events: EntityTable<StoredEvent, "id">;
  monthCache: EntityTable<CachedMonth, "key">;
};

db.version(1).stores({
  settings: "key",
  events: "id, kind",
  monthCache: "key",
});
