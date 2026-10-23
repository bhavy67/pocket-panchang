import {
  addDays,
  samvatAt,
  type CivilDate,
  type Instant,
  type Lunation,
} from "@panchang/engine";
import { civilDaysOverlapping } from "./days";
import { lunationsBetween, tithiInterval } from "./tithis";
import {
  tithiNumber,
  type ClockFor,
  type CivilDay,
  type Interval,
  type Location,
  type LunarDate,
} from "./types";
import { coverage, windowInterval } from "./windows";

const DAY_MS = 86_400_000;

export type EventKind = "birthday" | "shraddh" | "anniversary" | "custom";

/** §4.9 (ADRs 0003, 0004, 0005, 0006, 0009, 0010). */
export type OccurrencePolicy = {
  readonly adhikMonth: "nija" | "adhik" | "match-origin" | "both";
  readonly kshayaTithi: "same-day" | "following-day";
  readonly vriddhiTithi: "first-day" | "second-day";
  readonly window: "sunrise" | "aparahna";
  readonly pitruPaksha: boolean;
  readonly tithiSource: "moment" | "calendar-day";
};
export type PolicyOverrides = Partial<OccurrencePolicy>;

/** Built-in defaults per kind. PROVISIONAL until §13 "Pending family confirmations" is cleared. */
export const BUILTIN_POLICY: Record<EventKind, OccurrencePolicy> = {
  birthday: {
    adhikMonth: "nija",
    kshayaTithi: "same-day",
    vriddhiTithi: "first-day",
    window: "sunrise",
    pitruPaksha: false,
    tithiSource: "moment",
  },
  shraddh: {
    adhikMonth: "nija",
    kshayaTithi: "same-day",
    vriddhiTithi: "first-day",
    window: "aparahna",
    pitruPaksha: true,
    tithiSource: "moment",
  },
  anniversary: {
    adhikMonth: "nija",
    kshayaTithi: "same-day",
    vriddhiTithi: "first-day",
    window: "sunrise",
    pitruPaksha: false,
    tithiSource: "moment",
  },
  custom: {
    adhikMonth: "nija",
    kshayaTithi: "same-day",
    vriddhiTithi: "first-day",
    window: "sunrise",
    pitruPaksha: false,
    tithiSource: "moment",
  },
};

export type PersonalEvent = {
  readonly id: string;
  readonly title: string;
  readonly kind: EventKind;
  readonly lunarDate: LunarDate;
  readonly policyOverrides: PolicyOverrides;
  /** Shraddh only: "same-tithi", "bhadrapada-purnima", or a Bhadrapada Krishna tithi 1–15. */
  readonly pitruPakshaDay?: "same-tithi" | "bhadrapada-purnima" | number;
  readonly observanceLocation?: Location;
  readonly remindDaysBefore: readonly number[];
};

export type Household = {
  readonly householdPolicy: Partial<Record<EventKind, PolicyOverrides>>;
  /** Household "Observance city" (ADR 0007). */
  readonly observanceLocation?: Location;
  /** The viewing city: last fallback for the observance location. */
  readonly location: Location;
};

/** effective = event override ?? household default (per kind) ?? built-in (ADR 0005), per field. */
export function effectivePolicy(
  event: PersonalEvent,
  household: Household,
): OccurrencePolicy {
  return {
    ...BUILTIN_POLICY[event.kind],
    ...household.householdPolicy[event.kind],
    ...event.policyOverrides,
  };
}

/** event override ?? household Observance city ?? viewing city (ADR 0007). */
export function observanceLocation(
  event: PersonalEvent,
  household: Household,
): Location {
  return (
    event.observanceLocation ??
    household.observanceLocation ??
    household.location
  );
}

export type Occurrence = {
  readonly eventId: string;
  readonly kind: "annual" | "pitru-paksha";
  /** Set when the event's month is adhik that year and the policy chose a side (ADR 0009). */
  readonly month: "adhik" | "nija" | null;
  readonly date: CivilDate;
  readonly sunrise: Instant;
  /** Shaka year of the occurrence day: unique per lunar year, used in .ics UIDs (ADR 0016). */
  readonly lunarYear: number;
  readonly observance: Location;
};

/** Places a tithi on a civil day per the occurrence policy (ADRs 0003, 0010). */
function placeTithi(
  tithi: Interval,
  policy: OccurrencePolicy,
  place: Location,
  clockFor: ClockFor,
): CivilDay {
  const coordinates = { latitude: place.lat, longitude: place.lng };
  const days = civilDaysOverlapping(tithi, coordinates, clockFor(place.tz));
  if (policy.window === "sunrise") {
    const atSunrise = days.filter(
      (d) => d.sunrise >= tithi.start && d.sunrise < tithi.end,
    );
    if (atSunrise.length === 1) return atSunrise[0]!;
    if (atSunrise.length >= 2)
      return policy.vriddhiTithi === "first-day"
        ? atSunrise[0]!
        : atSunrise.at(-1)!;
    // Kshaya: the tithi falls inside one civil day (the one containing its start).
    const same = days[0]!;
    if (policy.kshayaTithi === "same-day") return same;
    const following = civilDaysOverlapping(
      { start: same.nextSunrise, end: (same.nextSunrise + 1) as Instant },
      coordinates,
      clockFor(place.tz),
    );
    return following[0]!;
  }
  // Aparahna (ADR 0003): one covered → it; both → greater coverage, tie → earlier; neither → earlier.
  const scored = days
    .map((d) => ({ d, cov: coverage(windowInterval("aparahna", d), [tithi]) }))
    .filter((s) => s.cov > 0);
  if (scored.length === 0) return days[0]!;
  return scored.reduce((best, s) => (s.cov > best.cov ? s : best)).d;
}

/** Pitru Paksha target tithi (1–30, in Bhadrapada) for a death tithi (ADR 0004). */
export function pitruPakshaTithi(
  lunarDate: LunarDate,
  day: PersonalEvent["pitruPakshaDay"] = "same-tithi",
): number {
  if (day === "bhadrapada-purnima") return 15;
  if (typeof day === "number") return 15 + day; // Bhadrapada Krishna 1–15 (15 = Sarva Pitru Amavasya)
  if (lunarDate.paksha === "shukla" && lunarDate.tithi === 15) return 15; // Purnima → Bhadrapada Purnima
  return 15 + lunarDate.tithi; // same tithi number in Krishna paksha; Amavasya → 30
}

function monthMatches(l: Lunation, month: LunarDate["month"]): boolean {
  return l.name === month || l.absorbs === month;
}

/** All occurrences of a personal event with dates in [from, to] (§4.9). */
export function occurrences(
  event: PersonalEvent,
  household: Household,
  from: CivilDate,
  to: CivilDate,
  clockFor: ClockFor,
): Occurrence[] {
  const policy = effectivePolicy(event, household);
  const place = observanceLocation(event, household);
  const clock = clockFor(place.tz);
  const start = clock.localMidnight(from);
  const end = clock.localMidnight(addDays(to, 1));
  const lunations = lunationsBetween(
    (start - 40 * DAY_MS) as Instant,
    (end + 40 * DAY_MS) as Instant,
  );
  const out: Occurrence[] = [];

  const emit = (
    kind: Occurrence["kind"],
    month: Occurrence["month"],
    lunation: Lunation,
    n: number,
  ) => {
    const day = placeTithi(tithiInterval(lunation, n), policy, place, clockFor);
    out.push({
      eventId: event.id,
      kind,
      month,
      date: day.date,
      sunrise: day.sunrise,
      lunarYear: samvatAt(day.sunrise).shaka,
      observance: place,
    });
  };

  const n = tithiNumber(event.lunarDate.paksha, event.lunarDate.tithi);
  for (let i = 0; i < lunations.length; i++) {
    const l = lunations[i]!;
    if (!monthMatches(l, event.lunarDate.month)) continue;
    const pairedAdhik = l.adhik
      ? lunations[i + 1]
      : lunations[i - 1]?.adhik
        ? lunations[i - 1]
        : undefined;
    if (!pairedAdhik || !monthMatches(pairedAdhik, event.lunarDate.month)) {
      if (!l.adhik) emit("annual", null, l, n); // normal year (an unpaired adhik cannot occur)
      continue;
    }
    // This name occurs twice (adhik + nija): apply the adhik-month policy (ADR 0009).
    const side = l.adhik ? "adhik" : "nija";
    const wanted =
      policy.adhikMonth === "both"
        ? [side]
        : policy.adhikMonth === "match-origin"
          ? [event.lunarDate.adhik ? "adhik" : "nija"]
          : [policy.adhikMonth];
    if (wanted.includes(side)) emit("annual", side, l, n);
  }

  if (event.kind === "shraddh" && policy.pitruPaksha) {
    const target = pitruPakshaTithi(event.lunarDate, event.pitruPakshaDay);
    for (const l of lunations)
      if (!l.adhik && monthMatches(l, "Bhadrapada"))
        emit("pitru-paksha", null, l, target);
  }
  return out
    .filter((o) => o.date >= from && o.date <= to)
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind),
    );
}
