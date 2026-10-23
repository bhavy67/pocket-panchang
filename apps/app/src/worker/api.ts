// Everything the main thread asks the worker for (§5.2 rule 2). Plain functions so tests can
// call them without a Worker; worker.ts exposes this object through Comlink.
import type { Location } from "@panchang/calendar";
import { addDays, assembleDay } from "@panchang/engine";
import type { MonthDay } from "@/db";
import { clockFor } from "@/lib/clock";
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

  async searchCities(query: string): Promise<City[]> {
    return searchCities(await loadCities(), query);
  },
};

export type Api = typeof api;
