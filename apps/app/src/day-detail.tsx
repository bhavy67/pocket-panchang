// Day detail (brief §3.4): full panchang for one date. Standalone at /day on phones; beside the
// month grid at ≥ 1024 px.
import { addDays, type CivilDate } from "@panchang/engine";
import { weekdayName } from "@panchang/i18n";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useDay, useFestivals, useNow } from "@/day-data";
import { lang, t } from "@/i18n";
import { clockFor } from "@/lib/clock";
import { dateLong, daysBetween, monthTitle } from "@/lib/format";
import { yearMonthOf } from "@/lib/year-month";
import {
  ElementsCard,
  howSheet,
  mismatchUrl,
  samvatLine,
  SunMoonCard,
  tithiTitle,
} from "@/panchang";
import { useSettings } from "@/settings";
import { NightChoghadiya, Timeline } from "@/timeline";
import { btnOutline, card, Section, Sheet, type SheetContent } from "@/ui";
import type { Festival } from "@/worker/api";
import { EventRow } from "@/event-row";
import { useOccurrenceRows } from "@/events-data";
import { festivalTiming } from "@/today";

export function DayDetail({
  date,
  embedded = false,
}: {
  date: CivilDate;
  embedded?: boolean;
}) {
  const s = useSettings((st) => st.settings)!;
  const view = useDay(s, date);
  const now = useNow();
  const festivals = useFestivals(s, [Number(date.slice(0, 4))]).filter(
    (f) =>
      f.date === date || (f.endDate && f.date <= date && date <= f.endDate),
  );
  const family = useOccurrenceRows(s, date, 0);
  const [sheet, setSheet] = useState<SheetContent | null>(null);
  const tz = s.location.tz;
  const isToday = clockFor(tz).localDate(now) === date;
  const title = view && tithiTitle(view.day, view.day.tithi.atSunrise);
  const dayLink = (d: CivilDate) =>
    embedded
      ? ({ to: "/month", search: { m: yearMonthOf(d), date: d } } as const)
      : ({ to: "/day", search: { date: d } } as const);

  return (
    <article aria-label={dateLong(date)} className="mx-auto max-w-180">
      <header className="flex flex-col gap-1 px-4 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {!embedded && (
            <Link
              to="/month"
              search={{ m: yearMonthOf(date), date }}
              className={`${btnOutline} px-3`}
            >
              ‹ {monthTitle(date)}
            </Link>
          )}
          <span className="ml-auto flex gap-2">
            <Link
              {...dayLink(addDays(date, -1))}
              aria-label={t("prevDay")}
              className={`${btnOutline} w-12 px-0`}
            >
              ‹
            </Link>
            <Link
              {...dayLink(addDays(date, 1))}
              aria-label={t("nextDay")}
              className={`${btnOutline} w-12 px-0`}
            >
              ›
            </Link>
          </span>
        </div>
        <h1 className="mt-2 text-title leading-(--leading-heading) font-bold">
          {dateLong(date)}
          {isToday && (
            <span className="ml-2 align-middle text-sm font-semibold text-(--now-marker)">
              {t("today")}
            </span>
          )}
        </h1>
        {title && view && (
          <p className="text-lg">
            {lang() === "gu" ? (
              <>
                {title.gu} · <span lang="en">{title.en}</span>
              </>
            ) : (
              <>
                {title.en} · <span lang="gu">{title.gu}</span> ·{" "}
                <span lang="gu" className="text-text-muted">
                  {weekdayName(view.day.vara, "gu")}
                </span>
              </>
            )}
          </p>
        )}
      </header>

      {family && family.length > 0 && (
        <Section title={t("familyDates")}>
          <ul className="flex flex-col gap-2">
            {family.map((r) => (
              <li key={r.event.id}>
                <EventRow r={r} today={date} s={s} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {festivals.length > 0 && (
        <Section title={t("festivals")}>
          <FestivalList festivals={festivals} date={date} tz={tz} />
        </Section>
      )}

      {view?.muhurta ? (
        <>
          <Section title={t("panchang")}>
            <ElementsCard view={view} tz={tz} />
          </Section>
          <Section
            id="hours"
            title={t("hourByHourShort")}
            sub={t("hourByHourSub")}
          >
            <Timeline
              view={view}
              tz={tz}
              {...(isToday ? { now } : {})}
              onOpen={setSheet}
            />
            <NightChoghadiya
              m={view.muhurta}
              tz={tz}
              initiallyOpen
              onOpen={setSheet}
            />
          </Section>
          <Section title={t("sunAndMoon")}>
            <SunMoonCard view={view} s={s} />
          </Section>
          <footer className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <span className="text-sm text-text-muted">
              {samvatLine(view.day, s)}
            </span>
            <a
              href={mismatchUrl(s, date)}
              target="_blank"
              rel="noreferrer"
              className={btnOutline}
            >
              {t("reportMismatch")}
            </a>
            <button
              type="button"
              onClick={() => setSheet(howSheet(s, date))}
              className="min-h-(--tap-min) px-4 text-body font-semibold text-accent underline underline-offset-3 focus-ring"
            >
              {t("howCalculated")}
            </button>
          </footer>
        </>
      ) : view ? (
        <p className="px-4 pt-6 text-body">{t("noCivilDayDate")}</p>
      ) : (
        <div
          aria-hidden="true"
          className={`mx-4 mt-6 h-64 animate-pulse motion-reduce:animate-none ${card}`}
        />
      )}
      <Sheet content={sheet} onClose={() => setSheet(null)} />
    </article>
  );
}

function FestivalList({
  festivals,
  date,
  tz,
}: {
  festivals: readonly Festival[];
  date: CivilDate;
  tz: string;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {festivals.map((f) => (
        <li
          key={f.id + f.date}
          className={`flex items-center gap-3 p-4 ${card}`}
        >
          <span
            aria-hidden="true"
            className="flex size-11 flex-none items-center justify-center rounded-full bg-festival-subtle"
          >
            <span className="block size-3.5 rotate-45 bg-festival" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-caption font-semibold text-festival">
              {t("festival")}
              {f.unverified && t("notVerified")}
            </span>
            <span className="text-lg leading-tight font-semibold">
              {f.names[lang()]}
              {f.variant && ` (${f.variant.label[lang()]})`}
              {lang() === "en" && (
                <>
                  {" · "}
                  <span lang="gu">{f.names.gu}</span>
                </>
              )}
            </span>
            {f.endDate && (
              <span className="text-sm text-text-muted">
                {t("festivalDayOf", {
                  n: daysBetween(f.date, date) + 1,
                  total: daysBetween(f.date, f.endDate) + 1,
                })}
              </span>
            )}
            {festivalTiming(f, tz) && (
              <span className="text-sm">{festivalTiming(f, tz)}</span>
            )}
            {f.fallback && (
              <span className="text-sm text-text-muted">
                {t("provisionalDate")}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
