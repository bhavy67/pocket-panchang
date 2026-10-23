// Reminder instants (ADR 0007) and the rolling notification list (§5.5).
import type { Occurrence } from "@panchang/calendar";
import { addDays, type CivilDate, type Instant } from "@panchang/engine";
import { clockFor, localInstant } from "@/lib/clock";

/**
 * When a reminder "N days before" an occurrence fires (ADR 0007): at `time` device-local, on
 * the latest device-local day whose firing instant is no later than `time` in the observance
 * city on (occurrence date − N). Same zone: that day at `time`. Device west of the observance
 * city: possibly the day before. Device east: the same date, before the observance morning.
 */
export function reminderInstant(
  date: CivilDate,
  daysBefore: number,
  time: string,
  observanceTz: string,
  deviceTz: string,
): Instant {
  const deadline = localInstant(addDays(date, -daysBefore), time, observanceTz);
  let day = clockFor(deviceTz).localDate(deadline);
  for (;;) {
    const fire = localInstant(day, time, deviceTz);
    if (fire <= deadline) return fire;
    day = addDays(day, -1);
  }
}

export type Reminder = {
  /** Stable positive int32 (Android notification id). */
  readonly id: number;
  readonly at: Instant;
  readonly eventId: string;
  readonly occurrence: Occurrence;
  readonly daysBefore: number;
};

/** FNV-1a → positive int32: the same occurrence keeps its notification id across reschedules. */
export function notificationId(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++)
    h = Math.imul(h ^ key.charCodeAt(i), 0x01000193);
  return h >>> 1 || 1;
}

/**
 * Upcoming reminders, soonest first, capped (Android allows ~500 alarms per app; the window is
 * rolled forward on every app open).
 */
export function upcomingReminders(
  occurrences: readonly Occurrence[],
  remindDaysBefore: (eventId: string) => readonly number[],
  time: string,
  deviceTz: string,
  now: Instant,
  cap = 400,
): Reminder[] {
  return occurrences
    .flatMap((o) =>
      remindDaysBefore(o.eventId).map((n) => ({
        id: notificationId(
          `${o.eventId}|${o.date}|${o.kind}|${o.month ?? ""}|${n}`,
        ),
        at: reminderInstant(o.date, n, time, o.observance.tz, deviceTz),
        eventId: o.eventId,
        occurrence: o,
        daysBefore: n,
      })),
    )
    .filter((r) => r.at > now)
    .sort((a, b) => a.at - b.at)
    .slice(0, cap);
}
