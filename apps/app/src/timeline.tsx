// "Today, hour by hour" (approved Today design, decision 4): vertical, sunrise → sunset, the 8
// Choghadiya plus a "Times many avoid" lane on a proportional time axis. Each avoid period is
// placed from its own start and end inside every row it crosses, so Bhadra ending at 2:47 PM
// sits two-thirds into a 1:50–3:16 PM row, never snapped to a tile edge.
import type { Choghadiya, DayMuhurta, Interval } from "@panchang/calendar";
import type { Instant } from "@panchang/engine";
import { useState } from "react";
import type { DayView } from "@/day-data";
import { choghadiyaName } from "@panchang/i18n";
import { lang, t } from "@/i18n";
import { range, time, timeShort } from "@/lib/format";
import { card, QualityIcon, type SheetContent, type Tone } from "@/ui";

// ---- Domain → display ----

export const qualityLabel = (c: Choghadiya) =>
  t(
    c.name === "Amrut"
      ? "qBest"
      : c.quality === "good"
        ? "qGood"
        : c.quality === "bad"
          ? "qBad"
          : "qNeutral",
  );

/** Display name of a Choghadiya in the UI language. */
export const chogName = (c: Choghadiya) => choghadiyaName(c.name, lang());

export const toneOf = (c: Choghadiya): Tone => c.quality;

const rowStyle = (c: Choghadiya) =>
  c.name === "Amrut"
    ? "bg-(--chip-auspicious-bg) border-auspicious"
    : c.quality === "good"
      ? "bg-(--chip-auspicious-bg) border-transparent"
      : c.quality === "bad"
        ? "bg-surface-sunken border-transparent"
        : "bg-surface border-border";

const qualityInk = (c: Choghadiya) =>
  c.quality === "good" ? "text-auspicious" : "text-text-muted";

export type Avoid = Interval & {
  /** Display name in the UI language. */
  readonly name: string;
  readonly kind: "rahu" | "soft" | "bhadra";
};

/** Every avoid period of the day: Rahu Kaal (strong), Yamaganda and Gulika (soft), Bhadra. */
export function avoidPeriods(m: DayMuhurta): Avoid[] {
  return [
    rahuAvoid(m),
    { ...m.yamaganda, name: t("yamaganda"), kind: "soft" as const },
    { ...m.gulika, name: t("gulika"), kind: "soft" as const },
    ...m.bhadra.map((b) => ({
      ...b,
      name: t("bhadra"),
      kind: "bhadra" as const,
    })),
  ];
}

export const rahuAvoid = (m: DayMuhurta): Avoid => ({
  ...m.rahuKaal,
  name: t("rahuKaal"),
  kind: "rahu",
});

export function chogSheet(
  c: Choghadiya,
  m: DayMuhurta,
  tz: string,
): SheetContent {
  const r = m.rahuKaal;
  const overlapsRahu = c.start < r.end && r.start < c.end;
  return {
    kicker: t("chogKicker", { quality: qualityLabel(c) }),
    tone: c.quality === "good" ? "good" : "muted",
    title: chogName(c),
    range: range(c.start, c.end, tz),
    body: t("chogBody"),
    ...(overlapsRahu && c.quality === "good"
      ? {
          note: t("chogRahuNote", { range: range(r.start, r.end, tz) }),
        }
      : {}),
  };
}

export function avoidSheet(a: Avoid, view: DayView, tz: string): SheetContent {
  const { sunrise } = view.day;
  const sunset = view.muhurta?.day.at(-1)?.end ?? view.day.nextSunrise;
  const when =
    a.start < sunrise
      ? t("avoidUntilBeforeSunrise", { time: time(a.end, tz) })
      : a.end > sunset
        ? t("avoidFromAfterSunset", {
            time: time(a.start, tz),
            end: time(a.end, tz),
          })
        : range(a.start, a.end, tz);
  return {
    kicker: t("avoidKicker"),
    tone: "rahu",
    title: a.kind === "bhadra" ? t("bhadraFull") : a.name,
    range: when,
    body: t(
      a.kind === "rahu"
        ? "rahuBody"
        : a.kind === "bhadra"
          ? "bhadraBody"
          : "softAvoidBody",
    ),
  };
}

// ---- Geometry ----

const pct = (v: number) => `${(Math.max(0, Math.min(1, v)) * 100).toFixed(2)}%`;
/** Where an interval sits inside one row: top/bottom insets, or null if it misses the row. */
function segment(a: Interval, row: Interval, first: boolean, last: boolean) {
  if (a.end <= row.start || a.start >= row.end) return null;
  const dur = row.end - row.start;
  const contTop = a.start < row.start && !first;
  const contBottom = a.end > row.end && !last;
  return {
    // Continuing segments reach across the 4 px row gap so the block reads as one.
    top: contTop
      ? "-4px"
      : pct((Math.max(a.start, row.start) - row.start) / dur),
    bottom: contBottom
      ? "-4px"
      : pct((row.end - Math.min(a.end, row.end)) / dur),
    startsHere: a.start >= row.start || first,
    endsHere: a.end <= row.end || last,
  };
}

// ---- Components ----

// Fixed px for the lane geometry: the lanes are capped like their labels (decision 5).
const COLS = "grid grid-cols-[44px_minmax(0,1fr)_120px] gap-[6px]";
/** Lane labels stop growing at ~115% text (design decision 5). */
const laneText =
  "text-[length:min(var(--text-caption),17px)] font-semibold leading-tight";

export function Timeline({
  view,
  tz,
  now,
  onOpen,
}: {
  view: DayView;
  tz: string;
  now?: Instant;
  onOpen: (s: SheetContent) => void;
}) {
  const m = view.muhurta!;
  const avoid = avoidPeriods(m);
  const blocks = avoid.filter((a) => a.kind !== "bhadra");
  const stripes = avoid.filter((a) => a.kind === "bhadra");
  const rows = m.day;
  const nowRow =
    now === undefined
      ? -1
      : rows.findIndex((c) => now >= c.start && now < c.end);
  // Label each Bhadra stripe in the first row it fully covers that has no other block.
  const stripeLabelRow = stripes.map((s) =>
    rows.findIndex(
      (r) =>
        s.start <= r.start &&
        s.end >= r.end &&
        !blocks.some((b) => b.start < r.end && b.end > r.start),
    ),
  );
  const avoidAria = (a: Avoid) =>
    t("avoidAria", {
      name: a.name,
      from:
        a.start < view.day.sunrise
          ? t("fromBeforeSunrise")
          : t("fromTime", { time: time(a.start, tz) }),
      end: time(a.end, tz),
    });

  return (
    <div>
      <ul
        aria-label={t("key")}
        className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-sm"
      >
        <li className="flex items-center gap-1.5">
          <QualityIcon tone="good" size={20} />
          {t("keyGood")}
        </li>
        <li className="flex items-center gap-1.5">
          <QualityIcon tone="neutral" size={20} />
          {t("keyNeutral")}
        </li>
        <li className="flex items-center gap-1.5">
          <QualityIcon tone="bad" size={20} />
          {t("keyBad")}
        </li>
        <li className="flex items-center gap-1.5 font-semibold text-inauspicious">
          <QualityIcon tone="rahu" size={20} />
          {t("rahuKaal")}
        </li>
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="block h-5 w-2 rounded-b bg-border-strong"
          />
          {t("bhadra")}
        </li>
      </ul>

      <div
        className={`${COLS} mb-2 text-caption font-semibold text-text-muted`}
      >
        <span />
        <span>{t("choghadiya")}</span>
        <span>{t("timesManyAvoid")}</span>
      </div>

      <div className="mb-2 flex items-center gap-1.5 text-sm tabular-nums">
        <span className="flex w-11 flex-none justify-center">
          <span className="block size-3.5 rounded-full border-[2.5px] border-warning" />
        </span>
        <span>
          <strong className="font-semibold">{t("sunrise")}</strong>{" "}
          {time(view.day.sunrise, tz)}
        </span>
      </div>

      <div className="relative isolate flex flex-col gap-1">
        {rows.map((c, i) => {
          const first = i === 0;
          const last = i === rows.length - 1;
          return (
            <div
              key={c.start}
              role="group"
              className={`relative ${COLS} min-h-15`}
            >
              <span />
              <button
                type="button"
                onClick={() => onOpen(chogSheet(c, m, tz))}
                className={`flex min-h-(--tap-min) min-w-0 items-center rounded-md border-[1.5px] px-3 py-2 text-left focus-ring ${rowStyle(c)}`}
              >
                <span
                  className={`relative z-3 flex items-start gap-2 rounded-sm pr-1 pb-px ${rowStyle(c)} border-0`}
                >
                  <span className="mt-px">
                    <QualityIcon tone={toneOf(c)} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-body leading-tight">
                      <strong className="font-semibold">{chogName(c)}</strong>{" "}
                      <span
                        className={`text-sm font-semibold ${qualityInk(c)}`}
                      >
                        · {qualityLabel(c)}
                      </span>
                    </span>
                    <span className="text-caption leading-snug text-text-muted tabular-nums">
                      {range(c.start, c.end, tz)}
                    </span>
                    {i === nowRow && (
                      <span className="sr-only">{t("happeningNow")}</span>
                    )}
                  </span>
                </span>
              </button>
              <div className="relative">
                {stripes.map((s, k) => {
                  const g = segment(s, c, first, last);
                  return (
                    g && (
                      <button
                        key={`s${k}`}
                        type="button"
                        onClick={() => onOpen(avoidSheet(s, view, tz))}
                        aria-label={avoidAria(s)}
                        style={{ top: g.top, bottom: g.bottom }}
                        className="absolute left-0 w-[24px] focus-ring"
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute inset-y-0 left-0 w-[12px] bg-border-strong ${g.endsHere ? "rounded-b-md" : ""} ${g.startsHere && s.start >= view.day.sunrise ? "rounded-t-md" : ""}`}
                        />
                      </button>
                    )
                  );
                })}
                {blocks.map((b) => {
                  const g = segment(b, c, first, last);
                  const strong = b.kind === "rahu";
                  return (
                    g && (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => onOpen(avoidSheet(b, view, tz))}
                        aria-label={avoidAria(b)}
                        style={{ top: g.top, bottom: g.bottom }}
                        className={`absolute right-0 left-[28px] flex items-start overflow-hidden rounded-md p-[6px] text-left focus-ring ${strong ? "border-[1.5px] border-inauspicious bg-(--chip-inauspicious-bg)" : "border-[1.5px] border-dashed border-border-strong bg-surface-sunken"}`}
                      >
                        {g.startsHere && (
                          <span
                            className={`relative z-3 flex min-w-0 flex-col items-start gap-0.5 pr-0.5 ${strong ? "bg-(--chip-inauspicious-bg) text-inauspicious" : "bg-surface-sunken text-text"}`}
                          >
                            <QualityIcon
                              tone={strong ? "rahu" : "bad"}
                              size={16}
                            />
                            <span className={laneText}>{b.name}</span>
                          </span>
                        )}
                      </button>
                    )
                  );
                })}
                {stripes.map(
                  (s, k) =>
                    stripeLabelRow[k] === i && (
                      <div
                        key={`l${k}`}
                        className="absolute inset-x-0 top-1 bottom-1 flex items-center"
                      >
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-hidden="true"
                          onClick={() => onOpen(avoidSheet(s, view, tz))}
                          className="flex min-h-(--tap-min) w-full flex-col items-start gap-px rounded-md border-[1.5px] border-border-strong bg-surface-sunken px-[8px] py-[6px] text-left"
                        >
                          <span className="relative z-3 flex items-center gap-1 bg-surface-sunken">
                            <QualityIcon tone="bad" size={16} />
                            <span className={laneText}>{s.name}</span>
                          </span>
                          <span
                            className={`relative z-3 bg-surface-sunken text-text-muted tabular-nums ${laneText} font-normal`}
                          >
                            {t("untilTime", { time: time(s.end, tz) })}
                          </span>
                        </button>
                      </div>
                    ),
                )}
              </div>
              {i === nowRow && now !== undefined && (
                <div
                  aria-hidden="true"
                  style={{ top: pct((now - c.start) / (c.end - c.start)) }}
                  className="pointer-events-none absolute inset-x-0 z-2 flex -translate-y-1/2 items-center"
                >
                  <span className="flex w-11 flex-none flex-col items-center rounded-sm bg-(--timeline-now) py-0.5 leading-tight text-text-on-accent">
                    <span className="text-[length:13px] font-bold">
                      {t("now")}
                    </span>
                    <span className="text-[length:13px] tabular-nums">
                      {timeShort(now, tz)}
                    </span>
                  </span>
                  <span className="h-0.75 flex-1 bg-(--timeline-now)" />
                  <span className="-ml-1.25 size-2.5 flex-none rounded-full bg-(--timeline-now)" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-sm tabular-nums">
        <span className="flex w-11 flex-none justify-center">
          <span className="block size-3.5 rounded-full bg-text-muted" />
        </span>
        <span>
          <strong className="font-semibold">{t("sunset")}</strong>{" "}
          {time(rows.at(-1)!.end, tz)}
        </span>
      </div>
    </div>
  );
}

/** Night Choghadiya, sunset → next sunrise; collapsible on Today, open on Day detail. */
export function NightChoghadiya({
  m,
  tz,
  initiallyOpen = false,
  onOpen,
}: {
  m: DayMuhurta;
  tz: string;
  initiallyOpen?: boolean;
  onOpen: (s: SheetContent) => void;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="mt-4 flex min-h-(--tap-min) w-full items-center justify-between gap-2 rounded-md border-[1.5px] border-border-strong bg-surface px-4 py-3 text-body font-semibold text-accent hover:bg-accent-subtle focus-ring"
      >
        <span>{open ? t("hideNight") : t("showNight")}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={open ? "rotate-180" : ""}
        >
          <path
            d="M5 8l5 5 5-5"
            fill="none"
            className="stroke-accent"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <ul className={`mt-2 overflow-hidden ${card}`}>
          {m.night.map((c) => (
            <li
              key={c.start}
              className="border-t border-border first:border-t-0"
            >
              <button
                type="button"
                onClick={() => onOpen(chogSheet(c, m, tz))}
                className="flex min-h-(--tap-min) w-full items-center gap-3 px-4 py-3 text-left focus-ring"
              >
                <QualityIcon tone={toneOf(c)} />
                <span className="flex flex-1 flex-col">
                  <span className="text-body leading-tight font-semibold">
                    {chogName(c)}
                  </span>
                  <span className={`text-sm font-semibold ${qualityInk(c)}`}>
                    {qualityLabel(c)}
                  </span>
                </span>
                <span className="text-right text-sm text-text-muted tabular-nums">
                  {range(c.start, c.end, tz)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
