// Today (approved design, docs/design/screens.md). Section order per decision 7.
import { nextGoodTime } from "@panchang/calendar";
import type { CivilDate, Instant } from "@panchang/engine";
import { tithiLabel, weekdayName } from "@panchang/i18n";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useFestivals, useNow, useToday, type DayView } from "@/day-data";
import { EventRow, inDays } from "@/event-row";
import { useOccurrenceRows } from "@/events-data";
import { lang, t } from "@/i18n";
import { clockFor } from "@/lib/clock";
import { dateShort, daysBetween, range, time } from "@/lib/format";
import {
  ElementsCard,
  howSheet,
  indexAt,
  samvatLine,
  SunMoonCard,
  tithiTitle,
} from "@/panchang";
import { useSettings, type Settings } from "@/settings";
import {
  avoidPeriods,
  avoidSheet,
  chogName,
  chogSheet,
  NightChoghadiya,
  qualityLabel,
  rahuAvoid,
  Timeline,
  toneOf,
} from "@/timeline";
import {
  card,
  InstallCard,
  QualityIcon,
  Section,
  Sheet,
  type SheetContent,
} from "@/ui";
import type { Festival } from "@/worker/api";

export function Today() {
  const s = useSettings((st) => st.settings)!;
  const now = useNow();
  const view = useToday(s, now);
  const [sheet, setSheet] = useState<SheetContent | null>(null);
  const tz = s.location.tz;
  const date = clockFor(tz).localDate(now);
  const beforeSunrise = !!view && view.date !== date;

  return (
    <main className="mx-auto max-w-180">
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="flex flex-col">
          <span className="text-lg leading-tight font-semibold">
            {s.location.name}
          </span>
          <span className="text-sm text-text-muted">
            {dateShort(date)}
            {/* Gujarati dates already name the weekday. */}
            {view && !beforeSunrise && lang() === "en" && (
              <>
                {" · "}
                <span lang="gu">{weekdayName(view.day.vara, "gu")}</span>
              </>
            )}
          </span>
          {/* Before sunrise the panchang day is still yesterday's (sunrise to sunrise, §4.5). */}
          {view && beforeSunrise && (
            <span className="text-sm font-semibold">
              {t("panchangDayUntil", {
                weekday: weekdayName(view.day.vara, lang()),
                time: time(view.day.nextSunrise, tz),
              })}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSheet(howSheet(s, view?.date ?? date))}
          className="min-h-(--tap-min) flex-none rounded-full border-[1.5px] border-border-strong bg-surface px-4 text-body font-semibold text-accent hover:bg-accent-subtle focus-ring"
        >
          {t("help")}
        </button>
      </header>

      {view?.muhurta ? (
        <>
          <Glance view={view} now={now} tz={tz} onOpen={setSheet} />
          <Section title={t("todaysPanchang")}>
            <ElementsCard view={view} tz={tz} />
          </Section>
          <Section title={t("hourByHour")} sub={t("hourByHourSub")}>
            <Timeline view={view} tz={tz} now={now} onOpen={setSheet} />
            <NightChoghadiya m={view.muhurta} tz={tz} onOpen={setSheet} />
          </Section>
          <Section title={t("sunAndMoon")}>
            <SunMoonCard view={view} s={s} />
          </Section>
          <ComingUp s={s} from={date} />
          <div className="px-4 pt-8 empty:hidden">
            <InstallCard where="today" />
          </div>
          <footer className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <span className="text-sm text-text-muted">
              {samvatLine(view.day, s)}
            </span>
            <button
              type="button"
              onClick={() => setSheet(howSheet(s, view.date))}
              className="min-h-(--tap-min) px-4 text-body font-semibold text-accent underline underline-offset-3 focus-ring"
            >
              {t("howCalculated")}
            </button>
          </footer>
        </>
      ) : view ? (
        <p className="px-4 text-body">{t("noCivilDayToday")}</p>
      ) : (
        <GlanceSkeleton />
      )}
      <Sheet content={sheet} onClose={() => setSheet(null)} />
    </main>
  );
}

/** Skeleton only on true first run (§7); cached days render immediately. */
function GlanceSkeleton() {
  return (
    <div
      aria-hidden="true"
      className={`mx-4 h-64 animate-pulse ${card} motion-reduce:animate-none`}
    />
  );
}

function Glance({
  view,
  now,
  tz,
  onOpen,
}: {
  view: DayView;
  now: Instant;
  tz: string;
  onOpen: (s: SheetContent) => void;
}) {
  const { day } = view;
  const m = view.muhurta!;
  const tithi = indexAt(day.tithi, 30, now);
  const title = tithiTitle(day, tithi);
  const tithiEnd = day.tithi.ends.find((e) => e.endsAt > now);
  const tithiSince = [...day.tithi.ends].reverse().find((e) => e.endsAt <= now);
  const sub = tithiEnd
    ? t("tithiUntilThen", {
        time: time(tithiEnd.endsAt, tz),
        next: tithiLabel((tithiEnd.index % 30) + 1, lang()),
      })
    : tithiSince
      ? t("tithiSince", { time: time(tithiSince.endsAt, tz) })
      : t("allDay");

  const all = [...m.day, ...m.night];
  const cur = all.find((c) => now >= c.start && now < c.end);
  const avoidNow = avoidPeriods(m)
    .filter((a) => now >= a.start && now < a.end)
    .sort((a, b) => a.end - b.end);
  const rahu = m.rahuKaal;
  const rahuNow = now >= rahu.start && now < rahu.end;
  const good = cur?.quality === "good";
  const nextGood = nextGoodTime(m, now);
  const names = avoidNow.map((a) => a.name);
  const overlap =
    good && avoidNow.length > 0
      ? `${t(names.length > 1 ? "overlapMany" : "overlapOne", {
          cur: chogName(cur),
          avoid: names.join(t("andJoin")),
        })} ${avoidNow
          .map((a) => t("endsAt", { name: a.name, time: time(a.end, tz) }))
          .join(t("andJoin"))}.`
      : null;
  const primary = lang() === "gu" ? title.gu : title.en;
  const secondary = lang() === "gu" ? title.en : title.gu;
  const aria = t("glanceAria", {
    title: primary,
    chog: cur
      ? t("glanceChogAria", {
          name: chogName(cur),
          quality: qualityLabel(cur),
          time: time(cur.end, tz),
        })
      : "",
    range: range(rahu.start, rahu.end, tz),
    now: rahuNow ? t("happeningNow") : "",
  });

  return (
    <section aria-label={aria} className={`mx-4 px-5 pt-5 pb-4 ${card}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-headline leading-(--leading-heading) font-bold tracking-tight">
          {primary}
        </h1>
        <span
          lang={lang() === "gu" ? "en" : "gu"}
          className="text-lg text-text-muted"
        >
          {secondary}
        </span>
      </div>
      <p className="mt-1 text-sm text-text-muted tabular-nums">{sub}</p>

      <div className="mt-4 flex flex-col gap-2">
        {cur && (
          <button
            type="button"
            onClick={() => onOpen(chogSheet(cur, m, tz))}
            className={`flex min-h-16 w-full flex-wrap items-center gap-3 rounded-md border-[1.5px] p-3 text-left focus-ring ${
              good
                ? "border-auspicious bg-(--chip-auspicious-bg)"
                : cur.quality === "bad"
                  ? "border-inauspicious bg-surface-sunken"
                  : "border-border-strong bg-surface"
            }`}
          >
            <QualityIcon tone={toneOf(cur)} size={32} />
            <span className="flex min-w-[min(12rem,100%)] flex-1 flex-col">
              <span className="text-lg leading-tight font-semibold">
                {t("chogLine", { name: chogName(cur) })}
              </span>{" "}
              <span
                className={`text-sm leading-snug font-semibold ${good ? "text-auspicious" : "text-text-muted"}`}
              >
                {qualityLabel(cur)} ·{" "}
                <span className="tabular-nums">
                  {t("untilTime", { time: time(cur.end, tz) })}
                </span>
              </span>
            </span>
          </button>
        )}

        {avoidNow.length > 0 ? (
          <div className="flex flex-wrap gap-3 rounded-md border-[1.5px] border-inauspicious bg-(--chip-inauspicious-bg) p-3">
            <span className="mt-0.5">
              <QualityIcon tone="rahu" size={32} />
            </span>
            <div className="flex min-w-[min(12rem,100%)] flex-1 flex-col">
              <span className="text-lg leading-tight font-semibold">
                {t("manyAvoidNow")}
              </span>
              <span className="mb-1 text-sm leading-snug">
                {t("manyAvoidNowSub")}
              </span>
              {avoidNow.map((a) => (
                <button
                  key={a.name + a.start}
                  type="button"
                  onClick={() => onOpen(avoidSheet(a, view, tz))}
                  className="flex min-h-(--tap-min) w-full flex-wrap items-center justify-between gap-x-2 border-t border-border py-1 text-left focus-ring"
                >
                  <span className="text-body font-semibold">{a.name}</span>{" "}
                  <span className="text-sm font-semibold text-inauspicious tabular-nums">
                    {t("untilTime", { time: time(a.end, tz) })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpen(avoidSheet(rahuAvoid(m), view, tz))}
            className="flex min-h-16 w-full flex-wrap items-center gap-3 rounded-md border-[1.5px] border-border bg-surface p-3 text-left focus-ring"
          >
            <QualityIcon tone="bad" size={32} />
            <span className="flex min-w-[min(12rem,100%)] flex-1 flex-col">
              <span className="text-lg leading-tight font-semibold">
                {now < rahu.start ? t("rahuLater") : t("rahuOver")}
              </span>
              <span className="text-sm leading-snug font-semibold text-text-muted tabular-nums">
                {now < rahu.start
                  ? range(rahu.start, rahu.end, tz)
                  : t("itWas", { range: range(rahu.start, rahu.end, tz) })}
              </span>
            </span>
          </button>
        )}
      </div>

      {overlap && (
        <p className="mt-3 text-sm">
          <strong className="font-semibold">
            {names.length > 1 ? t("allNow") : t("bothNow")}
          </strong>{" "}
          {overlap}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
        <QualityIcon tone="good" />
        <span className="text-body leading-snug">
          <strong className="font-semibold">{t("nextGoodTime")}</strong>{" "}
          <span className="tabular-nums">
            {nextGood
              ? `${chogName(nextGood)}, ${
                  m.night.includes(nextGood)
                    ? t("tonight", {
                        time: range(nextGood.start, nextGood.end, tz),
                      })
                    : range(nextGood.start, nextGood.end, tz)
                }`
              : t("noneLeft")}
          </span>
        </span>
      </div>
    </section>
  );
}

/** Next festivals within 60 days, each with "in N days". Family dates join in Phase 9. */
function ComingUp({ s, from }: { s: Settings; from: CivilDate }) {
  const year = Number(from.slice(0, 4));
  const festivals = useFestivals(s, [year, year + 1]).filter(
    (f) => f.date >= from && daysBetween(from, f.date) <= 60,
  );
  const family = useOccurrenceRows(s, from, 60) ?? [];
  const items = [
    ...family.map((r) => ({ date: r.date, family: r })),
    ...festivals.map((f) => ({ date: f.date, festival: f })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);
  if (items.length === 0) return null;
  return (
    <Section title={t("comingUp")}>
      <ul className="flex flex-col gap-2">
        {items.map((it) =>
          "family" in it ? (
            <li key={`${it.family.event.id}|${it.date}`}>
              <EventRow r={it.family} today={from} s={s} />
            </li>
          ) : (
            <li key={it.festival.id + it.date}>
              <FestivalRow f={it.festival} today={from} tz={s.location.tz} />
            </li>
          ),
        )}
      </ul>
    </Section>
  );
}

function FestivalRow({
  f,
  today,
  tz,
}: {
  f: Festival;
  today: CivilDate;
  tz: string;
}) {
  return (
    <Link
      to="/day"
      search={{ date: f.date }}
      className={`flex min-h-18 w-full flex-wrap items-center gap-3 p-4 hover:bg-surface-sunken focus-ring ${card}`}
    >
      <FestivalIcon />
      <span className="flex min-w-[min(9rem,100%)] flex-1 flex-col">
        <span className="text-caption font-semibold text-festival">
          {t("festival")}
          {f.unverified && t("notVerified")}
        </span>
        <span className="text-lg leading-tight font-semibold">
          {f.names[lang()]}
          {f.variant && ` (${f.variant.label[lang()]})`}
        </span>
        <span className="text-sm text-text-muted">
          {dateShort(f.date)}
          {festivalTiming(f, tz) && ` · ${festivalTiming(f, tz)}`}
        </span>
      </span>
      <span className="flex-none text-right text-sm font-semibold">
        {inDays(daysBetween(today, f.date))}
      </span>
    </Link>
  );
}

export function FestivalIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex size-11 flex-none items-center justify-center rounded-full bg-festival-subtle"
    >
      <span className="block size-3.5 rotate-45 bg-festival" />
    </span>
  );
}

/** Holika Dahan's evening time and Raksha Bandhan's "after Bhadra" line (brief §2). */
export const festivalTiming = (f: Festival, tz: string) =>
  f.evening
    ? t("festivalEvening", {
        range: range(f.evening.start, f.evening.end, tz),
      })
    : f.afterBhadra
      ? t("rakhiAfter", { time: time(f.afterBhadra, tz) })
      : null;
