// IndexedDB via Dexie (§6 Persistence). Every schema change is a new version with a migration;
// never edit a shipped version in place, and never wipe user data (ADR 0013).
import type { PersonalEvent } from "@panchang/calendar";
import type { CivilDate, NoCivilDay, PanchangDay } from "@panchang/engine";
import { Dexie, type EntityTable } from "dexie";

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

/** One row, key "current"; `value` is parsed on read (settings.ts). */
type SettingsRow = { readonly key: string; readonly value: unknown };

export const db = new Dexie("panchang") as Dexie & {
  settings: EntityTable<SettingsRow, "key">;
  events: EntityTable<PersonalEvent, "id">;
  monthCache: EntityTable<CachedMonth, "key">;
};

db.version(1).stores({
  settings: "key",
  events: "id, kind",
  monthCache: "key",
});
