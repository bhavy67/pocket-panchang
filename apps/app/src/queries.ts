// TanStack Query over worker calls, with the IndexedDB month cache behind it (§7).
import { ENGINE_VERSION, type CivilDate } from "@panchang/engine";
import { QueryClient, queryOptions } from "@tanstack/react-query";
import { db } from "@/db";
import type { YearMonth } from "@/lib/year-month";
import type { Settings } from "@/settings";
import { worker } from "@/worker/client";

export const queryClient = new QueryClient({
  // Results are deterministic per engine version: computed once, never stale.
  defaultOptions: { queries: { staleTime: Infinity } },
});

const cacheKey = (s: Settings, month: YearMonth) =>
  `${ENGINE_VERSION}|${s.location.id}|${s.tradition}|${month}`;

export const monthQuery = (s: Settings, month: YearMonth) =>
  queryOptions({
    queryKey: ["month", cacheKey(s, month)],
    queryFn: async () => {
      const days = await worker.month(s.location, month);
      // A failed cache write only costs the next cold start; never fail the query for it.
      await db.monthCache
        .put({ key: cacheKey(s, month), days, computedAt: Date.now() })
        .catch((e: unknown) => console.error("Month cache write failed:", e));
      return days;
    },
    // Seeded from the IndexedDB cache (updatedAt 0) → stale → recompute once.
    staleTime: (q) => (q.state.dataUpdatedAt === 0 ? 0 : Infinity),
  });

/**
 * Cold start (§7): seed the query from IndexedDB so the screen renders at once, marked stale
 * (updatedAt 0) so the worker recomputes; structural sharing re-renders only on a difference.
 */
export async function seedMonth(s: Settings, month: YearMonth) {
  const cached = await db.monthCache.get(cacheKey(s, month));
  if (cached)
    queryClient.setQueryData(monthQuery(s, month).queryKey, [...cached.days], {
      updatedAt: 0,
    });
}

/** Deletes month-cache rows computed by older engine versions (§7: a version bump invalidates). */
export const pruneMonthCache = () =>
  db.monthCache
    .filter((row) => !row.key.startsWith(`${ENGINE_VERSION}|`))
    .delete();

/** Festivals of a Gregorian year at the settings city (memory only: cheap, and rules may change). */
export const festivalsQuery = (s: Settings, year: number) =>
  queryOptions({
    queryKey: ["festivals", ENGINE_VERSION, s.location.id, year],
    queryFn: () => worker.festivals(s.location, year),
  });

/** Moonrise/moonset on a local date at the settings city. */
export const moonQuery = (s: Settings, date: CivilDate) =>
  queryOptions({
    queryKey: ["moon", ENGINE_VERSION, s.location.id, date],
    queryFn: () => worker.moon(s.location, date),
  });

export const citySearchQuery = (q: string) =>
  queryOptions({
    queryKey: ["cities", q.trim().toLowerCase()],
    queryFn: () => worker.searchCities(q),
    enabled: q.trim().length >= 2,
  });
