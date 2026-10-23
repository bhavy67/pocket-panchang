// Personal events (§6): Dexie rows behind TanStack Query; occurrences come from the worker.
import type { Household, Occurrence } from "@panchang/calendar";
import { addDays, ENGINE_VERSION, type CivilDate } from "@panchang/engine";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { db, type StoredEvent } from "@/db";
import { queryClient } from "@/queries";
import { rescheduleReminders } from "@/reschedule";
import type { Settings } from "@/settings";
import { worker } from "@/worker/client";

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: () => db.events.toArray(),
});

export const useEvents = () => useQuery(eventsQuery).data;

const changed = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ["events"] }),
    queryClient.invalidateQueries({ queryKey: ["occurrences"] }),
    rescheduleReminders(),
  ]);

export async function saveEvent(e: StoredEvent) {
  await db.events.put(e);
  await changed();
}

export async function deleteEvent(id: string) {
  await db.events.delete(id);
  await changed();
}

/** Replaces every event (backup import). */
export async function replaceEvents(events: readonly StoredEvent[]) {
  await db.transaction("rw", db.events, async () => {
    await db.events.clear();
    await db.events.bulkPut([...events]);
  });
  await changed();
}

export const householdOf = (s: Settings): Household => ({
  householdPolicy: s.householdPolicy,
  observanceLocation: s.observanceLocation,
  location: s.location,
});

export const occurrencesQuery = (
  s: Settings,
  events: readonly StoredEvent[],
  from: CivilDate,
  to: CivilDate,
) =>
  queryOptions({
    queryKey: [
      "occurrences",
      ENGINE_VERSION,
      from,
      to,
      householdOf(s),
      events.map((e) => `${e.id}@${e.updatedAt}`),
    ],
    queryFn: () => worker.occurrences(events, householdOf(s), from, to),
  });

export type UpcomingRow = {
  readonly event: StoredEvent;
  readonly date: CivilDate;
  /** Both occurrences of one event on one day become one row with both labels (brief §3.5). */
  readonly occurrences: readonly Occurrence[];
};

/** Occurrences in [from, from + days], one row per event per day. */
export function useOccurrenceRows(
  s: Settings,
  from: CivilDate,
  days: number,
): UpcomingRow[] | undefined {
  const events = useEvents();
  const to = addDays(from, days);
  const { data } = useQuery({
    ...occurrencesQuery(s, events ?? [], from, to),
    enabled: !!events,
  });
  if (!events) return undefined;
  if (events.length === 0) return [];
  if (!data) return undefined;
  const byId = new Map(events.map((e) => [e.id, e]));
  const rows = new Map<
    string,
    { event: StoredEvent; date: CivilDate; occurrences: Occurrence[] }
  >();
  for (const o of data) {
    const event = byId.get(o.eventId);
    if (!event) continue;
    const key = `${o.eventId}|${o.date}`;
    const row = rows.get(key) ?? { event, date: o.date, occurrences: [] };
    row.occurrences.push(o);
    rows.set(key, row);
  }
  return [...rows.values()];
}

// ---- Backup bookkeeping (key "meta" in the settings table) ----

export const metaQuery = queryOptions({
  queryKey: ["meta"],
  queryFn: async () => {
    const v = (await db.settings.get("meta"))?.value;
    const at =
      typeof v === "object" && v && "lastBackupAt" in v
        ? v.lastBackupAt
        : undefined;
    return { lastBackupAt: typeof at === "number" ? at : undefined };
  },
});

export async function markBackedUp(at: number) {
  await db.settings.put({ key: "meta", value: { lastBackupAt: at } });
  await queryClient.invalidateQueries({ queryKey: ["meta"] });
}
