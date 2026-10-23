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

/** The lunation containing `t`: start ≤ t < end. */
export function lunationAt(
  t: Instant,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): Lunation {
  let start = newMoonAfter((t - 31 * DAY_MS) as Instant);
  let end = newMoonAfter(start);
  while (end <= t) {
    start = end;
    end = newMoonAfter(start);
  }
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
  const name = LUNAR_MONTHS[(rashiAtStart + 1) % 12]!;
  return {
    start,
    end,
    name,
    adhik: sankrantis.length === 0,
    absorbs:
      sankrantis.length === 2 ? LUNAR_MONTHS[(rashiAtStart + 2) % 12]! : null,
    sankrantis,
  };
}

/** The lunation before `lunation`. */
export function previousLunation(
  lunation: Lunation,
  variant: AyanamsaVariant = DEFAULT_AYANAMSA,
): Lunation {
  return lunationAt((lunation.start - DAY_MS) as Instant, variant);
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
