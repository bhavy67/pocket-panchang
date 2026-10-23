import { DEFAULT_AYANAMSA, type AyanamsaVariant } from "./ayanamsa";
import {
  isVishti,
  karanaAt,
  karanaEnds,
  nakshatraAt,
  nakshatraEnds,
  yogaAt,
  yogaEnds,
} from "./elements";
import { findCrossing } from "./crossing";
import { elongation } from "./longitude";
import { lunationAt, samvatAt, type LunarMonth, type Samvat } from "./months";
import type { SegmentEnd } from "./segments";
import {
  DEFAULT_SUNRISE,
  nextSunrise,
  nextSunset,
  type Coordinates,
  type SunEvent,
  type SunriseDefinition,
} from "./sun";
import { segmentEnds } from "./segments";
import { tithiAt } from "./tithi";
import type { Instant } from "./time";

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/** One element over a civil day (sunrise → next sunrise], §4.5. */
export type ElementDay = {
  /** The element prevailing at sunrise; it names the day. */
  readonly atSunrise: number;
  /** Every end in (sunrise, next sunrise], in order. */
  readonly ends: readonly SegmentEnd[];
  /** The sunrise element is still running at the next sunrise (present at two sunrises). */
  readonly vriddhi: boolean;
  /** Elements that begin and end inside the day (present at no sunrise). */
  readonly kshaya: readonly number[];
};

export type PanchangDay = {
  readonly kind: "day";
  readonly sunrise: Instant;
  readonly nextSunrise: Instant;
  readonly sunset: SunEvent;
  /** Weekday of the sunrise-to-sunrise day, 0 = Ravivara (Sunday). */
  readonly vara: number;
  readonly tithi: ElementDay;
  readonly paksha: "shukla" | "krishna";
  readonly nakshatra: ElementDay;
  readonly yoga: ElementDay;
  readonly karana: ElementDay;
  /** Vishti karana windows overlapping the day; `start` may precede sunrise (ADR 0018). */
  readonly bhadra: readonly {
    readonly start: Instant;
    readonly end: Instant;
  }[];
  /** Amanta month at sunrise. */
  readonly month: {
    readonly name: LunarMonth;
    readonly adhik: boolean;
    readonly absorbs: LunarMonth | null;
  };
  readonly samvat: Samvat;
};

/** No sunrise within 48 h: polar day or night (§4.4). */
export type NoCivilDay = {
  readonly kind: "no-civil-day";
  readonly sunUp: boolean;
};

export type DayOptions = {
  readonly sunrise?: SunriseDefinition;
  readonly ayanamsa?: AyanamsaVariant;
};

function elementDay(atSunrise: number, ends: SegmentEnd[]): ElementDay {
  return {
    atSunrise,
    ends,
    vriddhi: ends.length === 0,
    kshaya: ends.slice(1).map((e) => e.index),
  };
}

/**
 * Full panchang for one civil day at a place (§4.5).
 *
 * `localMidnight` is the UTC instant of 00:00 local time on the requested civil date. The
 * caller computes it from the location's IANA zone: the engine bans Intl (§5.2 rule 3).
 */
export function assembleDay(
  localMidnight: Instant,
  at: Coordinates,
  options: DayOptions = {},
): PanchangDay | NoCivilDay {
  const definition = options.sunrise ?? DEFAULT_SUNRISE;
  const variant = options.ayanamsa ?? DEFAULT_AYANAMSA;
  const first = nextSunrise(localMidnight, at, definition);
  if (first.kind === "none")
    return { kind: "no-civil-day", sunUp: first.sunUp };
  const sunrise = first.at;
  const second = nextSunrise(sunrise, at, definition);
  const nextSunriseAt =
    second.kind === "event" ? second.at : ((sunrise + DAY_MS) as Instant);

  const tithi = elementDay(
    tithiAt(sunrise),
    segmentEnds(elongation, 30, sunrise, nextSunriseAt),
  );
  const karana = elementDay(
    karanaAt(sunrise),
    karanaEnds(sunrise, nextSunriseAt),
  );
  const lunation = lunationAt(sunrise, variant);

  return {
    kind: "day",
    sunrise,
    nextSunrise: nextSunriseAt,
    sunset: nextSunset(sunrise, at, definition),
    // Weekday from local mean solar time at sunrise (no time zone needed).
    vara:
      (Math.floor((sunrise + (at.longitude / 15) * HOUR_MS) / DAY_MS) + 4) % 7,
    tithi,
    paksha: tithi.atSunrise <= 15 ? "shukla" : "krishna",
    nakshatra: elementDay(
      nakshatraAt(sunrise, variant),
      nakshatraEnds(sunrise, nextSunriseAt, variant),
    ),
    yoga: elementDay(
      yogaAt(sunrise, variant),
      yogaEnds(sunrise, nextSunriseAt, variant),
    ),
    karana,
    bhadra: bhadraWindows(sunrise, nextSunriseAt, karana),
    month: {
      name: lunation.name,
      adhik: lunation.adhik,
      absorbs: lunation.absorbs,
    },
    samvat: samvatAt(sunrise, variant),
  };
}

/** Vishti windows overlapping (sunrise, next sunrise]. A karana lasts < 14 h. */
function bhadraWindows(
  sunrise: Instant,
  next: Instant,
  karana: ElementDay,
): { start: Instant; end: Instant }[] {
  const windows: { start: Instant; end: Instant }[] = [];
  // Karana spans in the day: span i runs from ends[i − 1] (or its true start before sunrise)
  // to ends[i] (or its true end after the next sunrise).
  let index = karana.atSunrise;
  let start: Instant | null = null; // unknown for the sunrise karana until searched
  for (let i = 0; i <= karana.ends.length; i++) {
    const end = karana.ends[i]?.endsAt ?? null;
    if (isVishti(index)) {
      const from = start ?? karanaStart(sunrise, index);
      const to = end ?? karanaEnd(next, index);
      windows.push({ start: from, end: to });
    }
    start = end;
    index = (index % 60) + 1;
    if (end === null) break;
  }
  return windows;
}

/** Start of the karana `index` running at `t` (searched up to 14 h back). */
function karanaStart(t: Instant, index: number): Instant {
  const found = findCrossing(
    elongation,
    ((index - 1) * 6) % 360,
    (t - 14 * HOUR_MS) as Instant,
    t,
  );
  if (found === null) throw new Error("karana start not found within 14 h");
  return found;
}

/** End of the karana `index` running at `t` (searched up to 14 h ahead). */
function karanaEnd(t: Instant, index: number): Instant {
  const found = findCrossing(
    elongation,
    (index * 6) % 360,
    t,
    (t + 14 * HOUR_MS) as Instant,
  );
  if (found === null) throw new Error("karana end not found within 14 h");
  return found;
}
