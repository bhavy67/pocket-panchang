// Day detail (brief §3.4): full panchang for one date. Standalone at /day on phones; beside the
// month grid at ≥ 1024 px.
import { addDays, type CivilDate } from "@panchang/engine";
import { weekdayName } from "@panchang/i18n";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useDay, useFestivals, useNow } from "@/day-data";
import { clockFor } from "@/lib/clock";
import { dateLong, daysBetween, monthTitle, time } from "@/lib/format";
import { yearMonthOf } from "@/lib/year-month";
import {
  ElementsCard,
  howSheet,
  mismatchUrl,
  samvatLine,
  SunCard,
  tithiTitle,
} from "@/panchang";
import { useSettings } from "@/settings";
import { NightChoghadiya, Timeline } from "@/timeline";
import { btnOutline, card, Section, Sheet, type SheetContent } from "@/ui";
import type { Festival } from "@/worker/api";

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
              aria-label="Previous day"
              className={`${btnOutline} w-12 px-0`}
            >
              ‹
            </Link>
            <Link
              {...dayLink(addDays(date, 1))}
              aria-label="Next day"
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
              Today
            </span>
          )}
        </h1>
        {title && view && (
          <p className="text-lg">
            {title.en} · <span lang="gu">{title.gu}</span> ·{" "}
            <span lang="gu" className="text-text-muted">
              {weekdayName(view.day.vara, "gu")}
            </span>
          </p>
        )}
      </header>

      {festivals.length > 0 && (
        <Section title="Festivals">
          <FestivalList festivals={festivals} date={date} tz={tz} />
        </Section>
      )}

      {view?.muhurta ? (
        <>
          <Section title="Panchang">
            <ElementsCard view={view} tz={tz} />
          </Section>
          <Section
            title="Hour by hour"
            sub="Sunrise to sunset, split into 8 Choghadiya. Tap any part for details."
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
          <Section title="Sun">
            <SunCard view={view} tz={tz} />
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
              Report a mismatch
            </a>
            <button
              type="button"
              onClick={() => setSheet(howSheet(s, date))}
              className="min-h-(--tap-min) px-4 text-body font-semibold text-accent underline underline-offset-3 focus-ring"
            >
              How this is calculated
            </button>
          </footer>
        </>
      ) : view ? (
        <p className="px-4 pt-6 text-body">
          There is no sunrise or sunset here on this date, so the panchang can't
          be worked out.
        </p>
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
              Festival{f.unverified && " · Not yet verified"}
            </span>
            <span className="text-lg leading-tight font-semibold">
              {f.names.en}
              {f.variant && ` (${f.variant.label.en})`} ·{" "}
              <span lang="gu">{f.names.gu}</span>
            </span>
            {f.endDate && (
              <span className="text-sm text-text-muted">
                Day {daysBetween(f.date, date) + 1} of{" "}
                {daysBetween(f.date, f.endDate) + 1}
              </span>
            )}
            {f.afterBhadra && (
              <span className="text-sm">
                Rakhi: after {time(f.afterBhadra, tz)} (after Bhadra)
              </span>
            )}
            {f.fallback && (
              <span className="text-sm text-text-muted">
                Provisional date: please check a printed calendar.
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
