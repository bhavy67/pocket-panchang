import { ENGINE_VERSION } from "@panchang/engine";
import { expect, it, vi } from "vitest";
import { db } from "@/db";
import { pruneMonthCache } from "@/queries";

vi.mock("@/worker/client", () => ({ worker: {} }));

it("prunes month-cache rows from other engine versions only", async () => {
  const row = (key: string) => ({ key, days: [], computedAt: 0 });
  await db.monthCache.bulkPut([
    row(`${ENGINE_VERSION}|1279233|amanta|2026-10`),
    row(`${ENGINE_VERSION - 1}|1279233|amanta|2026-10`),
    row(`${ENGINE_VERSION + 10}|1279233|amanta|2026-10`), // "11|" must not match prefix "1|"
  ]);
  expect(await pruneMonthCache()).toBe(2);
  expect(await db.monthCache.toCollection().primaryKeys()).toEqual([
    `${ENGINE_VERSION}|1279233|amanta|2026-10`,
  ]);
});
