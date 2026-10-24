// Grid cells cap text growth at ~120% (like the approved timeline lane labels): seven columns
// can't hold 200% text at 360 px; every cell's full detail is one tap away in Day detail.
// Month (brief §3.3): Gregorian grid with the tithi per day, festival markers, the Navratri band,
// and two-day / skipped tithi markers (icon + text, never colour alone). Grid + Day detail side
// by side from 1024 px.
import { addDays, type CivilDate } from "@panchang/engine";
import { monthName, tithiLabel } from "@panchang/i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { MonthDay } from "@/db";
import { DayDetail } from "@/day-detail";
import { PersonalIcon } from "@/event-row";
import { useOccurrenceRows, type UpcomingRow } from "@/events-data";
import { useFestivals, useNow } from "@/day-data";
import { lang, t } from "@/i18n";
import { clockFor } from "@/lib/clock";
import { dateLong, dayNumber, monthTitle, weekdayInitials } from "@/lib/format";
import { firstDay, yearMonthOf, type YearMonth } from "@/lib/year-month";
import { monthQuery } from "@/queries";
import { useSettings } from "@/settings";
import { btnOutline, card } from "@/ui";
import { SHOW_UNVERIFIED } from "@/flags";
import type { Festival } from "@/worker/api";

const wide = window.matchMedia("(min-width: 1024px)");
const useWide = () =>
  useSyncExternalStore(
    (cb) => (
      wide.addEventListener("change", cb),
      () => wide.removeEventListener("change", cb)
    ),
    () => wide.matches,
  );

export const shiftMonth = (m: YearMonth, by: number) => {
  const [y, mo] = m.split("-").map(Number) as [number, number];
  const d = new Date(Date.UTC(y, mo - 1 + by, 1));
  return d.toISOString().slice(0, 7) as YearMonth;
};

export function Month({ month, date }: { month: YearMonth; date?: CivilDate }) {
  const s = useSettings((st) => st.settings)!;
  const navigate = useNavigate();
  const isWide = useWide();
  const today = clockFor(s.location.tz).localDate(useNow());
  const { data: days } = useQuery(monthQuery(s, month));
  const festivals = useFestivals(s, [Number(month.slice(0, 4))]);
  const family = useOccurrenceRows(s, firstDay(month), 30) ?? [];
  const qc = useQueryClient();
  const [dir, setDir] = useState<"next" | "prev" | null>(null);
  const swipeX = useRef<number | null>(null);

  // §7 prefetch: adjacent months in idle time, so month changes never wait on the worker.
  useEffect(() => {
    const prefetch = () => {
      void qc.prefetchQuery(monthQuery(s, shiftMonth(month, 1)));
      void qc.prefetchQuery(monthQuery(s, shiftMonth(month, -1)));
    };
    if ("requestIdleCallback" in window) requestIdleCallback(prefetch);
    else setTimeout(prefetch, 200);
  }, [qc, s, month]);

  const go = (by: number) => {
    setDir(by > 0 ? "next" : "prev");
    void navigate({ to: "/month", search: { m: shiftMonth(month, by) } });
  };
  const selected = date ?? (yearMonthOf(today) === month ? today : undefined);

  return (
    <main className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-start lg:gap-6">
      <div className="mx-auto w-full max-w-180 px-4 pt-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-[min(12rem,100%)] flex-1 flex-col">
            <h1 className="text-title leading-(--leading-heading) font-bold">
              {monthTitle(firstDay(month))}
            </h1>
            {days && <LunarSpan days={days} />}
          </div>
          <span className="flex flex-none gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t("prevMonth")}
              className={`${btnOutline} w-12 px-0`}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t("nextMonth")}
              className={`${btnOutline} w-12 px-0`}
            >
              ›
            </button>
          </span>
        </header>
        {days && <AdhikBanner days={days} />}

        <div
          key={month}
          onPointerDown={(e) => (swipeX.current = e.clientX)}
          onPointerUp={(e) => {
            const dx = swipeX.current === null ? 0 : e.clientX - swipeX.current;
            swipeX.current = null;
            if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
          }}
          className={`mt-4 touch-pan-y ${dir === "next" ? "slide-next" : dir === "prev" ? "slide-prev" : ""}`}
        >
          <div
            aria-hidden="true"
            className="grid grid-cols-7 pb-1 text-center text-[length:min(var(--text-caption),17px)] font-semibold text-text-muted"
          >
            {weekdayInitials().map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          {days ? (
            <Grid
              month={month}
              days={days}
              festivals={festivals}
              family={family}
              today={today}
              {...(selected ? { selected } : {})}
              link={(d) =>
                isWide
                  ? { to: "/month", search: { m: month, date: d } }
                  : { to: "/day", search: { date: d } }
              }
            />
          ) : (
            <div
              aria-hidden="true"
              className={`h-96 animate-pulse motion-reduce:animate-none ${card}`}
            />
          )}
        </div>
        <Legend
          hasFestivals={festivals.some(
            (f) =>
              f.date.startsWith(month) || (f.endDate ?? "").startsWith(month),
          )}
        />
      </div>
      {isWide && selected && (
        <div className="sticky top-0 max-h-dvh overflow-y-auto border-l border-border">
          <DayDetail date={selected} embedded />
        </div>
      )}
    </main>
  );
}

/** "Bhadarvo – Aaso": the lunar months the Gregorian month spans. */
function LunarSpan({ days }: { days: readonly MonthDay[] }) {
  const span = (l: "en" | "gu") =>
    [
      ...new Set(
        days.flatMap(({ day }) =>
          day.kind === "day"
            ? [monthName(day.month.name, l, day.month.adhik)]
            : [],
        ),
      ),
    ].join(" – ");
  return (
    <p className="text-sm text-text-muted">
      {lang() === "gu" ? (
        span("gu")
      ) : (
        <>
          {span("en")} · <span lang="gu">{span("gu")}</span>
        </>
      )}
    </p>
  );
}

function AdhikBanner({ days }: { days: readonly MonthDay[] }) {
  const adhik = days.find(
    ({ day }) => day.kind === "day" && day.month.adhik,
  )?.day;
  if (adhik?.kind !== "day") return null;
  return (
    <p role="note" className="mt-3 rounded-md bg-accent-subtle p-3 text-sm">
      {t("adhikBanner", {
        month: monthName(adhik.month.name, lang(), true),
      })}
    </p>
  );
}

type LinkTarget =
  | { to: "/month"; search: { m: YearMonth; date: CivilDate } }
  | { to: "/day"; search: { date: CivilDate } };

function Grid({
  month,
  days,
  festivals,
  family,
  today,
  selected,
  link,
}: {
  month: YearMonth;
  days: readonly MonthDay[];
  festivals: readonly Festival[];
  family: readonly UpcomingRow[];
  today: CivilDate;
  selected?: CivilDate;
  link: (d: CivilDate) => LinkTarget;
}) {
  const lead = new Date(Date.parse(firstDay(month))).getUTCDay();
  const cells: (MonthDay | null)[] = [...Array<null>(lead).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7),
  );
  const spans = festivals.filter((f) => f.endDate);
  const single = festivals.filter((f) => !f.endDate);

  return (
    <div className="flex flex-col gap-[4px]">
      {weeks.map((week, w) => {
        const dates = week.map((c) => c?.date);
        const bands = spans.flatMap((f) => {
          const cols = dates.flatMap((d, i) =>
            d && d >= f.date && d <= f.endDate! ? [i] : [],
          );
          return cols.length ? [{ f, from: cols[0]!, to: cols.at(-1)! }] : [];
        });
        return (
          <div key={w} className="grid grid-cols-7 gap-[4px]">
            {week.map((c, i) =>
              c ? (
                <Cell
                  key={c.date}
                  c={c}
                  prev={days.find((d) => d.date === addDays(c.date, -1))}
                  festivals={single.filter((f) => f.date === c.date)}
                  family={family.filter((r) => r.date === c.date)}
                  inSpan={spans.filter(
                    (f) => c.date >= f.date && c.date <= f.endDate!,
                  )}
                  today={c.date === today}
                  selected={c.date === selected}
                  link={link(c.date)}
                />
              ) : (
                <span key={`e${i}`} />
              ),
            )}
            {bands.map(({ f, from, to }) => (
              <div
                key={f.id}
                aria-hidden="true"
                style={{ gridColumn: `${from + 1} / ${to + 2}` }}
                className="flex min-h-6 items-center justify-between gap-1 rounded-sm bg-festival-subtle px-1.5 text-[length:min(var(--text-caption),18px)] font-semibold text-festival"
              >
                <span className="[overflow-wrap:anywhere]">
                  {dates[from] === f.date
                    ? t("bandDay1", { name: f.names[lang()] })
                    : f.names[lang()]}
                  {f.unverified && "*"}
                </span>
                {dates[to] === f.endDate && (
                  <span className="flex-none">{t("bandLastDay")}</span>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Cell({
  family,
  c,
  prev,
  festivals,
  inSpan,
  today,
  selected,
  link,
}: {
  c: MonthDay;
  prev: MonthDay | undefined;
  festivals: readonly Festival[];
  family: readonly UpcomingRow[];
  inSpan: readonly Festival[];
  today: boolean;
  selected: boolean;
  link: LinkTarget;
}) {
  const day = c.day.kind === "day" ? c.day : null;
  // Two-day tithi: this day's tithi is also at the next sunrise, or was at the previous one.
  const twoDay =
    !!day &&
    (day.tithi.vriddhi || (prev?.day.kind === "day" && prev.day.tithi.vriddhi));
  const skipped = day?.tithi.kshaya ?? [];
  const label = [
    dateLong(c.date),
    day &&
      `${monthName(day.month.name, lang(), day.month.adhik)} ${tithiLabel(day.tithi.atSunrise, lang())}`,
    today && t("cellToday"),
    selected && t("cellSelected"),
    twoDay && t("cellTwoDay"),
    ...skipped.map((k) => t("cellSkipped", { tithi: tithiLabel(k, lang()) })),
    ...family.map((r) => t("cellFamily", { name: r.event.title })),
    ...[...festivals, ...inSpan].map((f) =>
      f.unverified
        ? t("cellNotVerified", { name: f.names[lang()] })
        : f.names[lang()],
    ),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      {...link}
      aria-current={today ? "date" : undefined}
      className={`flex min-h-18 min-w-0 flex-col items-start gap-0.5 rounded-md border-[1.5px] p-[4px] text-left focus-ring sm:p-[6px] ${
        selected
          ? "border-accent bg-accent-subtle"
          : "border-transparent bg-surface hover:bg-surface-sunken"
      }`}
    >
      <span
        className={`flex size-[min(2rem,36px)] items-center justify-center rounded-full text-[length:min(var(--text-lg),24px)] leading-none font-semibold tabular-nums ${
          today ? "border-2 border-(--now-marker) text-(--now-marker)" : ""
        }`}
      >
        {dayNumber(c.date)}
      </span>
      {day && (
        <span className="text-[length:min(var(--text-caption),18px)] leading-tight text-text-muted [overflow-wrap:anywhere]">
          {cellTithi(day.tithi.atSunrise)}
        </span>
      )}
      <span
        aria-hidden="true"
        className="flex flex-wrap items-center gap-1 text-[length:min(var(--text-caption),16px)] leading-tight"
      >
        {twoDay && (
          <span className="rounded-sm border border-border-strong px-0.5 font-semibold">
            {t("twoDayMark")}
          </span>
        )}
        {skipped.length > 0 && (
          <span className="rounded-sm border border-dashed border-border-strong px-0.5 font-semibold">
            {t("skipMark")}
          </span>
        )}
      </span>
      {family.map((r) => (
        <span
          key={r.event.id}
          aria-hidden="true"
          className="flex max-w-full min-w-0 items-start gap-1 text-[length:min(var(--text-caption),16px)] leading-tight font-semibold text-personal-event"
        >
          <span className="mt-0.5">
            <PersonalIcon small />
          </span>
          <span className="hidden [overflow-wrap:anywhere] sm:inline">
            {r.event.title}
          </span>
        </span>
      ))}
      {festivals.map((f) => (
        <span
          key={f.id}
          aria-hidden="true"
          className="flex max-w-full min-w-0 items-start gap-1 text-[length:min(var(--text-caption),18px)] leading-tight font-semibold text-festival"
        >
          <span className="block size-2 flex-none rotate-45 bg-festival" />
          <span className="hidden [overflow-wrap:anywhere] sm:inline">
            {f.names[lang()]}
            {f.variant && ` (${f.variant.label[lang()]})`}
            {f.unverified && "*"}
          </span>
        </span>
      ))}
      <span className="sr-only">{label}</span>
    </Link>
  );
}

/** Grid label: printed calendars write Punam and Amas without Sud/Vad (saves cell width). */
const cellTithi = (n: number) => {
  const label = tithiLabel(n, lang());
  return n === 15 || n === 30 ? label.split(" ").slice(1).join(" ") : label;
};

function Legend({ hasFestivals }: { hasFestivals: boolean }) {
  const item = "flex items-center gap-1.5";
  return (
    <ul
      aria-label={t("key")}
      className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm"
    >
      <li className={item}>
        <span className="flex size-6 items-center justify-center rounded-full border-2 border-(--now-marker) text-caption font-semibold text-(--now-marker)">
          {dayNumber("2026-01-01" as CivilDate)}
        </span>
        {t("keyToday")}
      </li>
      {hasFestivals && (
        <li className={item}>
          <span className="block size-2.5 rotate-45 bg-festival" />
          {t("keyFestival")}
        </li>
      )}
      <li className={item}>
        <PersonalIcon small />
        {t("keyFamily")}
      </li>
      <li className={item}>
        <span className="rounded-sm border border-border-strong px-0.5 text-caption font-semibold">
          {t("twoDayMark")}
        </span>
        {t("keyTwoDay")}
      </li>
      <li className={item}>
        <span className="rounded-sm border border-dashed border-border-strong px-0.5 text-caption font-semibold">
          {t("skipMark")}
        </span>
        {t("keySkipped")}
      </li>
      {SHOW_UNVERIFIED && (
        <li className="text-text-muted">{t("keyUnverified")}</li>
      )}
    </ul>
  );
}
