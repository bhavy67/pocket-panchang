import {
  addDays,
  findCrossing,
  nakshatraAt,
  siderealSun,
  type CivilDate,
  type Coordinates,
  type Instant,
  type Lunation,
} from "@panchang/engine";
import { civilDayContaining, civilDaysOverlapping } from "./days";
import type {
  FestivalRule,
  Lang,
  SankrantiFestival,
  TithiFestival,
} from "./festival-types";
import { bhadraWithin, lunationsBetween, tithiInterval } from "./tithis";
import {
  tithiNumber,
  type CivilClock,
  type CivilDay,
  type Interval,
} from "./types";
import {
  coverage,
  subtract,
  windowInterval,
  type ObservanceWindow,
} from "./windows";

const DAY_MS = 86_400_000;

export type FestivalOccurrence = {
  readonly id: string;
  readonly names: Record<Lang, string>;
  readonly date: CivilDate;
  /** Last day of a multi-day festival (Navratri). */
  readonly endDate?: CivilDate;
  readonly variant?: {
    readonly group: string;
    readonly label: Record<Lang, string>;
  };
  /**
   * Holika Dahan (rules with `avoidBhadra`): the evening time to light it, i.e. the longest
   * stretch of the day's pradosh window inside the tithi and outside Bhadra. Absent when no
   * such stretch exists (the date is then a fallback).
   */
  readonly evening?: Interval;
  /** Raksha Bandhan: Bhadra ends at this instant on the day ("after Bhadra"). */
  readonly afterBhadra?: Instant;
  /** No candidate day covered the window; the day with most of the tithi was used (provisional). */
  readonly fallback?: boolean;
};

type Place = { readonly coordinates: Coordinates; readonly clock: CivilClock };

/** Picks the observance day for a tithi interval (§4.7, ADR 0018/0021). */
export function observanceDay(
  tithi: Interval,
  window: ObservanceWindow,
  tieBreak: TithiFestival["tieBreak"],
  place: Place,
  options: { holes?: readonly Interval[]; preferNakshatra?: number } = {},
): { day: CivilDay; fallback: boolean } {
  const days = civilDaysOverlapping(tithi, place.coordinates, place.clock);
  const spans = subtract(tithi, options.holes ?? []);
  const scored = days.map((day) => ({
    day,
    cov: coverage(windowInterval(window, day), spans),
  }));
  let covered = scored.filter((s) => s.cov > 0);
  if (covered.length === 0) {
    const most = scored.reduce(
      (best, s) => {
        const inDay = coverage(
          { start: s.day.sunrise, end: s.day.nextSunrise },
          [tithi],
        );
        return inDay > best.inDay ? { day: s.day, inDay } : best;
      },
      { day: scored[0]!.day, inDay: -1 },
    );
    return { day: most.day, fallback: true };
  }
  if (covered.length > 1 && options.preferNakshatra !== undefined) {
    const withStar = covered.filter((s) => {
      const w = windowInterval(window, s.day);
      return (
        nakshatraAt(((w.start + w.end) / 2) as Instant) ===
        options.preferNakshatra
      );
    });
    if (withStar.length === 1) covered = withStar;
  }
  const pick =
    tieBreak === "purva-vyapini"
      ? covered[0]!
      : tieBreak === "para-vyapini"
        ? covered.at(-1)!
        : covered.reduce((best, s) => (s.cov > best.cov ? s : best));
  return { day: pick.day, fallback: false };
}

function resolveTithi(
  rule: TithiFestival,
  lunation: Lunation,
  place: Place,
): FestivalOccurrence {
  const n = tithiNumber(rule.paksha, rule.tithi);
  const interval = tithiInterval(lunation, n);
  const bhadra = bhadraWithin(lunation, n, interval);
  const { day, fallback } = observanceDay(
    interval,
    rule.window,
    rule.tieBreak,
    place,
    {
      holes: rule.avoidBhadra && bhadra ? [bhadra] : [],
      ...(rule.extra?.nakshatra === undefined
        ? {}
        : { preferNakshatra: rule.extra.nakshatra }),
    },
  );
  const endDate = rule.span
    ? observanceDay(
        tithiInterval(
          lunation,
          tithiNumber(rule.span.end.paksha, rule.span.end.tithi),
        ),
        rule.window,
        rule.tieBreak,
        place,
      ).day.date
    : undefined;
  const afterBhadra =
    rule.bhadraTiming === "show-after" &&
    bhadra &&
    bhadra.end > day.sunrise &&
    bhadra.end < day.sunset
      ? bhadra.end
      : undefined;
  const evening = rule.avoidBhadra
    ? longest(
        clip(
          windowInterval(rule.window, day),
          subtract(interval, bhadra ? [bhadra] : []),
        ),
      )
    : undefined;
  return {
    id: rule.id,
    names: rule.names,
    date: day.date,
    ...(evening === undefined ? {} : { evening }),
    ...(endDate === undefined ? {} : { endDate }),
    ...(rule.variant ? { variant: rule.variant } : {}),
    ...(afterBhadra === undefined ? {} : { afterBhadra }),
    ...(fallback ? { fallback } : {}),
  };
}

/** Pieces of `spans` inside `window`. */
const clip = (window: Interval, spans: readonly Interval[]): Interval[] =>
  spans.flatMap((s) => {
    const start = Math.max(s.start, window.start) as Instant;
    const end = Math.min(s.end, window.end) as Instant;
    return start < end ? [{ start, end }] : [];
  });

const longest = (spans: readonly Interval[]): Interval | undefined =>
  spans.reduce<Interval | undefined>(
    (best, s) => (!best || s.end - s.start > best.end - best.start ? s : best),
    undefined,
  );

function resolveSankranti(
  rule: SankrantiFestival,
  from: Instant,
  to: Instant,
  place: Place,
): FestivalOccurrence[] {
  const out: FestivalOccurrence[] = [];
  let t = from;
  for (;;) {
    const at = findCrossing((x) => siderealSun(x), rule.rashi * 30, t, to, {
      stepMs: 10 * DAY_MS,
    });
    if (at === null) return out;
    const day = civilDayContaining(at, place.coordinates, place.clock);
    const date =
      rule.afterSunset === "next-day" && at > day.sunset
        ? addDays(day.date, 1)
        : day.date;
    out.push({ id: rule.id, names: rule.names, date });
    t = (at + 300 * DAY_MS) as Instant;
  }
}

/**
 * All festival occurrences whose date falls in [from, to] at a place. Tithi festivals use the
 * nija month only (adhik months are skipped); a month absorbed in a kshaya cycle counts (ADR 0008).
 */
export function resolveFestivals(
  rules: readonly FestivalRule[],
  from: CivilDate,
  to: CivilDate,
  place: Place,
): FestivalOccurrence[] {
  const start = place.clock.localMidnight(from);
  const end = place.clock.localMidnight(addDays(to, 1));
  const lunations = lunationsBetween(
    (start - 40 * DAY_MS) as Instant,
    (end + 40 * DAY_MS) as Instant,
  );
  const resolved: FestivalOccurrence[] = [];
  for (const rule of rules) {
    if (rule.kind === "tithi") {
      for (const l of lunations) {
        if (!l.adhik && (l.name === rule.month || l.absorbs === rule.month))
          resolved.push(resolveTithi(rule, l, place));
      }
    } else if (rule.kind === "sankranti") {
      resolved.push(
        ...resolveSankranti(
          rule,
          (start - 40 * DAY_MS) as Instant,
          (end + 40 * DAY_MS) as Instant,
          place,
        ),
      );
    }
  }
  for (const rule of rules) {
    if (rule.kind !== "relative") continue;
    for (const base of resolved.filter((o) => o.id === rule.of)) {
      resolved.push({
        id: rule.id,
        names: rule.names,
        date: addDays(base.date, rule.offsetDays),
      });
    }
  }
  return resolved
    .filter((o) => o.date >= from && o.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

/**
 * Rendering rule for variants (ADR 0018): if every variant in a group falls on the same day,
 * keep one occurrence without its label; otherwise keep all, labelled.
 */
export function collapseVariants(
  occurrences: readonly FestivalOccurrence[],
): FestivalOccurrence[] {
  const out: FestivalOccurrence[] = [];
  const done = new Set<FestivalOccurrence>();
  for (const o of occurrences) {
    if (done.has(o)) continue;
    if (!o.variant) {
      out.push(o);
      continue;
    }
    // Variants of the same festival instance: same group, within 3 days of each other.
    const siblings = occurrences.filter(
      (x) =>
        x.variant?.group === o.variant!.group &&
        Math.abs(Date.parse(x.date) - Date.parse(o.date)) <= 3 * DAY_MS,
    );
    siblings.forEach((s) => done.add(s));
    if (siblings.every((s) => s.date === o.date)) {
      const { variant: _variant, ...rest } = o;
      void _variant;
      out.push(rest);
    } else out.push(...siblings);
  }
  return out;
}
