// Family dates, "Quiet Sky" (ADR 0024): the next date as a bold accent card, then later dates
// with initial avatars (a flame for varsi), the family conventions in one sentence, backup
// nudge and the .ics export.
import { addDays, type CivilDate } from "@panchang/engine";
import { monthName, tithiLabel } from "@panchang/i18n";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useNow } from "@/day-data";
import {
  metaQuery,
  useEvents,
  useOccurrenceRows,
  type UpcomingRow,
} from "@/events-data";
import { exportBackup, exportIcs } from "@/exports";
import { lang, t } from "@/i18n";
import { clockFor } from "@/lib/clock";
import { dateShort, daysBetween } from "@/lib/format";
import { FIELDS, inherited, lunarLabel } from "@/policy";
import { useSettings, type Settings } from "@/settings";
import { Countdown, FamilyGlyph } from "@/today";
import { btnOutline, Section } from "@/ui";

export const btnPrimary =
  "flex min-h-(--tap-min) items-center justify-center rounded-full bg-accent px-5 text-body font-strong text-text-on-accent focus-ring";

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
  const [next, ...later] = rows ?? [];

  return (
    <main className="mx-auto flex max-w-180 flex-col gap-6 px-4 pt-4 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline leading-(--leading-heading) font-display font-heading tracking-display">
          {t("familyDates")}
        </h1>
        <Link to="/events/$id" params={{ id: "new" }} className={btnPrimary}>
          + {t("add")}
        </Link>
      </header>

      {nudge && (
        <div
          role="note"
          className="flex flex-col gap-3 rounded-card bg-warning-subtle p-4"
        >
          <p className="text-body">
            <strong className="font-strong">{t("nudgeTitle")}</strong>{" "}
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
        <div className="card flex flex-col gap-3 px-card py-5">
          <p className="text-lg font-strong">{t("noDatesTitle")}</p>
          <p className="text-body text-text-muted">{t("noDatesBody")}</p>
        </div>
      ) : !rows ? (
        <div
          aria-hidden="true"
          className="h-48 animate-pulse rounded-card bg-card-bg motion-reduce:animate-none"
        />
      ) : (
        <>
          {next && <NextCard r={next} rows={rows} today={today} s={s} />}
          {later.length > 0 && (
            <section aria-labelledby="later" className="flex flex-col gap-2">
              <h2
                id="later"
                className="text-title font-display font-heading tracking-display"
              >
                {t("later")}
              </h2>
              <ul className="card flex flex-col divide-y divide-border">
                {later.map((r) => (
                  <li key={`${r.event.id}|${r.date}`}>
                    <LaterRow r={r} today={today} s={s} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {!!events?.length && <Conventions s={s} />}

      {!!events?.length && (
        <Section title={t("addToCalendar")} sub={t("addToCalendarSub")} flush>
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
      <p aria-live="polite" className="text-sm text-text-muted">
        {status}
      </p>
    </main>
  );
}

const occurrenceLabel = (r: UpcomingRow) =>
  r.occurrences.some((o) => o.kind === "pitru-paksha")
    ? t("pitruPaksha")
    : r.occurrences.some((o) => o.month === "adhik")
      ? t("extraMonth")
      : null;

const guLunar = (d: UpcomingRow["event"]["lunarDate"]) =>
  `${monthName(d.month, "gu", d.adhik)} ${tithiLabel(d.paksha === "shukla" ? d.tithi : d.tithi + 15, "gu")}`;

/** The next family date: bold accent card with this year's date, Pitru Paksha and reminder. */
function NextCard({
  r,
  rows,
  today,
  s,
}: {
  r: UpcomingRow;
  rows: readonly UpcomingRow[];
  today: CivilDate;
  s: Settings;
}) {
  const e = r.event;
  const pitru = rows.find(
    (x) =>
      x.event.id === e.id &&
      x.occurrences.some((o) => o.kind === "pitru-paksha") &&
      x !== r,
  );
  const when = { time: reminderTimeLabel(s) };
  const reminder =
    e.remindDaysBefore.includes(0) && e.remindDaysBefore.includes(1)
      ? t("reminderBoth", when)
      : e.remindDaysBefore.includes(0)
        ? t("reminderDay", when)
        : e.remindDaysBefore.includes(1)
          ? t("reminderBefore", when)
          : t("reminderNone");
  const city = r.occurrences[0]!.observance;
  const facts: [string, string][] = [
    [
      t("thisYear"),
      `${dateShort(r.date)}${city.id !== s.location.id ? t("inCity", { city: city.name }) : ""}`,
    ],
    ...(pitru
      ? [[t("pitruShraddh"), dateShort(pitru.date)] as [string, string]]
      : []),
    [t("reminder"), reminder],
  ];
  return (
    <section aria-labelledby="next-date">
      <Link
        to="/events/$id"
        params={{ id: e.id }}
        className="flex flex-col gap-4 rounded-card bg-accent p-5 text-text-on-accent focus-ring"
      >
        <span className="flex flex-wrap items-start justify-between gap-3">
          <span className="flex min-w-0 grow basis-[10rem] flex-col">
            <span className="text-[length:var(--text-micro)] font-strong tracking-wider uppercase">
              {t("next")}
              {occurrenceLabel(r) && ` · ${occurrenceLabel(r)}`}
            </span>
            <span
              id="next-date"
              className="text-title leading-tight font-display font-heading tracking-display"
            >
              {e.title}
            </span>
            <span className="text-body">
              {lunarLabel(e.lunarDate)}
              {lang() === "en" && (
                <>
                  {" · "}
                  <span lang="gu">{guLunar(e.lunarDate)}</span>
                </>
              )}
            </span>
          </span>
          <span className="flex-none rounded-full bg-surface px-3 py-1 text-accent">
            <Countdown n={daysBetween(today, r.date)} />
          </span>
        </span>
        <dl className="flex flex-col divide-y divide-text-on-accent/25 border-t border-text-on-accent/25">
          {facts.map(([k, v]) => (
            <div
              key={k}
              className="flex flex-wrap justify-between gap-x-3 py-2"
            >
              <dt className="text-sm">{k}</dt>
              <dd className="text-sm font-strong">{v}</dd>
            </div>
          ))}
        </dl>
      </Link>
    </section>
  );
}

const reminderTimeLabel = (s: Settings) => {
  const [h, m] = s.reminderTime.split(":").map(Number) as [number, number];
  return new Intl.DateTimeFormat(lang() === "gu" ? "gu-u-nu-gujr" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    ...(lang() === "gu" ? { dayPeriod: "short" as const } : {}),
  }).format(Date.UTC(2026, 0, 1, h, m));
};

function LaterRow({
  r,
  today,
  s,
}: {
  r: UpcomingRow;
  today: CivilDate;
  s: Settings;
}) {
  const city = r.occurrences[0]!.observance;
  const label = occurrenceLabel(r);
  return (
    <Link
      to="/events/$id"
      params={{ id: r.event.id }}
      className="flex min-h-16 flex-wrap items-center gap-3 px-card py-3 hover:bg-surface-sunken focus-ring"
    >
      <span
        aria-hidden="true"
        className="flex size-10 flex-none items-center justify-center rounded-full bg-accent-subtle font-display font-heading tracking-display text-accent"
      >
        {r.event.kind === "shraddh" ? (
          <FamilyGlyph kind="shraddh" />
        ) : (
          [...r.event.title.trim()][0]?.toUpperCase()
        )}
      </span>
      <span className="flex min-w-0 grow basis-[10rem] flex-col">
        <span className="font-strong">
          {r.event.title}
          {label && (
            <span className="font-label text-text-muted"> · {label}</span>
          )}
        </span>
        <span className="text-sm text-text-muted">
          {lunarLabel(r.event.lunarDate)} · {dateShort(r.date)}
          {city.id !== s.location.id && t("inCity", { city: city.name })}
        </span>
      </span>
      <Countdown n={daysBetween(today, r.date)} />
    </Link>
  );
}

/** Family conventions in one plain sentence (Settings → Family conventions). */
function Conventions({ s }: { s: Settings }) {
  const option = (
    kind: "shraddh" | "birthday",
    field: "window" | "vriddhiTithi",
  ) => {
    const f = FIELDS.find((x) => x.field === field)!;
    return t(f.options[String(inherited(s, kind, field).value)]!);
  };
  return (
    <section
      aria-labelledby="keeps"
      className="flex flex-col gap-2 rounded-card bg-surface-sunken p-5"
    >
      <h2
        id="keeps"
        className="text-lg font-display font-heading tracking-display"
      >
        {t("familyKeeps")}
      </h2>
      <p className="text-body">
        {t("familyKeepsSummary", {
          varsi: option("shraddh", "window"),
          birthday: option("birthday", "window"),
          vriddhi: option("birthday", "vriddhiTithi"),
        })}
      </p>
      <Link
        to="/settings"
        hash="conventions"
        className="self-start font-strong text-accent focus-ring"
      >
        {t("change")}
      </Link>
    </section>
  );
}
