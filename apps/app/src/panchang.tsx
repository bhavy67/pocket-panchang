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
  karanaDisplay,
  monthName,
  nakshatraName,
  tithiLabel,
  weekdayName,
  yogaName,
} from "@panchang/i18n";
import type { DayView } from "@/day-data";
import { useQuery } from "@tanstack/react-query";
import { lang, t } from "@/i18n";
import { dateLong, timeOn } from "@/lib/format";
import { moonQuery } from "@/queries";
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
  if (el.ends.length === 0) return t("allDayPastSunrise");
  return el.ends
    .map((e, k) =>
      k === 0
        ? t("elUntil", { time: timeOn(e.endsAt, tz, date) })
        : t("elThenUntil", {
            name: name(e.index),
            time: timeOn(e.endsAt, tz, date),
          }),
    )
    .concat(t("elThen", { name: name(next(el.ends.at(-1)!.index, count)) }))
    .join(t("listJoin"));
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
      label: t("elTithi"),
      el: day.tithi,
      count: COUNT.tithi,
      name: (i: number) => tithiLabel(i, lang()),
    },
    {
      label: t("elNakshatra"),
      el: day.nakshatra,
      count: COUNT.nakshatra,
      name: (i: number) => nakshatraName(i, lang()),
    },
    {
      label: t("elYoga"),
      el: day.yoga,
      count: COUNT.yoga,
      name: (i: number) => yogaName(i, lang()),
    },
    {
      label: t("elKarana"),
      el: day.karana,
      count: COUNT.karana,
      name: (i: number) => {
        const n = karanaDisplay(karanaName(i), lang());
        return karanaName(i) === "Vishti" ? t("vishtiBhadra", { name: n }) : n;
      },
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
                {t("changesToday")}
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
        <span className="text-sm text-text-muted">{t("weekday")}</span>
        <span className="text-lg leading-snug font-semibold">
          {lang() === "gu" ? (
            weekdayName(day.vara, "gu")
          ) : (
            <>
              {weekdayName(day.vara, "en")} ·{" "}
              <span lang="gu">{weekdayName(day.vara, "gu")}</span>
            </>
          )}
        </span>
        <span className="text-sm text-text-muted">{t("sunriseToSunrise")}</span>
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
          <strong className="font-semibold">{t("twoDayTithi")}</strong>{" "}
          {t("twoDayTithiText", { tithi: tithiLabel(el.atSunrise, lang()) })}
        </span>
      )}
      {el.kshaya.map((k) => (
        <span key={k} className="text-sm">
          <strong className="font-semibold">{t("skippedTithi")}</strong>{" "}
          {t("skippedTithiText", { tithi: tithiLabel(k, lang()) })}
        </span>
      ))}
    </>
  );
}

export function SunMoonCard({ view, s }: { view: DayView; s: Settings }) {
  const tz = s.location.tz;
  const { data: moon } = useQuery(moonQuery(s, view.date));
  const sunset = view.day.sunset.kind === "event" ? view.day.sunset.at : null;
  const cells = [
    [t("sunrise"), timeOn(view.day.sunrise, tz, view.date)],
    [t("sunset"), sunset === null ? "—" : timeOn(sunset, tz, view.date)],
    [
      t("moonrise"),
      moon
        ? moon.rise
          ? timeOn(moon.rise, tz, view.date)
          : t("noneToday")
        : "…",
    ],
    [
      t("moonset"),
      moon
        ? moon.set
          ? timeOn(moon.set, tz, view.date)
          : t("noneToday")
        : "…",
    ],
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
      return t("samvatVikram", { year: day.samvat.vikramKartikadi });
    case "vikram-chaitradi":
      return t("samvatVikramChaitra", { year: day.samvat.vikramChaitradi });
    case "shaka":
      return t("samvatShaka", { year: day.samvat.shaka });
  }
}

/** "How this is calculated" (brief §3.7), short form until the trust page lands. */
export const howSheet = (s: Settings, date: DayView["date"]): SheetContent => ({
  kicker: t("trust"),
  tone: "accent",
  title: t("howCalculated"),
  range: `${s.location.name} · ${dateLong(date)}`,
  body: t("howBody", { city: s.location.name }),
  note: t("howNote"),
  action: { label: t("readMore"), href: "/how", internal: true },
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
