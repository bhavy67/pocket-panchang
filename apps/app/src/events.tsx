// Personal events list (brief §3.5): upcoming occurrences sorted by date, backup nudge, .ics.
import { addDays, type CivilDate } from "@panchang/engine";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { exportBackup, exportIcs } from "@/exports";
import { EventRow } from "@/event-row";
import {
  metaQuery,
  useEvents,
  useOccurrenceRows,
  type UpcomingRow,
} from "@/events-data";
import { useNow } from "@/day-data";
import { t } from "@/i18n";
import { clockFor } from "@/lib/clock";
import { useSettings, type Settings } from "@/settings";
import { btnOutline, card, Section } from "@/ui";

export const btnPrimary =
  "flex min-h-(--tap-min) items-center justify-center rounded-md bg-accent px-5 text-body font-semibold text-text-on-accent focus-ring";

export function Events() {
  const s = useSettings((st) => st.settings)!;
  const today = clockFor(s.location.tz).localDate(useNow());
  const events = useEvents();
  const rows = useOccurrenceRows(s, today, 395);
  const { data: meta } = useQuery(metaQuery);
  const [status, setStatus] = useState("");
  const lastChange = Math.max(0, ...(events ?? []).map((e) => e.updatedAt));
  const nudge =
    (events?.length ?? 0) >= 3 && (meta?.lastBackupAt ?? 0) < lastChange;

  return (
    <main className="mx-auto max-w-180">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
        <h1 className="text-headline leading-(--leading-heading) font-bold">
          {t("familyDates")}
        </h1>
        <Link to="/events/$id" params={{ id: "new" }} className={btnPrimary}>
          {t("addDate")}
        </Link>
      </header>

      {nudge && (
        <div
          role="note"
          className="mx-4 mt-4 flex flex-col gap-3 rounded-md border-[1.5px] border-warning bg-warning-subtle p-4"
        >
          <p className="text-body">
            <strong className="font-semibold">{t("nudgeTitle")}</strong>{" "}
            {t("nudgeBody")}
          </p>
          <button
            type="button"
            className={btnOutline}
            onClick={() =>
              void exportBackup(s, events ?? []).then(() =>
                setStatus(t("backupSaved")),
              )
            }
          >
            {t("saveBackup")}
          </button>
        </div>
      )}

      {events?.length === 0 ? (
        <div className={`mx-4 mt-6 flex flex-col gap-3 p-5 ${card}`}>
          <p className="text-lg font-semibold">{t("noDatesTitle")}</p>
          <p className="text-body text-text-muted">{t("noDatesBody")}</p>
        </div>
      ) : (
        <Section title={t("comingUp")}>
          {rows ? (
            <UpcomingList rows={rows} today={today} s={s} />
          ) : (
            <div aria-hidden="true" className={`h-40 ${card}`} />
          )}
        </Section>
      )}

      {!!events?.length && (
        <Section title={t("addToCalendar")} sub={t("addToCalendarSub")}>
          <button
            type="button"
            className={btnOutline}
            onClick={() =>
              void exportIcs(s, events, today, addDays(today, 730)).then(() =>
                setStatus(t("icsSaved")),
              )
            }
          >
            {t("saveIcs")}
          </button>
        </Section>
      )}
      <p aria-live="polite" className="px-4 pt-3 text-sm text-text-muted">
        {status}
      </p>
    </main>
  );
}

function UpcomingList({
  rows,
  today,
  s,
}: {
  rows: readonly UpcomingRow[];
  today: CivilDate;
  s: Settings;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r) => (
        <li key={`${r.event.id}|${r.date}`}>
          <EventRow r={r} today={today} s={s} />
        </li>
      ))}
    </ul>
  );
}
