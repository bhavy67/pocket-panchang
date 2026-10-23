// Main flows (Phase 10 exit): onboarding, Today, Month navigation, creating a family date,
// .ics export, and the real Comlink worker in a browser.
import { expect, test } from "@playwright/test";
import { forceDownloads, onboard } from "./helpers";

test("onboarding persists across a reload and Today computes in the real worker", async ({
  page,
}) => {
  const workers: string[] = [];
  page.on("worker", (w) => workers.push(w.url()));
  await onboard(page);
  // No month cache on a fresh install: the glance can only come from the worker.
  expect(workers.some((u) => /worker-.*\.js/.test(u))).toBe(true);
  const glance = page.getByRole("region", { name: /^Aaso Sud 11\./ });
  await expect(glance).toBeVisible();
  await expect(glance.getByText("Choghadiya: Amrut")).toBeVisible();
  await expect(glance.getByText("Many avoid now")).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("region", { name: /^Aaso Sud 11\./ }),
  ).toBeVisible();
});

test("Today: tapping a time opens its sheet; Escape closes it", async ({
  page,
}) => {
  await onboard(page);
  await page.getByRole("button", { name: /^Rahu Kaal until/ }).click();
  const sheet = page.getByRole("dialog", { name: "Rahu Kaal" });
  await expect(sheet).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

test("Month: buttons move between months and show Diwali and Navratri", async ({
  page,
}) => {
  await onboard(page);
  await page.getByRole("link", { name: "Month" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "October 2026" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Navratri/ }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next month" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "November 2026" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Diwali/ })).toBeVisible();
  await page.getByRole("button", { name: "Previous month" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "October 2026" }),
  ).toBeVisible();
});

test("create a family date, see it upcoming, and export the .ics", async ({
  page,
}) => {
  await forceDownloads(page);
  await onboard(page);
  await page.getByRole("link", { name: "Events" }).click();
  await page.getByRole("link", { name: "+ Add a date" }).click();
  await page.getByLabel("Name").fill("Ba's varsi");
  await page.getByText("Varsi / Shraddh").click();
  await page.getByText("I know the tithi").click();
  await page.getByLabel("Month", { exact: true }).selectOption("Kartika");
  await page.getByLabel("Sud / Vad").selectOption("krishna");
  await page.getByLabel("Tithi", { exact: true }).selectOption("5");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page).toHaveURL(/\/events$/);
  const row = page.getByRole("link", { name: /Ba's varsi/ }).first();
  await expect(row).toContainText(/Kartak Vad 5 · \w{3} \d{1,2} Nov/);

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save calendar file (.ics)" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("family-dates.ics");
  const text = await (await file.createReadStream()).toArray();
  const ics = Buffer.concat(text).toString("utf8");
  expect(ics).toContain("BEGIN:VCALENDAR");
  expect(ics).toMatch(/SUMMARY:Ba's varsi · Ahmedabad/);
  expect(ics).toMatch(/SUMMARY:Ba's varsi \(Pitru Paksha\) · Ahmedabad/);
});

test("Gujarati: page language, Gujarati digits and time words", async ({
  page,
}) => {
  await onboard(page, { language: "ગુજરાતી" });
  await expect(page.locator("html")).toHaveAttribute("lang", "gu");
  await expect(
    page.getByRole("heading", { level: 1, name: "આસો સુદ ૧૧" }),
  ).toBeVisible();
  await expect(page.getByText("ચોઘડિયું: અમૃત")).toBeVisible();
  // The self-hosted Gujarati font is the one in use.
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].some(
      (f) => f.family.includes("Noto Sans Gujarati") && f.status === "loaded",
    );
  });
  expect(loaded).toBe(true);
});
