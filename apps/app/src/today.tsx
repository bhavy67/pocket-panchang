// Today, "Quiet Sky" (ADR 0024; docs/design/screens.md): header → moon hero → Right now →
// Your day ribbon → Panchang tiles → Coming up → footer. Calm, one strong accent, big type.
import {
  nextGoodTime,
  type Choghadiya,
  type DayMuhurta,
} from "@panchang/calendar";
import {
  karanaName,
  type CivilDate,
  type ElementDay,
  type Instant,
} from "@panchang/engine";
import {
  karanaDisplay,
  nakshatraName,
  tithiLabel,
  tithiName,
  weekdayName,
  yogaName,
} from "@panchang/i18n";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useFestivals, useNow, useToday, type DayView } from "@/day-data";
import { DayRibbon } from "@/day-ribbon";
import { useOccurrenceRows, type UpcomingRow } from "@/events-data";
import { lang, t } from "@/i18n";
import { clockFor } from "@/lib/clock";
import { dateHeader, daysBetween, range, time, timeOn } from "@/lib/format";
import { MoonDisc, useElongation } from "@/moon-disc";
import { howSheet, indexAt, samvatLine, tithiTitle } from "@/panchang";
import { lunarLabel } from "@/policy";
import { moonQuery } from "@/queries";
import { useSettings, type Settings } from "@/settings";
import { avoidPeriods, avoidSheet, chogName, chogSheet } from "@/timeline";
import { InstallCard, QualityIcon, Sheet, type SheetContent } from "@/ui";
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
    <main className="mx-auto flex max-w-180 flex-col gap-8 px-4 pt-4 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <Link
            to="/settings"
            hash="place"
            aria-label={t("changeCityAria", { city: s.location.name })}
            className="-ml-2 flex min-h-11 items-center gap-1 self-start rounded-md px-2 text-lg font-bold hover:bg-surface-sunken focus-ring"
          >
            {s.location.name}
            <Chevron />
          </Link>
          <span className="text-sm text-text-muted">
            {dateHeader(date)}
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
          className="flex min-h-11 flex-none items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-body font-semibold text-accent hover:bg-accent-subtle focus-ring"
        >
          <HelpIcon />
          {t("help")}
        </button>
      </header>

      {view?.muhurta ? (
        <>
          <Hero view={view} now={now} tz={tz} />
          <RightNow
            view={view}
            m={view.muhurta}
            now={now}
            tz={tz}
            onOpen={setSheet}
          />
          <section aria-labelledby="your-day" className="flex flex-col gap-3">
            <h2 id="your-day" className="text-title font-extrabold">
              {t("yourDay")}
            </h2>
            <DayRibbon view={view} tz={tz} now={now} onOpen={setSheet} />
          </section>
          <PanchangTiles view={view} now={now} s={s} />
          <ComingUp s={s} from={date} />
          <InstallCard where="today" />
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-sm">
            <span className="text-text-muted">{samvatLine(view.day, s)}</span>
            <Link
              to="/how"
              className="flex min-h-11 items-center font-semibold text-accent focus-ring"
            >
              {t("howCalculated")}
            </Link>
          </footer>
        </>
      ) : view ? (
        <p className="text-body">{t("noCivilDayToday")}</p>
      ) : (
        <div
          aria-hidden="true"
          className="h-64 animate-pulse rounded-lg bg-surface motion-reduce:animate-none"
        />
      )}
      <Sheet content={sheet} onClose={() => setSheet(null)} />
    </main>
  );
}

const Chevron = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
    <path
      d="M5 8l5 5 5-5"
      fill="none"
      className="stroke-text-muted"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
    <circle
      cx="10"
      cy="10"
      r="8"
      fill="none"
      className="stroke-current"
      strokeWidth="1.8"
    />
    <path
      d="M7.8 7.8a2.3 2.3 0 1 1 3 2.2c-.6.2-.8.6-.8 1.2v.4"
      fill="none"
      className="stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="10" cy="14.2" r="1" className="fill-current" />
  </svg>
);

/** Moon disc + today's tithi (the tithi running now: after a change it is the new one). */
function Hero({ view, now, tz }: { view: DayView; now: Instant; tz: string }) {
  const elongation = useElongation(now);
  const { day } = view;
  const tithi = indexAt(day.tithi, 30, now);
  const title = tithiTitle(day, tithi);
  const primary = lang() === "gu" ? title.gu : title.en;
  const secondary = lang() === "gu" ? title.en : title.gu;
  const end = day.tithi.ends.find((e) => e.endsAt > now);
  const since = [...day.tithi.ends].reverse().find((e) => e.endsAt <= now);
  const detail = end
    ? t("tithiUntilThen", {
        time: time(end.endsAt, tz),
        next: tithiLabel((end.index % 30) + 1, lang()),
      })
    : since
      ? t("tithiSince", { time: time(since.endsAt, tz) })
      : t("allDay");
  return (
    <section
      aria-label={t("todaysTithi")}
      className="flex flex-wrap items-center gap-5"
    >
      <MoonDisc elongation={elongation} />
      <div className="flex min-w-0 grow basis-[12rem] flex-col">
        <span className="text-[length:var(--text-micro)] font-bold tracking-wider text-text-muted uppercase">
          {t("todaysTithi")}
        </span>
        <h1 className="text-[length:var(--text-hero)] leading-tight font-extrabold">
          {primary}
        </h1>
        <span
          lang={lang() === "gu" ? "en" : "gu"}
          className="text-[length:var(--text-gu-hero)] text-text-muted"
        >
          {secondary}
        </span>
        <span className="text-sm">
          {tithiName(tithi, lang())} · {detail}
        </span>
      </div>
    </section>
  );
}

type Row = {
  key: string;
  name: string;
  tone: "good" | "neutral" | "avoid";
  until: Instant;
  open: SheetContent;
};

/** "Right now": answers "is this a good time, and if not, when?" (ADR 0024). */
function RightNow({
  view,
  m,
  now,
  tz,
  onOpen,
}: {
  view: DayView;
  m: DayMuhurta;
  now: Instant;
  tz: string;
  onOpen: (s: SheetContent) => void;
}) {
  const cur = [...m.day, ...m.night].find((c) => now >= c.start && now < c.end);
  const avoidNow = avoidPeriods(m)
    .filter((a) => now >= a.start && now < a.end)
    .sort((a, b) => a.end - b.end);
  // Next period that is good AND not overlapped by Rahu Kaal or Bhadra (Rahu Kaal can end into Kaal).
  const next = nextGoodTime(m, now);
  const tonight = !!next && m.night.includes(next);
  const headline = !next
    ? t("noGoodLeftShort")
    : next.start <= now
      ? t("goodNowUntil", { time: time(next.end, tz) })
      : t(tonight ? "goodStartsTonight" : "goodStartsAt", {
          time: time(next.start, tz),
        });
  const names = avoidNow.map((a) => a.name);
  const why = !cur
    ? ""
    : cur.quality === "good"
      ? names.length
        ? t(names.length > 1 ? "whyOverlapMany" : "whyOverlapOne", {
            cur: chogName(cur),
            avoid: names.join(t("andJoin")),
          })
        : t("whyClean", { cur: chogName(cur) })
      : t(cur.quality === "bad" ? "whyBad" : "whyNeutral", {
          cur: chogName(cur),
        });

  const rows: Row[] = [
    ...(cur ? [chogRow(cur, m, tz)] : []),
    ...avoidNow.map((a): Row => ({
      key: a.name + a.start,
      name: a.name,
      tone: "avoid",
      until: a.end,
      open: avoidSheet(a, view, tz),
    })),
  ];

  return (
    <section
      aria-labelledby="right-now"
      className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-text-muted">
        <span aria-hidden="true" className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
        </span>
        {t("rightNow", { time: time(now, tz) })}
      </p>
      <div className="flex flex-col gap-1">
        <h2
          id="right-now"
          className="text-[length:var(--text-lead)] leading-tight font-extrabold"
        >
          {headline}
        </h2>
        {why && <p className="text-body text-text-muted">{why}</p>}
      </div>
      <ul className="flex flex-col gap-2">
        {rows.map((r) => (
          <li key={r.key}>
            <button
              type="button"
              onClick={() => onOpen(r.open)}
              className={`flex min-h-12 w-full flex-wrap items-center justify-between gap-x-3 rounded-md px-3 py-2 text-left focus-ring ${
                r.tone === "good"
                  ? "bg-auspicious-subtle text-auspicious"
                  : r.tone === "avoid"
                    ? "bg-inauspicious-subtle text-inauspicious"
                    : "bg-surface-sunken text-text-muted"
              }`}
            >
              <span className="flex items-center gap-2 font-bold">
                <QualityIcon
                  tone={
                    r.tone === "good"
                      ? "good"
                      : r.tone === "avoid"
                        ? "rahu"
                        : "neutral"
                  }
                  size={22}
                />
                <span className="text-text">
                  {r.name} ·{" "}
                  <span className="font-semibold">
                    {t(
                      r.tone === "good"
                        ? "qShortGood"
                        : r.tone === "avoid"
                          ? "qShortAvoid"
                          : "qShortNeutral",
                    )}
                  </span>
                </span>
              </span>{" "}
              <span className="text-sm font-semibold">
                {t("untilTime", { time: time(r.until, tz) })}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

const chogRow = (c: Choghadiya, m: DayMuhurta, tz: string): Row => ({
  key: `c${c.start}`,
  name: chogName(c),
  tone:
    c.quality === "good" ? "good" : c.quality === "bad" ? "avoid" : "neutral",
  until: c.end,
  open: chogSheet(c, m, tz),
});

function Tile({
  label,
  value,
  sub,
  extra,
}: {
  label: string;
  value: string;
  sub?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-[var(--radius-tile)] border border-border bg-surface p-4">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-lg leading-snug font-bold">
        {value}
        {extra}
      </span>
      {sub && <span className="text-sm text-text-muted">{sub}</span>}
    </div>
  );
}

/** Nakshatra, yoga, karana and paksha now, then sun and moon times. */
function PanchangTiles({
  view,
  now,
  s,
}: {
  view: DayView;
  now: Instant;
  s: Settings;
}) {
  const { day } = view;
  const tz = s.location.tz;
  const { data: moon } = useQuery(moonQuery(s, view.date));
  const until = (el: ElementDay) => {
    const e = el.ends.find((x) => x.endsAt > now);
    return e
      ? t("untilTime", { time: timeOn(e.endsAt, tz, view.date) })
      : t("allDay");
  };
  const karana = indexAt(day.karana, 60, now);
  const tithi = indexAt(day.tithi, 30, now);
  const sunset = day.sunset.kind === "event" ? day.sunset.at : null;
  const strip: [string, string, ReactNode][] = [
    [t("sunrise"), timeOn(day.sunrise, tz, view.date), <SunIcon key="r" up />],
    [
      t("sunset"),
      sunset === null ? "—" : timeOn(sunset, tz, view.date),
      <SunIcon key="s" />,
    ],
    [
      t("moonrise"),
      moon?.rise
        ? timeOn(moon.rise, tz, view.date)
        : moon
          ? t("noneToday")
          : "…",
      <MoonIcon key="mr" up />,
    ],
    [
      t("moonset"),
      moon?.set ? timeOn(moon.set, tz, view.date) : moon ? t("noneToday") : "…",
      <MoonIcon key="ms" />,
    ],
  ];
  return (
    <section aria-labelledby="panchang" className="flex flex-col gap-3">
      <h2 id="panchang" className="text-title font-extrabold">
        {t("panchang")}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(9.5rem,100%),1fr))] gap-3">
        <Tile
          label={t("elNakshatra")}
          value={nakshatraName(indexAt(day.nakshatra, 27, now), lang())}
          sub={until(day.nakshatra)}
        />
        <Tile
          label={t("elYoga")}
          value={yogaName(indexAt(day.yoga, 27, now), lang())}
          sub={until(day.yoga)}
        />
        <Tile
          label={t("elKarana")}
          value={karanaDisplay(karanaName(karana), lang())}
          extra={
            karanaName(karana) === "Vishti" && (
              <span className="text-inauspicious"> · {t("bhadra")}</span>
            )
          }
          sub={until(day.karana)}
        />
        <Tile
          label={t("paksha")}
          value={t(tithi <= 15 ? "pakshaShukla" : "pakshaKrishna")}
          sub={t("pakshaDay", { n: tithi <= 15 ? tithi : tithi - 15 })}
        />
      </div>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(8rem,100%),1fr))] gap-px overflow-hidden rounded-[var(--radius-tile)] border border-border bg-border">
        {strip.map(([label, value, icon]) => (
          <li
            key={label}
            className="flex items-center gap-2 bg-surface px-3 py-3"
          >
            {icon}
            <span className="flex flex-col leading-tight">
              <span className="text-caption text-text-muted">{label}</span>
              <span className="font-bold">{value}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const SunIcon = ({ up = false }: { up?: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="flex-none"
  >
    <path
      d="M4 17h16"
      className="stroke-text-muted"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 17a5 5 0 0 1 10 0"
      fill="none"
      className="stroke-warning"
      strokeWidth="2"
    />
    <path
      d={up ? "M12 4v5M9.5 6.5L12 4l2.5 2.5" : "M12 4v5M9.5 6.5L12 9l2.5-2.5"}
      fill="none"
      className="stroke-warning"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MoonIcon = ({ up = false }: { up?: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="flex-none"
  >
    <path
      d="M4 19h16"
      className="stroke-text-muted"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M14.5 5.5a5 5 0 1 0 4 8 4 4 0 0 1-4-8z" className="fill-accent" />
    <path
      d={up ? "M7 8V3.5M5 5.5l2-2 2 2" : "M7 3.5V8M5 6l2 2 2-2"}
      fill="none"
      className="stroke-text-muted"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Next family dates and festivals within 60 days (ADR 0024 cards). */
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
    <section aria-labelledby="coming-up" className="flex flex-col gap-3">
      <h2 id="coming-up" className="text-title font-extrabold">
        {t("comingUp")}
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((it) =>
          "family" in it ? (
            <li key={`${it.family.event.id}|${it.date}`}>
              <FamilyCard r={it.family} today={from} />
            </li>
          ) : (
            <li key={it.festival.id + it.date}>
              <FestivalCard f={it.festival} today={from} tz={s.location.tz} />
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

function FamilyCard({ r, today }: { r: UpcomingRow; today: CivilDate }) {
  return (
    <Link
      to="/events/$id"
      params={{ id: r.event.id }}
      className="flex min-h-18 flex-wrap items-center gap-3 rounded-lg bg-accent-subtle p-4 focus-ring"
    >
      <span
        aria-hidden="true"
        className="flex size-11 flex-none items-center justify-center rounded-md bg-accent text-text-on-accent"
      >
        <FamilyGlyph kind={r.event.kind} />
      </span>
      <span className="flex min-w-0 grow basis-[10rem] flex-col">
        <span className="text-lg leading-tight font-bold">{r.event.title}</span>
        <span className="text-sm text-text-muted">
          {lunarLabel(r.event.lunarDate)}
        </span>
      </span>
      <Countdown n={daysBetween(today, r.date)} />
    </Link>
  );
}

function FestivalCard({
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
      className="flex min-h-18 flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4 focus-ring"
    >
      <FestivalIcon />
      <span className="flex min-w-0 grow basis-[10rem] flex-col">
        <span className="text-lg leading-tight font-bold">
          {f.names[lang()]}
          {f.variant && ` (${f.variant.label[lang()]})`}
        </span>
        <span className="text-sm text-text-muted">
          {t("festival")}
          {f.unverified && t("notVerified")}
          {festivalTiming(f, tz) && ` · ${festivalTiming(f, tz)}`}
        </span>
      </span>
      <Countdown n={daysBetween(today, f.date)} />
    </Link>
  );
}

export const Countdown = ({ n }: { n: number }) => (
  <span className="flex-none text-right text-sm font-bold">
    {n === 0 ? t("inToday") : n === 1 ? t("inTomorrow") : t("daysCount", { n })}
  </span>
);

/** Flame for varsi/shraddh; a ring for the others. */
export function FamilyGlyph({ kind }: { kind: string }) {
  return kind === "shraddh" ? (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3c1 3.5 5 5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 .8 1.5 1.5 2 2.5 2 0-2.5-.5-4.5.5-7z"
        className="fill-current"
      />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="5"
        fill="none"
        className="stroke-current"
        strokeWidth="3"
      />
    </svg>
  );
}

export function FestivalIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex size-11 flex-none items-center justify-center rounded-md bg-festival-subtle"
    >
      <span className="block size-3.5 rotate-45 bg-festival" />
    </span>
  );
}

/** Holika Dahan's evening time and Raksha Bandhan's "after Bhadra" line (brief §2). */
export const festivalTiming = (f: Festival, tz: string) =>
  f.evening
    ? t("festivalEvening", { range: range(f.evening.start, f.evening.end, tz) })
    : f.afterBhadra
      ? t("rakhiAfter", { time: time(f.afterBhadra, tz) })
      : null;
