// Full offline (Phase 10): after one online visit the service worker serves the app, and the
// worker still computes days and months with no network.
import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

test("works offline after the first visit", async ({ page, context }) => {
  await onboard(page);
  // "prompt" mode doesn't claim open pages: the service worker controls the next load.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(
    true,
  );
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("region", { name: /^Aaso Sud 11\./ }),
  ).toBeVisible();
  // A month never visited before: computed by the worker, offline.
  await page.goto("/month?m=2027-03");
  await expect(
    page.getByRole("heading", { level: 1, name: "March 2027" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Holika Dahan/ })).toBeVisible();
  // City search data is precached too (offline onboarding / city change).
  await page.goto("/settings");
  await page.getByRole("searchbox").first().fill("Nadiad");
  await expect(
    page.getByRole("button", { name: /^Nadiad, Gujarat/ }),
  ).toBeVisible();
});

test("the manifest makes the app installable", async ({ page }) => {
  await onboard(page);
  const cdp = await page.context().newCDPSession(page);
  const { installabilityErrors } = await cdp.send(
    "Page.getInstallabilityErrors",
  );
  // Playwright contexts are incognito, which Chrome reports on its own; anything else is a
  // real manifest/service-worker problem.
  expect(
    installabilityErrors.filter((e) => e.errorId !== "in-incognito"),
  ).toEqual([]);
});
