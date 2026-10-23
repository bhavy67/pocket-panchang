// Panchang element display shared by Today and Day detail.
import {
  ENGINE_VERSION,
  karanaName,
  type CivilDate,
  type ElementDay,
  type Instant,
  type PanchangDay,
} from "@panchang/engine";
import {
  monthName,
  nakshatraName,
  tithiLabel,
  weekdayName,
  yogaName,
} from "@panchang/i18n";
import type { DayView } from "@/day-data";
import { dateLong, timeOn } from "@/lib/format";
import type { Settings } from "@/settings";
import { card, type SheetContent } from "@/ui";

const COUNT = { tithi: 30, nakshatra: 27, yoga: 27, karana: 60 } as const;
const next = (i: number, count: number) => (i % count) + 1;

/** Index of the element running at `now` within the day. */
export function indexAt(el: ElementDay, count: number, now: Instant) {
  let i = el.atSunrise;
  for (const e of el.ends) if (now >= e.endsAt) i = next(e.index, count);
  return i;
}

/** "Until 2:47 PM, then Sud 12" (+ further changes). Vriddhi: runs past the next sunrise. */
function untilText(
  el: ElementDay,
  count: number,
  name: (i: number) => string,
  tz: string,
  date: CivilDate,
) {
  if (el.ends.length === 0) return "All day, and past the next sunrise";
  return el.ends
    .map(
      (e, k) =>
        `${k === 0 ? "Until" : `then ${name(e.index)} until`} ${timeOn(e.endsAt, tz, date)}`,
    )
    .concat(`then ${name(next(el.ends.at(-1)!.index, count))}`)
    .join(", ");
}

export function tithiTitle(day: PanchangDay, tithi: number) {
  // After Amas ends the next lunar month has begun; its name (and adhik status) isn't in this
  // day's data, so show the tithi alone for those few hours.
  const wrapped = tithi < day.tithi.atSunrise;
  const m = (lang: "en" | "gu") =>
    wrapped ? "" : `${monthName(day.month.name, lang, day.month.adhik)} `;
  return {
    en: `${m("en")}${tithiLabel(tithi, "en")}`,
    gu: `${m("gu")}${tithiLabel(tithi, "gu")}`,
  };
}

export function ElementsCard({ view, tz }: { view: DayView; tz: string }) {
  const { day } = view;
  const rows = [
    {
      label: "Tithi (lunar day)",
      el: day.tithi,
      count: COUNT.tithi,
      name: (i: number) => tithiLabel(i, "en"),
    },
    {
      label: "Nakshatra (star)",
      el: day.nakshatra,
      count: COUNT.nakshatra,
      name: (i: number) => nakshatraName(i, "en"),
    },
    {
      label: "Yoga",
      el: day.yoga,
      count: COUNT.yoga,
      name: (i: number) => yogaName(i, "en"),
    },
    {
      label: "Karana (half of a tithi)",
      el: day.karana,
      count: COUNT.karana,
      name: (i: number) =>
        karanaName(i) === "Vishti" ? "Vishti (Bhadra)" : karanaName(i),
    },
  ];
  return (
    <div className={`overflow-hidden ${card}`}>
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex flex-col gap-0.5 border-t border-border px-5 py-4 first:border-t-0"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <span className="text-sm text-text-muted">{r.label}</span>
            {r.el.ends.length > 0 && (
              <span className="rounded-sm bg-warning-subtle px-2 py-0.5 text-caption font-semibold text-warning">
                Changes today
              </span>
            )}
          </div>
          <span className="text-lg leading-snug font-semibold">
            {r.name(r.el.atSunrise)}
          </span>
          <span className="text-sm text-text-muted tabular-nums">
            {untilText(r.el, r.count, r.name, tz, view.date)}
          </span>
          {r.el === day.tithi && <TithiMarkers el={r.el} />}
        </div>
      ))}
      <div className="flex flex-col gap-0.5 border-t border-border px-5 py-4">
        <span className="text-sm text-text-muted">Weekday</span>
        <span className="text-lg leading-snug font-semibold">
          {weekdayName(day.vara, "en")} ·{" "}
          <span lang="gu">{weekdayName(day.vara, "gu")}</span>
        </span>
        <span className="text-sm text-text-muted">Sunrise to next sunrise</span>
      </div>
    </div>
  );
}

/** Two-day and skipped tithis, in words (never colour alone). */
function TithiMarkers({ el }: { el: ElementDay }) {
  return (
    <>
      {el.vriddhi && (
        <span className="text-sm">
          <strong className="font-semibold">Two-day tithi:</strong>{" "}
          {tithiLabel(el.atSunrise, "en")} is also the tithi at tomorrow's
          sunrise.
        </span>
      )}
      {el.kshaya.map((k) => (
        <span key={k} className="text-sm">
          <strong className="font-semibold">Skipped tithi:</strong>{" "}
          {tithiLabel(k, "en")} begins and ends today, so no day is named after
          it.
        </span>
      ))}
    </>
  );
}

export function SunCard({ view, tz }: { view: DayView; tz: string }) {
  const sunset = view.day.sunset.kind === "event" ? view.day.sunset.at : null;
  const cells = [
    ["Sunrise", timeOn(view.day.sunrise, tz, view.date)],
    ["Sunset", sunset === null ? "—" : timeOn(sunset, tz, view.date)],
  ];
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(10rem,100%),1fr))] gap-px overflow-hidden rounded-lg bg-border shadow-(--elevation-1)">
      {cells.map(([k, v]) => (
        <div key={k} className="flex flex-col bg-surface px-5 py-4">
          <span className="text-sm text-text-muted">{k}</span>
          <span className="text-lg font-semibold tabular-nums">{v}</span>
        </div>
      ))}
    </div>
  );
}

export function samvatLine(day: PanchangDay, s: Settings) {
  switch (s.samvat) {
    case "vikram-kartikadi":
      return `Vikram Samvat ${day.samvat.vikramKartikadi}`;
    case "vikram-chaitradi":
      return `Vikram Samvat ${day.samvat.vikramChaitradi} (Chaitra start)`;
    case "shaka":
      return `Shaka Samvat ${day.samvat.shaka}`;
  }
}

/** "How this is calculated" (brief §3.7), short form until the trust page lands. */
export const howSheet = (s: Settings, date: DayView["date"]): SheetContent => ({
  kicker: "Trust",
  tone: "accent",
  title: "How this is calculated",
  range: `${s.location.name} · ${dateLong(date)}`,
  body: `Times use sunrise and sunset in ${s.location.name}. The tithi comes from the angle between the Sun and the Moon at sunrise. Everything is worked out on your phone; nothing is sent anywhere.`,
  note: "If a date or time looks different from your printed calendar, please tell us.",
  action: { label: "Report a mismatch", href: mismatchUrl(s, date) },
});

/** Pre-filled GitHub issue (§9 trust surfaces): date, city, settings, engine version. */
export function mismatchUrl(s: Settings, date: DayView["date"]) {
  const body = [
    `Date: ${date}`,
    `City: ${s.location.name} (${s.location.id}, ${s.location.tz})`,
    `Year style: ${s.samvat} · Tradition: ${s.tradition}`,
    `Engine version: ${ENGINE_VERSION}`,
    "",
    "What looks different, and what does your printed calendar show?",
  ].join("\n");
  const q = new URLSearchParams({
    title: `Mismatch on ${date} in ${s.location.name}`,
    body,
  });
  return `https://github.com/bhavy67/pocket-panchang/issues/new?${q}`;
}
