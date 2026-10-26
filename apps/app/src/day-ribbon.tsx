// "Your day" ribbon (ADR 0024): one horizontal bar of the 8 day Choghadiya, a proportional
// lane of times many avoid beneath it, and a Now line through both. Segments are equal because
// Choghadiya are equal eighths of daylight; the lane is placed by real start and end times.
// When names don't fit (large text) the segments show initials; the legend always lists times.
import type { Choghadiya } from "@panchang/calendar";
import type { Instant } from "@panchang/engine";
import { Link } from "@tanstack/react-router";
import type { DayView } from "@/day-data";
import { t } from "@/i18n";
import { range, time, timeShort } from "@/lib/format";
import {
  avoidPeriods,
  avoidSheet,
  chogName,
  chogSheet,
  qualityLabel,
  type Avoid,
} from "@/timeline";
import type { SheetContent } from "@/ui";

const pct = (v: number) => `${(Math.max(0, Math.min(1, v)) * 100).toFixed(2)}%`;

const segmentStyle = (c: Choghadiya) =>
  c.name === "Amrut"
    ? "bg-auspicious text-surface"
    : c.quality === "good"
      ? "bg-auspicious-subtle text-auspicious"
      : c.quality === "bad"
        ? "bg-inauspicious-subtle text-inauspicious"
        : "bg-surface-sunken text-text-muted";

const laneStyle = (a: Avoid) =>
  a.kind === "rahu"
    ? "bg-inauspicious"
    : a.kind === "bhadra"
      ? "hatch border border-inauspicious"
      : "bg-inauspicious opacity-55";

export function DayRibbon({
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
  const sunrise = view.day.sunrise;
  const sunset = m.day.at(-1)!.end;
  const span = sunset - sunrise;
  const at = (x: number) => (x - sunrise) / span;
  // Bhadra first, so the solid and faded periods sit on top of its hatch where they overlap.
  const avoid = avoidPeriods(m)
    .filter((a) => a.end > sunrise && a.start < sunset)
    .sort((a, b) => Number(b.kind === "bhadra") - Number(a.kind === "bhadra"));
  const nowAt =
    now !== undefined && now >= sunrise && now < sunset ? at(now) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative pt-8">
        {nowAt !== null && now !== undefined && (
          <>
            <span
              aria-hidden="true"
              style={{ left: pct(nowAt) }}
              className="absolute top-0 -translate-x-1/2 rounded-full bg-accent px-2 py-0.5 text-[length:var(--text-micro)] font-strong whitespace-nowrap text-text-on-accent"
            >
              {t("now")} {timeShort(now, tz)}
            </span>
            <span
              aria-hidden="true"
              style={{ left: pct(nowAt) }}
              className="pointer-events-none absolute top-6 bottom-0 z-2 w-0.5 -translate-x-1/2 bg-accent"
            />
          </>
        )}
        <ul
          className="@container flex gap-(--ribbon-gap) text-[length:var(--text-micro)]"
          aria-label={t("yourDay")}
        >
          {m.day.map((c, i) => (
            <li key={c.start} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onOpen(chogSheet(c, m, tz))}
                className={`flex h-(--ribbon-h) w-full items-center justify-center px-0.5 font-strong focus-ring ${segmentStyle(c)} ${
                  i === 0
                    ? "rounded-l-(--ribbon-end-radius) rounded-r-(--ribbon-radius)"
                    : i === 7
                      ? "rounded-l-(--ribbon-radius) rounded-r-(--ribbon-end-radius)"
                      : "rounded-(--ribbon-radius)"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="truncate @max-[32em]:hidden"
                >
                  {chogName(c)}
                </span>
                <span aria-hidden="true" className="hidden @max-[32em]:inline">
                  {chogName(c).slice(0, 1)}
                </span>
                <span className="sr-only">
                  {chogName(c)}, {qualityLabel(c)}, {range(c.start, c.end, tz)}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div
          aria-hidden="true"
          className="relative mt-1.5 h-(--ribbon-lane-h) rounded-full bg-surface-sunken"
        >
          {avoid.map((a) => (
            <span
              key={a.name + a.start}
              style={{
                left: pct(at(a.start)),
                width: pct(
                  at(Math.min(a.end, sunset)) - Math.max(0, at(a.start)),
                ),
              }}
              className={`absolute inset-y-0 rounded-full ${laneStyle(a)}`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between text-sm text-text-muted">
        <span>
          {t("sunrise")}{" "}
          <span className="whitespace-nowrap">{time(sunrise, tz)}</span>
        </span>
        <span>
          {t("noon")}{" "}
          <span className="whitespace-nowrap">
            {time(((sunrise + sunset) / 2) as Instant, tz)}
          </span>
        </span>
        <span>
          {t("sunset")}{" "}
          <span className="whitespace-nowrap">{time(sunset, tz)}</span>
        </span>
      </div>

      <ul
        aria-label={t("timesManyAvoid")}
        className="grid grid-cols-[repeat(auto-fit,minmax(min(10rem,100%),1fr))] gap-2"
      >
        {avoidPeriods(m).map((a) => (
          <li key={a.name + a.start}>
            <button
              type="button"
              onClick={() => onOpen(avoidSheet(a, view, tz))}
              className="flex min-h-(--tap-min) w-full items-center gap-2 rounded-md px-2 text-left hover:bg-surface-sunken focus-ring"
            >
              <span
                aria-hidden="true"
                className={`block h-2.5 w-5 flex-none rounded-full ${laneStyle(a)}`}
              />
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-sm font-label">{a.name}</span>
                <span className="text-caption text-text-muted">
                  {range(a.start, a.end, tz)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Link
        to="/day"
        search={{ date: view.date }}
        hash="hours"
        className="self-start text-body font-label text-accent underline-offset-3 hover:underline focus-ring"
      >
        {t("seeAllPeriods")}
      </Link>
    </div>
  );
}
