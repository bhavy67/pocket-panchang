import type { Instant, PanchangDay } from "@panchang/engine";
import type { Interval } from "./types";

export const CHOGHADIYA_NAMES = [
  "Udveg",
  "Char",
  "Labh",
  "Amrut",
  "Kaal",
  "Shubh",
  "Rog",
] as const;
export type ChoghadiyaName = (typeof CHOGHADIYA_NAMES)[number];
export type Quality = "good" | "neutral" | "bad";

const QUALITY: Record<ChoghadiyaName, Quality> = {
  Amrut: "good",
  Shubh: "good",
  Labh: "good",
  Char: "neutral",
  Udveg: "bad",
  Kaal: "bad",
  Rog: "bad",
};

/** 1-based eighth of daylight, indexed by vara (0 = Sunday) (§4.8). */
const RAHU_KAAL = [8, 2, 7, 5, 6, 4, 3] as const;
const YAMAGANDA = [5, 4, 3, 2, 1, 7, 6] as const;
const GULIKA = [7, 6, 5, 4, 3, 2, 1] as const;

export type Choghadiya = Interval & {
  readonly name: ChoghadiyaName;
  readonly quality: Quality;
};

export type DayMuhurta = {
  readonly rahuKaal: Interval;
  readonly yamaganda: Interval;
  readonly gulika: Interval;
  /** Sunrise → sunset, 8 parts. Day starts at index 3·vara in Udveg…Rog and steps +1. */
  readonly day: readonly Choghadiya[];
  /** Sunset → next sunrise, 8 parts. Night starts at index 5 + 3·vara and steps −2. */
  readonly night: readonly Choghadiya[];
  /** Vishti karana windows (ADR 0018). */
  readonly bhadra: readonly Interval[];
};

function eighths(start: Instant, end: Instant): Interval[] {
  const part = (end - start) / 8;
  return Array.from({ length: 8 }, (_, i) => ({
    start: (start + Math.round(i * part)) as Instant,
    end: (start + Math.round((i + 1) * part)) as Instant,
  }));
}

/** Muhurta for a civil day; null if the day has no sunset (polar, §4.4). */
export function muhurtaFor(day: PanchangDay): DayMuhurta | null {
  if (day.sunset.kind !== "event") return null;
  const sunset = day.sunset.at;
  const dayParts = eighths(day.sunrise, sunset);
  const nightParts = eighths(sunset, day.nextSunrise);
  const v = day.vara;
  const named = (
    parts: Interval[],
    first: number,
    step: number,
  ): Choghadiya[] =>
    parts.map((p, i) => {
      const name = CHOGHADIYA_NAMES[(((first + step * i) % 7) + 7) % 7]!;
      return { ...p, name, quality: QUALITY[name] };
    });
  return {
    rahuKaal: dayParts[RAHU_KAAL[v]! - 1]!,
    yamaganda: dayParts[YAMAGANDA[v]! - 1]!,
    gulika: dayParts[GULIKA[v]! - 1]!,
    day: named(dayParts, 3 * v, 1),
    night: named(nightParts, 5 + 3 * v, -2),
    bhadra: day.bhadra,
  };
}

const overlaps = (a: Interval, b: Interval) =>
  a.start < b.end && b.start < a.end;

/**
 * Next good Choghadiya (Amrut, Shubh, Labh) still running or upcoming at `now` that does not
 * overlap Rahu Kaal or Bhadra (§4.8, approved Today design). Null if none remains today.
 */
export function nextGoodTime(m: DayMuhurta, now: Instant): Choghadiya | null {
  const avoid = [m.rahuKaal, ...m.bhadra];
  return (
    [...m.day, ...m.night].find(
      (c) =>
        c.quality === "good" &&
        c.end > now &&
        !avoid.some((a) => overlaps(a, c)),
    ) ?? null
  );
}
