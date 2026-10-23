import { expect, type Page } from "@playwright/test";

/** The brief's stress case: Thu 22 Oct 2026, 2:10 PM in Ahmedabad (brief §2). */
export const STRESS_NOW = new Date("2026-10-22T08:40:00Z");

/** Fresh install: onboarding with a city and a language, landing on Today. */
export async function onboard(
  page: Page,
  {
    city = "Ahmedabad",
    language = "English",
    fixedTime = true,
  }: {
    city?: string;
    language?: "English" | "ગુજરાતી";
    /** Playwright's fake clock also stubs the performance timeline; budgets need real time. */
    fixedTime?: boolean;
  } = {},
) {
  if (fixedTime) await page.clock.setFixedTime(STRESS_NOW);
  await page.goto("/");
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByRole("searchbox").fill(city);
  await page
    .getByRole("button", { name: new RegExp(`^${city}, Gujarat`) })
    .click();
  await page.getByRole("button", { name: new RegExp(`^${language}`) }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

/** Desktop Chrome can share files; force the download path for export tests. */
export const forceDownloads = (page: Page) =>
  page.addInitScript(() => {
    Object.defineProperty(navigator, "canShare", { value: undefined });
  });
