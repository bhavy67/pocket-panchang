// §7 budgets on a throttled mid-range profile: CPU ×4 slowdown and a "slow 4G" network
// (150 ms RTT, 1.6 Mbps down). Prints the numbers for PROJECT_PLAN.md §7 and fails on a breach.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { expect, test, type Page } from "@playwright/test";
import { onboard } from "./helpers";

const DIST = join(import.meta.dirname, "../dist-e2e");
const gz = (file: string) =>
  gzipSync(readFileSync(join(DIST, file))).length / 1024;

async function throttle(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
}

test("bundle budgets: initial JS ≤ 170 KB gzip, worker ≤ 40 KB gzip", () => {
  const html = readFileSync(join(DIST, "index.html"), "utf8");
  const initial = [
    ...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.js)"/g),
  ].map((m) => m[1]!);
  const initialKb = initial.reduce((sum, f) => sum + gz(f), 0);
  const assets = readFileSync(join(DIST, "sw.js"), "utf8");
  const worker = /assets\/worker-[\w-]+\.js/.exec(assets)?.[0];
  const workerKb = gz(worker!);
  const locale = Math.max(
    ...[/assets\/en-[\w-]+\.js/, /assets\/gu-[\w-]+\.js/].map((re) =>
      gz(re.exec(assets)![0]),
    ),
  );
  console.log(
    `initial JS ${initialKb.toFixed(1)} KB gzip (+ active locale ≤ ${locale.toFixed(1)} KB), worker ${workerKb.toFixed(1)} KB gzip`,
  );
  expect(initialKb).toBeLessThanOrEqual(170);
  expect(workerKb).toBeLessThanOrEqual(40);
});

test("Today visible < 1 s on a warm start; month computation < 300 ms", async ({
  page,
}) => {
  await onboard(page, { fixedTime: false });
  const glance = page.locator("main section[aria-label]").first();
  // Warm: service worker installed and today's month cached in IndexedDB.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await glance.waitFor();
  await throttle(page);

  await page.reload();
  await glance.waitFor();
  const visibleMs = await page.evaluate(() => performance.now());

  // A month nobody has computed yet (not prefetched): a full worker round trip.
  await page.goto("/month?m=2027-07");
  await page.getByRole("heading", { level: 1, name: "July 2027" }).waitFor();
  const measures = () =>
    page.evaluate(() =>
      performance.getEntriesByType("measure").map((m) => m.name),
    );
  await expect.poll(measures).toContain("month 2027-07");
  const monthMs = await page.evaluate(
    () => performance.getEntriesByName("month 2027-07")[0]!.duration,
  );
  console.log(
    `throttled (CPU ×4, slow 4G): Today visible ${visibleMs.toFixed(0)} ms warm; month 2027-07 computed in ${monthMs.toFixed(0)} ms`,
  );
  expect(visibleMs).toBeLessThan(1000);
  expect(monthMs).toBeLessThan(300);
});
