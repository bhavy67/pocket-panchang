// Grid cells cap text growth at ~120% (like the approved timeline lane labels): seven columns
// can't hold 200% text at 360 px; every cell's full detail is one tap away in Day detail.
// Month (brief §3.3): Gregorian grid with the tithi per day, festival markers, the Navratri band,
// and two-day / skipped tithi markers (icon + text, never colour alone). Grid + Day detail side
// by side from 1024 px.
import { addDays, type CivilDate } from "@panchang/engine";
import { festivalShortName, monthName, tithiLabel } from "@panchang/i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { MonthDay } from "@/db";
import { DayDetail } from "@/day-detail";
import { useOccurrenceRows, type UpcomingRow } from "@/events-data";
import { useFestivals, useNow } from "@/day-data";
import { lang, t } from "@/i18n";
import { clockFor } from "@/lib/clock";
import {
  dateLong,
  dateShort,
  dayNumber,
  monthTitle,
  weekdayInitials,
} from "@/lib/format";
import { firstDay, yearMonthOf, type YearMonth } from "@/lib/year-month";
import { haptic } from "@/ports";
import { festivalsQuery, monthQuery } from "@/queries";
import { useSettings } from "@/settings";
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
  // Same cached query as useFestivals: tells "no festivals" apart from "not loaded yet".
  const festivalsLoaded = useQuery(
    festivalsQuery(s, Number(month.slice(0, 4))),
  ).isSuccess;
  const family = useOccurrenceRows(s, firstDay(month), 30) ?? [];
  const qc = useQueryClient();
  const [dir, setDir] = useState<"next" | "prev" | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    t: number;
    lastX: number;
    lastT: number;
    prefetched: boolean;
  } | null>(null);

  // §7 prefetch: adjacent months in idle time, so month changes never wait on the worker. A
  // swipe in progress (below) prefetches its direction immediately instead of waiting for idle.
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
    // Flipping months stays on the same page: snapping scroll to the top on every tap (the
    // router's default) is itself a jerk — most visible going forward, since reading a month
    // scrolls down first, then "next" snaps back to 0; "prev" right after starts from 0 already
    // so the same snap is invisible. Keep whatever scroll position the user was at instead.
    void navigate({
      to: "/month",
      search: { m: shiftMonth(month, by) },
      resetScroll: false,
    });
  };

  // Drag follows the finger (transform only, no React state/re-render); on release, a fast
  // flick or a far-enough drag commits the month change, otherwise it springs back.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const now = performance.now();
    drag.current = {
      x: e.clientX,
      t: now,
      lastX: e.clientX,
      lastT: now,
      prefetched: false,
    };
    if (gridRef.current) {
      gridRef.current.style.transition = "none";
      // Only while actually dragging: a GPU layer left promoted all the time (as this and the
      // bottom nav briefly were) competes with whatever else is compositing and can make a
      // *different*, unrelated fixed element (the nav) visibly lag and snap back into place —
      // confirmed by video on a real device, not reproducible in any headless check.
      gridRef.current.style.willChange = "transform";
    }
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = gridRef.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    el.style.transform = `translateX(${dx}px)`;
    if (!d.prefetched && Math.abs(dx) > 10) {
      d.prefetched = true;
      void qc.prefetchQuery(monthQuery(s, shiftMonth(month, dx < 0 ? 1 : -1)));
    }
    d.lastX = e.clientX;
    d.lastT = performance.now();
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = gridRef.current;
    drag.current = null;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    const velocity = (d.lastX - d.x) / Math.max(1, d.lastT - d.t); // px/ms
    el.style.transition = "transform var(--dur-base) var(--ease-exit)";
    if (Math.abs(dx) <= 60 && Math.abs(velocity) <= 0.5) {
      el.style.transform = "translateX(0px)";
      el.addEventListener(
        "transitionend",
        () => {
          el.style.willChange = "auto";
        },
        { once: true },
      );
      return;
    }
    const by = (Math.abs(velocity) > 0.5 ? velocity : dx) < 0 ? 1 : -1;
    haptic("swipe");
    const width = el.offsetWidth || 1;
    el.style.transform = `translateX(${by > 0 ? -width : width}px)`;
    // The element is replaced (key={month}) once `go` navigates, so it's left off-screen
    // rather than snapped back to 0 first (which would flash for a frame); no need to reset
    // willChange here, the whole element is gone.
    el.addEventListener("transitionend", () => go(by), { once: true });
  };
  const selected = date ?? (yearMonthOf(today) === month ? today : undefined);

  return (
    <main className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-start lg:gap-6">
      <div className="mx-auto w-full max-w-180 px-[min(1rem,16px)] pt-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-[min(12rem,100%)] flex-1 flex-col">
            <h1 className="text-headline leading-(--leading-heading) font-display font-heading tracking-display">
              {monthTitle(firstDay(month))}
            </h1>
            {days && <LunarSpan days={days} />}
          </div>
          <span className="flex flex-none gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t("prevMonth")}
              className={roundBtn}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t("nextMonth")}
              className={roundBtn}
            >
              ›
            </button>
          </span>
        </header>
        {days && <AdhikBanner days={days} />}

        <div
          key={month}
          ref={gridRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-busy={!days || !festivalsLoaded}
          className={`mt-4 touch-pan-y ${dir === "next" ? "slide-next" : dir === "prev" ? "slide-prev" : ""}`}
        >
          <div
            aria-hidden="true"
            className="grid grid-cols-7 pb-1 text-center text-[length:min(var(--text-caption),17px)] font-label text-text-muted"
          >
            {weekdayInitials().map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          {/* Fixed to 6 weeks' worth of height: a 4-, 5- or 6-week month never shifts the Legend
              and "This month" below it. */}
          <div className="min-h-[calc(6*4.125rem+1.25rem)]">
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
                className="h-96 animate-pulse motion-reduce:animate-none card"
              />
            )}
          </div>
        </div>
        <Legend
          hasFestivals={festivals.some(
            (f) =>
              f.date.startsWith(month) || (f.endDate ?? "").startsWith(month),
          )}
        />
        <ThisMonth month={month} festivals={festivals} family={family} />
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
                className="flex min-h-6 items-center justify-between gap-1 rounded-sm bg-festival-subtle px-1.5 text-[length:min(var(--text-caption),18px)] font-label text-festival"
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

  const festive = festivals.length > 0 || inSpan.length > 0;
  return (
    <Link
      {...link}
      aria-current={today ? "date" : undefined}
      className={`flex min-h-[4.125rem] min-w-0 flex-col items-start gap-0.5 rounded-cell px-[min(0.25rem,4px)] py-[min(0.375rem,6px)] text-left focus-ring ${
        today ? "border-2 border-accent" : "border border-transparent"
      } ${selected ? "bg-accent-subtle" : festive ? "bg-festival-subtle" : "bg-surface hover:bg-surface-sunken"}`}
    >
      <span
        aria-hidden="true"
        className="flex w-full items-center justify-between gap-0.5"
      >
        <span className="text-[length:min(var(--text-cell-date),22px)] leading-none font-display font-heading tracking-display">
          {dayNumber(c.date)}
        </span>
        {family.length > 0 && (
          <span className="block size-2 flex-none rounded-full bg-accent" />
        )}
      </span>
      {day && (
        <span
          aria-hidden="true"
          data-cell-label
          className="flex flex-wrap items-center gap-x-1 text-[length:min(var(--text-tiny),11px)] leading-tight text-text-muted"
        >
          {(day.tithi.atSunrise === 15 || day.tithi.atSunrise === 30) && (
            <MoonDot full={day.tithi.atSunrise === 15} />
          )}
          {cellTithi(day.tithi.atSunrise)}
        </span>
      )}
      <span
        aria-hidden="true"
        className="flex flex-wrap items-center gap-1 text-[length:min(var(--text-tiny),11px)] leading-tight font-strong"
      >
        {twoDay && <span className="text-text">{t("twoDayMark")}</span>}
        {skipped.length > 0 && (
          <span className="rounded-sm border border-dashed border-border-strong px-0.5">
            {t("skipMark")}
          </span>
        )}
      </span>
      {festivals.map((f) => (
        <span
          key={f.id}
          aria-hidden="true"
          data-cell-label
          // Never split a name: a word a hair too wide (font rendering varies by OS) spills into
          // the cell padding instead; names with spaces still wrap between words.
          className="max-w-full text-[length:min(var(--text-tiny),10.5px)] leading-tight font-strong tracking-tight text-festival [overflow-wrap:normal]"
        >
          {festivalShortName(f.id, lang()) ?? f.names[lang()]}
          {/* The dev-only marker may wrap on its own rather than break the name. */}
          {f.unverified && (
            <>
              <wbr />*
            </>
          )}
        </span>
      ))}
      <span className="sr-only">{label}</span>
    </Link>
  );
}

/** Punam: a pale full moon; Amas: a dark new moon (each also named in text). */
const MoonDot = ({ full }: { full: boolean }) => (
  <span
    className={`block size-2.5 flex-none rounded-full border border-border-strong ${full ? "bg-moon-lit" : "bg-moon-dark"}`}
  />
);

const roundBtn =
  "flex size-12 items-center justify-center rounded-full border border-border bg-surface text-title text-accent hover:bg-accent-subtle focus-ring";

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
        <span className="block size-5 rounded-md border-2 border-accent" />
        {t("keyToday")}
      </li>
      <li className={item}>
        <MoonDot full />
        {t("keyPunam")}
      </li>
      <li className={item}>
        <MoonDot full={false} />
        {t("keyAmas")}
      </li>
      {hasFestivals && (
        <li className={item}>
          <span className="block size-4 rounded-sm bg-festival-subtle ring-1 ring-festival" />
          {t("keyFestival")}
        </li>
      )}
      <li className={item}>
        <span className="block size-2 rounded-full bg-accent" />
        {t("keyFamily")}
      </li>
      <li className={item}>
        <span className="font-strong">{t("twoDayMark")}</span>
        {t("keyTwoDay")}
      </li>
      <li className={item}>
        <span className="rounded-sm border border-dashed border-border-strong px-0.5 text-caption font-strong">
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

/** "This month": festivals and family dates in the month, each with a small coloured dot. */
function ThisMonth({
  month,
  festivals,
  family,
}: {
  month: YearMonth;
  festivals: readonly Festival[];
  family: readonly UpcomingRow[];
}) {
  const items = [
    ...festivals
      .filter((f) => f.date.startsWith(month))
      .map((f) => ({
        key: f.id + f.date,
        date: f.date,
        name: f.names[lang()],
        dot: "bg-festival",
      })),
    ...family
      .filter((r) => r.date.startsWith(month))
      .map((r) => ({
        key: r.event.id + r.date,
        date: r.date,
        name: r.event.title,
        dot: "bg-accent",
      })),
  ].sort((x, y) => x.date.localeCompare(y.date));
  return (
    <section aria-labelledby="this-month" className="mt-8 flex flex-col gap-3">
      <h2
        id="this-month"
        className="text-title font-display font-heading tracking-display"
      >
        {t("thisMonth")}
      </h2>
      {items.length === 0 ? (
        <p className="text-body text-text-muted">{t("noFestivalsMonth")}</p>
      ) : (
        <ul className="card flex flex-col divide-y divide-border">
          {items.map((it) => (
            <li key={it.key} className="flex items-center gap-3 px-card py-3">
              <span
                aria-hidden="true"
                className={`block size-2.5 flex-none rounded-full ${it.dot}`}
              />
              <span className="flex-1 font-label">{it.name}</span>
              <span className="text-sm text-text-muted">
                {dateShort(it.date)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
