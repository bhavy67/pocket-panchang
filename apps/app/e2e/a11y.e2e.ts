// Accessibility audit (Phase 10): axe (WCAG 2.2 AA rules) on every route, in all three
// palettes × light/dark (English) and in Gujarati; plus keyboard checks.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { onboard } from "./helpers";

const ROUTES = [
  "/",
  "/month?m=2026-11",
  "/day?date=2026-11-08",
  "/events",
  "/events/seed-1",
  "/events/new",
  "/settings",
];

/** Seed one family date and set the palette straight in IndexedDB (settings row "current"). */
async function seed(page: Page, palette: string) {
  await page.evaluate(
    (palette) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open("panchang");
        open.onsuccess = () => {
          const tx = open.result.transaction(
            ["events", "settings"],
            "readwrite",
          );
          tx.objectStore("events").put({
            id: "seed-1",
            title: "Ba's varsi",
            kind: "shraddh",
            lunarDate: { month: "Kartika", paksha: "krishna", tithi: 5 },
            policyOverrides: {},
            remindDaysBefore: [0, 1],
            createdAt: 1,
            updatedAt: 1,
          });
          const store = tx.objectStore("settings");
          const get = store.get("current");
          get.onsuccess = () => {
            const row = get.result as {
              key: string;
              value: Record<string, unknown>;
            };
            store.put({ ...row, value: { ...row.value, palette } });
          };
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error ?? new Error("IndexedDB seed failed"));
        };
      }),
    palette,
  );
}

async function audit(page: Page, label: string) {
  for (const route of ROUTES) {
    await page.goto(route);
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    await page.evaluate(() =>
      document.querySelectorAll("details").forEach((d) => (d.open = true)),
    );
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
        `${label} ${route}`,
      )
      .toEqual([]);
  }
}

for (const palette of ["calm", "mandir", "raat"])
  for (const scheme of ["light", "dark"] as const)
    test(`axe: ${palette} ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await onboard(page);
      await seed(page, palette);
      await audit(page, `${palette}/${scheme}`);
    });

test("axe: Gujarati, light and dark", async ({ page }) => {
  await onboard(page, { language: "ગુજરાતી" });
  await seed(page, "calm");
  await audit(page, "gu/light");
  await page.emulateMedia({ colorScheme: "dark" });
  await audit(page, "gu/dark");
});

test("axe: onboarding", async ({ page }) => {
  await page.goto("/onboarding");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});

test("keyboard: tab reaches the nav with a visible focus ring; Enter follows links", async ({
  page,
}) => {
  await onboard(page);
  // Skip past the page to the nav: every stop must show the token focus ring.
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    const focus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      return {
        text: el.textContent?.trim() ?? "",
        outline: s.outlineStyle,
        width: s.outlineWidth,
      };
    });
    expect(focus, `tab stop ${i}`).not.toBeNull();
    expect(focus!.outline, `focus ring on "${focus!.text}"`).not.toBe("none");
    if (focus!.text === "Month") break;
  }
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/month/);
});
