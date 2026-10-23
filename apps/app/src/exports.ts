// One-tap exports (brief §6 durability): JSON backup and .ics, via the SharePort.
import type { CivilDate, Instant } from "@panchang/engine";
import { buildBackup } from "@/backup";
import type { StoredEvent } from "@/db";
import { householdOf, markBackedUp } from "@/events-data";
import { clockFor } from "@/lib/clock";
import { platformPorts } from "@/ports";
import type { Settings } from "@/settings";
import { worker } from "@/worker/client";

export async function exportBackup(
  s: Settings,
  events: readonly StoredEvent[],
) {
  const now = Date.now();
  const json = JSON.stringify(buildBackup(s, events, now), null, 2);
  const day = clockFor(s.location.tz).localDate(now as Instant);
  await (
    await platformPorts()
  ).share.shareFile(
    `panchang-backup-${day}.json`,
    new Blob([json], { type: "application/json" }),
  );
  await markBackedUp(now);
}

export async function exportIcs(
  s: Settings,
  events: readonly StoredEvent[],
  from: CivilDate,
  to: CivilDate,
) {
  const ics = await worker.ics(
    events,
    householdOf(s),
    from,
    to,
    Date.now() as Instant,
  );
  await (
    await platformPorts()
  ).share.shareFile(
    "family-dates.ics",
    new Blob([ics], { type: "text/calendar" }),
  );
}
