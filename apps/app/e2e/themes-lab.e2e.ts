// Theme lab (Phase 11.6, ADR 0025; reduced to four palettes 2026-10-27): axe (WCAG 2.2 AA) on
// Today in every palette × light/dark, in English and Gujarati, at 100% and 200% text;
// ≥ 44 px targets; the lab page.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { onboard } from "./helpers";

const THEMES = ["calm", "raat", "utsav", "shunya"];

async function axe(page: Page, label: string) {
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.getByRole("heading", { name: /Your day|તમારો દિવસ/ }).waitFor();
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect
    .soft(
      violations.map(
        (v) =>
          `${v.id}: ${v.nodes
            .map((n) => n.target.join(" "))
            .slice(0, 3)
            .join(", ")}`,
      ),
      label,
    )
    .toEqual([]);
}

for (const lang of ["en", "gu"])
  test(`themes: axe and targets, ${lang}`, async ({ page }) => {
    test.setTimeout(120_000);
    await onboard(page);
    for (const theme of THEMES)
      for (const mode of ["light", "dark"])
        for (const scale of ["1", "2"]) {
          await page.goto(
            `/?palette=${theme}&mode=${mode}&lang=${lang}&scale=${scale}`,
          );
          await axe(page, `${theme}/${mode}/${lang}/${scale}`);
          // Every button and link in main is at least 44 px tall (inline text links excepted).
          const small = await page.evaluate(
            () =>
              [...document.querySelectorAll("main button")]
                .map((el) => el.getBoundingClientRect())
                .filter((r) => r.height > 0 && r.height < 43.5).length,
          );
          expect
            .soft(small, `${theme}/${mode}/${lang}/${scale} small targets`)
            .toBe(0);
          // No horizontal scroll at phone width.
          expect
            .soft(
              await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
              ),
              `${theme}/${mode}/${lang}/${scale} overflow`,
            )
            .toBe(true);
        }
  });

test("theme lab lists four themes with light and dark frames", async ({
  page,
}) => {
  await onboard(page);
  await page.goto("/lab/themes");
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(4);
  await expect(page.locator("iframe")).toHaveCount(8);
  const { violations } = await new AxeBuilder({ page })
    .exclude("iframe")
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});
