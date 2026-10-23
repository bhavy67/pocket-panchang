// Today (approved design, docs/design/screens.md). Section order per decision 7.
import { nextGoodTime } from "@panchang/calendar";
import type { CivilDate, Instant } from "@panchang/engine";
import { tithiLabel, weekdayName } from "@panchang/i18n";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useFestivals, useNow, useToday, type DayView } from "@/day-data";
import { EventRow, inDays } from "@/event-row";
import { useOccurrenceRows } from "@/events-data";
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
  chogSheet,
  NightChoghadiya,
  qualityLabel,
  Timeline,
  toneOf,
} from "@/timeline";
import { card, QualityIcon, Section, Sheet, type SheetContent } from "@/ui";
import type { Festival } from "@/worker/api";

export function Today() {
  const s = useSettings((st) => st.settings)!;
  const now = useNow();
  const view = useToday(s, now);
  const [sheet, setSheet] = useState<SheetContent | null>(null);
  const tz = s.location.tz;
  const date = clockFor(tz).localDate(now);

  return (
    <main className="mx-auto max-w-180">
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="flex flex-col">
          <span className="text-lg leading-tight font-semibold">
            {s.location.name}
          </span>
          <span className="text-sm text-text-muted">
            {dateShort(date)}
            {view && (
              <>
                {" · "}
                <span lang="gu">{weekdayName(view.day.vara, "gu")}</span>
              </>
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSheet(howSheet(s, view?.date ?? date))}
          className="min-h-(--tap-min) flex-none rounded-full border-[1.5px] border-border-strong bg-surface px-4 text-body font-semibold text-accent hover:bg-accent-subtle focus-ring"
        >
          Help
        </button>
      </header>

      {view?.muhurta ? (
        <>
          <Glance view={view} now={now} tz={tz} onOpen={setSheet} />
          <Section title="Today's panchang">
            <ElementsCard view={view} tz={tz} />
          </Section>
          <Section
            title="Today, hour by hour"
            sub="Sunrise to sunset, split into 8 Choghadiya. Tap any part for details."
          >
            <Timeline view={view} tz={tz} now={now} onOpen={setSheet} />
            <NightChoghadiya m={view.muhurta} tz={tz} onOpen={setSheet} />
          </Section>
          <Section title="Sun and Moon">
            <SunMoonCard view={view} s={s} />
          </Section>
          <ComingUp s={s} from={date} />
          <footer className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <span className="text-sm text-text-muted">
              {samvatLine(view.day, s)}
            </span>
            <button
              type="button"
              onClick={() => setSheet(howSheet(s, view.date))}
              className="min-h-(--tap-min) px-4 text-body font-semibold text-accent underline underline-offset-3 focus-ring"
            >
              How this is calculated
            </button>
          </footer>
        </>
      ) : view ? (
        <p className="px-4 text-body">
          There is no sunrise or sunset here today, so the panchang can't be
          worked out.
        </p>
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
    ? `until ${time(tithiEnd.endsAt, tz)}, then ${tithiLabel((tithiEnd.index % 30) + 1, "en")}`
    : tithiSince
      ? `since ${time(tithiSince.endsAt, tz)}`
      : "all day";

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
      ? `${cur.name} is a good time, but ${names.join(" and ")} ${names.length > 1 ? "are" : "is"} also on, so many families wait to start new work. ${avoidNow
          .map((a) => `${a.name} ends at ${time(a.end, tz)}`)
          .join(" and ")}.`
      : null;
  const aria = `${title.en}. ${cur ? `Choghadiya: ${cur.name}, ${qualityLabel(cur).toLowerCase()}, until ${time(cur.end, tz)}. ` : ""}Rahu Kaal ${range(rahu.start, rahu.end, tz)}${rahuNow ? ", happening now" : ""}.`;

  return (
    <section aria-label={aria} className={`mx-4 px-5 pt-5 pb-4 ${card}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-headline leading-(--leading-heading) font-bold tracking-tight">
          {title.en}
        </h1>
        <span lang="gu" className="text-lg text-text-muted">
          {title.gu}
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
                Choghadiya: {cur.name}
              </span>
              <span
                className={`text-sm leading-snug font-semibold ${good ? "text-auspicious" : "text-text-muted"}`}
              >
                {qualityLabel(cur)} ·{" "}
                <span className="tabular-nums">until {time(cur.end, tz)}</span>
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
                Many avoid now
              </span>
              <span className="mb-1 text-sm leading-snug">
                Families often wait to start new or auspicious work.
              </span>
              {avoidNow.map((a) => (
                <button
                  key={a.name + a.start}
                  type="button"
                  onClick={() => onOpen(avoidSheet(a, view, tz))}
                  aria-label={`${a.name}, until ${time(a.end, tz)}`}
                  className="flex min-h-(--tap-min) w-full flex-wrap items-center justify-between gap-x-2 border-t border-border py-1 text-left focus-ring"
                >
                  <span className="text-body font-semibold">{a.name}</span>
                  <span className="text-sm font-semibold text-inauspicious tabular-nums">
                    until {time(a.end, tz)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              onOpen(
                avoidSheet(
                  { ...rahu, name: "Rahu Kaal", kind: "rahu" },
                  view,
                  tz,
                ),
              )
            }
            className="flex min-h-16 w-full flex-wrap items-center gap-3 rounded-md border-[1.5px] border-border bg-surface p-3 text-left focus-ring"
          >
            <QualityIcon tone="bad" size={32} />
            <span className="flex min-w-[min(12rem,100%)] flex-1 flex-col">
              <span className="text-lg leading-tight font-semibold">
                {now < rahu.start
                  ? "Rahu Kaal later today"
                  : "Rahu Kaal is over"}
              </span>
              <span className="text-sm leading-snug font-semibold text-text-muted tabular-nums">
                {now < rahu.start ? "" : "It was "}
                {range(rahu.start, rahu.end, tz)}
              </span>
            </span>
          </button>
        )}
      </div>

      {overlap && (
        <p className="mt-3 text-sm">
          <strong className="font-semibold">
            {names.length > 1
              ? "All of these are happening now."
              : "Both are happening now."}
          </strong>{" "}
          {overlap}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
        <QualityIcon tone="good" />
        <span className="text-body leading-snug">
          <strong className="font-semibold">Next good time:</strong>{" "}
          <span className="tabular-nums">
            {nextGood
              ? `${nextGood.name}, ${range(nextGood.start, nextGood.end, tz)}${m.night.includes(nextGood) ? " (tonight)" : ""}`
              : "None left before tomorrow's sunrise"}
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
    <Section title="Coming up">
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
          Festival{f.unverified && " · Not yet verified"}
        </span>
        <span className="text-lg leading-tight font-semibold">
          {f.names.en}
          {f.variant && ` (${f.variant.label.en})`}
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
    ? `Evening, ${range(f.evening.start, f.evening.end, tz)}`
    : f.afterBhadra
      ? `Rakhi: after ${time(f.afterBhadra, tz)} (after Bhadra)`
      : null;
