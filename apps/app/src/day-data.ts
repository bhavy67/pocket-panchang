// Hooks that turn cached worker results into one civil day for a screen.
import { muhurtaFor, type DayMuhurta } from "@panchang/calendar";
import {
  addDays,
  type CivilDate,
  type Instant,
  type PanchangDay,
} from "@panchang/engine";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { clockFor } from "@/lib/clock";
import { yearMonthOf } from "@/lib/year-month";
import { festivalsQuery, monthQuery } from "@/queries";
import type { Settings } from "@/settings";
import type { Festival } from "@/worker/api";

/** Wall-clock now, refreshed every 30 s (the "Now" line just jumps; no animation, brief §8.5). */
export function useNow(): Instant {
  const [now, setNow] = useState(() => Date.now() as Instant);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() as Instant), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export type DayView = {
  readonly date: CivilDate;
  readonly day: PanchangDay;
  /** Pure arithmetic over the cached day (eighths of daylight), so it runs here, not in the worker. */
  readonly muhurta: DayMuhurta | null;
};

/** The panchang of a civil date (sunrise → next sunrise), or undefined while loading/polar. */
export function useDay(s: Settings, date: CivilDate): DayView | undefined {
  const { data } = useQuery(monthQuery(s, yearMonthOf(date)));
  const day = data?.find((d) => d.date === date)?.day;
  return useMemo(
    () =>
      day?.kind === "day" ? { date, day, muhurta: muhurtaFor(day) } : undefined,
    [date, day],
  );
}

/**
 * The civil day containing `now`: before today's sunrise it is still yesterday's panchang
 * (§4.5, sunrise to sunrise).
 */
export function useToday(s: Settings, now: Instant): DayView | undefined {
  const date = clockFor(s.location.tz).localDate(now);
  const today = useDay(s, date);
  const yesterday = useDay(s, addDays(date, -1));
  return today && now < today.day.sunrise ? yesterday : today;
}

/** Festivals in the given Gregorian years, merged and date-sorted. */
export function useFestivals(
  s: Settings,
  years: readonly number[],
): Festival[] {
  return useQueries({
    queries: years.map((y) => festivalsQuery(s, y)),
    combine: (results) => results.flatMap((r) => r.data ?? []),
  });
}
