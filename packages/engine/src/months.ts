import { DEFAULT_AYANAMSA, type AyanamsaVariant } from "./ayanamsa";
import { findCrossing } from "./crossing";
import { RASHI_COUNT, siderealSun } from "./elements";
import { elongation } from "./longitude";
import { segmentAt } from "./segments";
import type { Instant } from "./time";

const DAY_MS = 86_400_000;
/** Elongation gains ≤ 15°/day, so 2-day steps move < 180° (crossing-finder requirement). */
const NEW_MOON_STEP_MS = 2 * DAY_MS;
/** The Sun moves ~1°/day: 10-day steps are safe for sankrantis. */
const SANKRANTI_STEP_MS = 10 * DAY_MS;

/** Canonical Sanskrit names; index 0 = Chaitra (GLOSSARY.md). Amanta frame. */
export const LUNAR_MONTHS = [
  "Chaitra",
  "Vaishakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadrapada",
  "Ashvin",
  "Kartika",
  "Margashirsha",
  "Pausha",
  "Magha",
  "Phalguna",
] as const;
export type LunarMonth = (typeof LUNAR_MONTHS)[number];

/** One Amanta lunar month: new moon to new moon (§4.6). */
export type Lunation = {
  readonly start: Instant;
  readonly end: Instant;
  readonly name: LunarMonth;
  /** No sankranti in the month: an extra month named after the next one. */
  readonly adhik: boolean;
  /** Two sankrantis: this month also hosts the dropped (kshaya) month's name (ADR 0008). */
  readonly absorbs: LunarMonth | null;
  /** Sankranti instants within (start, end]. */
  readonly sankrantis: readonly Instant[];
};

function newMoonAfter(t: Instant): Instant {
  const found = findCrossing(elongation, 0, t, (t + 35 * DAY_MS) as Instant, {
    stepMs: NEW_MOON_STEP_MS,
  });
  if (found === null)
    throw new Error(
      `no new moon within 35 days after ${new Date(t).toISOString()}`,
    );
  return found;
}

/**
 * Lunations are immutable facts, so they are cached per ayanamsa variant (bounded). This keeps
 * `assembleDay` cheap: a 30-day month needs ~2 lunation computations instead of ~30 × 15.
 * A pure memo: same inputs, same outputs; no time, I/O or global state is read.
 */
const CACHE_LIMIT = 64;
const cache = new Map<AyanamsaVariant, Lunation[]>();

function remember(variant: AyanamsaVariant, lunation: Lunation): Lunation {
  const list = cache.get(variant) ?? [];
  if (!list.some((l) => l.start === lunation.start)) {
    list.push(lunation);
    list.sort((a, b) => a.start - b.start);
    if (list.length > CACHE_LIMIT) {
      // Drop whichever end is farther from the new entry.
      if (lunation.start - list[0]!.start > list.at(-1)!.start - lunation.start)
        list.shift();
      else list.pop();
    }
    cache.set(variant, list);
  }
  return lunation;
}

/** Names a lunation from its new moons (ADR 0020). */
function build(
  start: Instant,
  end: Instant,
  variant: AyanamsaVariant,
): Lunation {
  // Sankrantis: the Sun entering the next rashis after the one it is in at the new moon.
  const rashiAtStart = segmentAt(siderealSun(start, variant), RASHI_COUNT) - 1; // 0 = Mesha
  const sankrantis: Instant[] = [];
  for (let k = 1; k <= 2; k++) {
    const target = ((rashiAtStart + k) % RASHI_COUNT) * 30;
    const at = findCrossing(
      (x) => siderealSun(x, variant),
      target,
      start,
      end,
      { stepMs: SANKRANTI_STEP_MS },
    );
    if (at === null) break;
    sankrantis.push(at);
  }
  // A month is named by the rashi the Sun enters during it: Mesha (0) → Chaitra.
  return {
    start,
    end,
    name: LUNAR_MONTHS[(rashiAtStart + 1) % 12]!,
    adhik: sankrantis.length === 0,
    absorbs:
      sankrantis.length === 2 ? LUNAR_MONTHS[(rashiAtStart + 2) % 12]! : null,
    sankrantis,
  };
}

/** The lunation containing `t`: start ≤ t < end. */
export function lunationAt(
  t: Instant,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): Lunation {
  const known = cache.get(variant) ?? [];
  const hit = known.find((l) => l.start <= t && t < l.end);
  if (hit) return hit;
  // Reuse a cached predecessor's end as this lunation's start when it is the right one.
  const before = known.filter((l) => l.end <= t).at(-1);
  if (before && t - before.end < 30 * DAY_MS) {
    const end = newMoonAfter(before.end);
    if (t < end) return remember(variant, build(before.end, end, variant));
  }
  let start = newMoonAfter((t - 31 * DAY_MS) as Instant);
  let end = newMoonAfter(start);
  while (end <= t) {
    start = end;
    end = newMoonAfter(start);
  }
  return remember(variant, build(start, end, variant));
}

/** The lunation before `lunation`: one search, since it ends where `lunation` starts. */
export function previousLunation(
  lunation: Lunation,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): Lunation {
  const known = (cache.get(variant) ?? []).find(
    (l) => l.end === lunation.start,
  );
  if (known) return known;
  // Lunations last 29.2–29.9 days, so the first new moon after start − 31 d is the previous one.
  return remember(
    variant,
    build(
      newMoonAfter((lunation.start - 31 * DAY_MS) as Instant),
      lunation.start,
      variant,
    ),
  );
}

export type Samvat = {
  /** Vikram Samvat, Kartikadi (Gujarati): new year on Kartika Shukla Pratipada. */
  readonly vikramKartikadi: number;
  /** Vikram Samvat, Chaitradi: new year on Chaitra Shukla Pratipada. */
  readonly vikramChaitradi: number;
  /** Shaka Samvat: new year on Chaitra Shukla Pratipada. */
  readonly shaka: number;
};

/**
 * Year numbers for the civil day whose sunrise is `sunrise` (ADR 0020).
 * The year changes on the first civil day whose sunrise tithi is Sud 1 or later of the
 * (nija) Kartika / Chaitra month, i.e. the first sunrise after that month's new moon.
 * This also resolves a kshaya pratipada (the new year then starts on Sud 2).
 */
export function samvatAt(
  sunrise: Instant,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): Samvat {
  let lunation = lunationAt(sunrise, variant);
  let kartika: Instant | null = null;
  let chaitra: Instant | null = null;
  // Walk back at most 14 lunations (a year plus a possible adhik month).
  for (let i = 0; i < 14 && (kartika === null || chaitra === null); i++) {
    if (!lunation.adhik && lunation.start < sunrise) {
      if (kartika === null && lunation.name === "Kartika")
        kartika = lunation.start;
      if (chaitra === null && lunation.name === "Chaitra")
        chaitra = lunation.start;
    }
    lunation = previousLunation(lunation, variant);
  }
  if (kartika === null || chaitra === null)
    throw new Error("no Kartika/Chaitra start found within 14 lunations");
  const chaitraYear = new Date(chaitra).getUTCFullYear();
  return {
    vikramKartikadi: new Date(kartika).getUTCFullYear() + 57,
    vikramChaitradi: chaitraYear + 57,
    shaka: chaitraYear - 78,
  };
}
