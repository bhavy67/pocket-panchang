// Everything the main thread asks the worker for (§5.2 rule 2). Plain functions so tests can
// call them without a Worker; worker.ts exposes this object through Comlink.
import {
  collapseVariants,
  FESTIVALS,
  icsCalendar,
  occurrenceEntry,
  occurrences,
  resolveFestivals,
  type FestivalOccurrence,
  type Household,
  type Location,
  type LunarDate,
  type Occurrence,
  type OccurrencePolicy,
} from "@panchang/calendar";
import {
  addDays,
  assembleDay,
  lunationAt,
  nextMoonrise,
  nextMoonset,
  nextSunrise,
  tithiAt,
  type CivilDate,
  type Instant,
} from "@panchang/engine";
import type { MonthDay, StoredEvent } from "@/db";
import { SHOW_UNVERIFIED } from "@/flags";
import { clockFor, localInstant } from "@/lib/clock";
import type { YearMonth } from "@/lib/year-month";
import { firstDay } from "@/lib/year-month";
import { indexCities, searchCities, type City, type CityFile } from "./cities";

let cityIndex: Promise<ReturnType<typeof indexCities>> | undefined;

function loadCities() {
  cityIndex ??= fetch(`${import.meta.env.BASE_URL}data/cities.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`cities.json: HTTP ${r.status}`);
      return r.json() as Promise<CityFile>;
    })
    .then(indexCities)
    .catch((e: unknown) => {
      cityIndex = undefined; // let the next search retry
      throw e;
    });
  return cityIndex;
}

export const api = {
  /** Every civil date of `month` at `location`, assembled sunrise to sunrise (§4.5). */
  month(location: Location, month: YearMonth): MonthDay[] {
    const clock = clockFor(location.tz);
    const at = { latitude: location.lat, longitude: location.lng };
    const days: MonthDay[] = [];
    for (
      let date = firstDay(month);
      date.startsWith(month);
      date = addDays(date, 1)
    )
      days.push({ date, day: assembleDay(clock.localMidnight(date), at) });
    return days;
  },

  /**
   * Festivals dated in a Gregorian year. A rule ships only once verified (§0 rule 7): production
   * builds drop unverified rules; dev builds keep them, flagged, so screens can be built.
   */
  festivals(location: Location, year: number): Festival[] {
    const unverified = new Set(
      FESTIVALS.filter((r) => r.verified.years.length === 0).map((r) => r.id),
    );
    const rules = SHOW_UNVERIFIED
      ? FESTIVALS
      : FESTIVALS.filter((r) => !unverified.has(r.id));
    const place = {
      coordinates: { latitude: location.lat, longitude: location.lng },
      clock: clockFor(location.tz),
    };
    return collapseVariants(
      resolveFestivals(
        rules,
        `${year}-01-01` as CivilDate,
        `${year}-12-31` as CivilDate,
        place,
      ),
    ).map((o) => ({ ...o, unverified: unverified.has(o.id) }));
  },
  /**
   * Moonrise and moonset in the civil day of `date` (sunrise → next sunrise, as printed
   * panchangs list them); either may be missing that day.
   */
  moon(location: Location, date: CivilDate): { rise?: Instant; set?: Instant } {
    const at = { latitude: location.lat, longitude: location.lng };
    const first = nextSunrise(clockFor(location.tz).localMidnight(date), at);
    if (first.kind !== "event") return {};
    const second = nextSunrise(first.at, at);
    const end = second.kind === "event" ? second.at : first.at + 86_400_000;
    const inDay = (e: ReturnType<typeof nextMoonrise>) =>
      e.kind === "event" && e.at <= end ? e.at : undefined;
    const rise = inDay(nextMoonrise(first.at, at));
    const set = inDay(nextMoonset(first.at, at));
    return { ...(rise && { rise }), ...(set && { set }) };
  },

  /** Every occurrence of every event with a date in [from, to], date-sorted (§4.9). */
  occurrences(
    events: readonly StoredEvent[],
    household: Household,
    from: CivilDate,
    to: CivilDate,
  ): Occurrence[] {
    return events
      .flatMap((e) => occurrences(e, household, from, to, clockFor))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  /** An .ics file of every event's occurrences in [from, to] (§5.5). */
  ics(
    events: readonly StoredEvent[],
    household: Household,
    from: CivilDate,
    to: CivilDate,
    generatedAt: Instant,
  ): string {
    const byId = new Map(events.map((e) => [e.id, e]));
    return icsCalendar(
      api
        .occurrences(events, household, from, to)
        .map((o) => occurrenceEntry(byId.get(o.eventId)!, o)),
      generatedAt,
    );
  },

  /**
   * The Gregorian-date helper (ADR 0006): proposes a lunar date for a birth/death at `place`.
   * With a time and `moment`, the tithi at that instant; otherwise the udaya tithi of the civil
   * day (a pre-sunrise moment belongs to the previous civil day). The UI must confirm it.
   */
  tithiFromDate(
    place: Location,
    date: CivilDate,
    time: string | undefined,
    source: OccurrencePolicy["tithiSource"],
  ): TithiProposal {
    const clock = clockFor(place.tz);
    const at = { latitude: place.lat, longitude: place.lng };
    const moment =
      time === undefined ? undefined : localInstant(date, time, place.tz);
    let civilDate = date;
    let day = assembleDay(clock.localMidnight(date), at);
    if (day.kind === "day" && moment !== undefined && moment < day.sunrise) {
      civilDate = addDays(date, -1);
      day = assembleDay(clock.localMidnight(civilDate), at);
    }
    if (day.kind !== "day")
      throw new Error(`No sunrise at ${place.name} on ${date}`);
    const useMoment = moment !== undefined && source === "moment";
    const n = useMoment ? tithiAt(moment) : day.tithi.atSunrise;
    const month = useMoment ? lunationAt(moment) : day.month;
    const HOUR = 3_600_000;
    return {
      lunarDate: {
        month: month.name,
        ...(month.adhik && { adhik: true }),
        paksha: n <= 15 ? "shukla" : "krishna",
        tithi: n <= 15 ? n : n - 15,
      },
      civilDate,
      ...(moment !== undefined && { moment }),
      nearChange:
        moment !== undefined &&
        (tithiAt((moment - HOUR) as Instant) !== tithiAt(moment) ||
          tithiAt((moment + HOUR) as Instant) !== tithiAt(moment)),
    };
  },

  async searchCities(query: string): Promise<City[]> {
    return searchCities(await loadCities(), query);
  },
};

export type TithiProposal = {
  readonly lunarDate: LunarDate;
  /** The civil day used (the previous date for a pre-sunrise moment). */
  readonly civilDate: CivilDate;
  readonly moment?: Instant;
  /** The moment is within 1 hour of a tithi change (ADR 0006 warning). */
  readonly nearChange: boolean;
};

export type Festival = FestivalOccurrence & { readonly unverified: boolean };
export type Api = typeof api;
