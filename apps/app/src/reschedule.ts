// Rolling reminder window (§5.5, Phase 11): ~12 months of notifications, rebuilt on app open,
// on resume, and after any change to events, family conventions, observance city, reminder
// time or language. A no-op on the web (ReminderPort "none").
import { addDays, type Instant } from "@panchang/engine";
import { tithiLabel, monthName } from "@panchang/i18n";
import { db } from "@/db";
import { lang, t } from "@/i18n";
import { clockFor } from "@/lib/clock";
import { upcomingReminders, type Reminder } from "@/lib/reminders";
import { isNative, platformPorts, type ReminderNotice } from "@/ports";
import { useSettings, type Settings } from "@/settings";
import type { StoredEvent } from "@/db";
import { worker } from "@/worker/client";

const deviceTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

function notice(r: Reminder, e: StoredEvent, s: Settings): ReminderNotice {
  const d = e.lunarDate;
  const lunar = `${monthName(d.month, lang(), d.adhik)} ${tithiLabel(d.paksha === "shukla" ? d.tithi : d.tithi + 15, lang())}`;
  const when =
    r.daysBefore === 0
      ? t("remindToday")
      : r.daysBefore === 1
        ? t("remindTomorrow")
        : t("remindInDays", { n: r.daysBefore });
  const o = r.occurrence;
  const parts = [
    when,
    lunar,
    o.kind === "pitru-paksha" ? t("pitruPaksha") : null,
    o.observance.id !== s.location.id ? o.observance.name : null,
  ].filter(Boolean);
  return { ...r, title: e.title, body: parts.join(" · ") };
}

let running: Promise<void> = Promise.resolve();

/** Rebuilds every scheduled reminder. Serialised: overlapping calls run one after another. */
export function rescheduleReminders(): Promise<void> {
  if (!isNative()) return Promise.resolve();
  running = running
    .then(run)
    .catch((e: unknown) => console.error("Rescheduling reminders failed:", e));
  return running;
}

async function run() {
  const s = useSettings.getState().settings;
  if (!s) return;
  const { reminders } = await platformPorts();
  const events = await db.events.toArray();
  if (!events.length) return reminders.cancelAll();
  const now = Date.now() as Instant;
  const tz = deviceTz();
  // From yesterday: a device east of the observance city can owe a reminder for "tomorrow" today.
  const from = addDays(clockFor(tz).localDate(now), -1);
  const occurrences = await worker.occurrences(
    events,
    {
      householdPolicy: s.householdPolicy,
      observanceLocation: s.observanceLocation,
      location: s.location,
    },
    from,
    addDays(from, 366),
  );
  const byId = new Map(events.map((e) => [e.id, e]));
  const due = upcomingReminders(
    occurrences,
    (id) => byId.get(id)?.remindDaysBefore ?? [],
    s.reminderTime,
    tz,
    now,
  );
  await reminders.schedule(due.map((r) => notice(r, byId.get(r.eventId)!, s)));
}
