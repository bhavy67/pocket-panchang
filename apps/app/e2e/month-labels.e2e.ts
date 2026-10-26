// Month grid labels (tithi and festival short names) never break inside a word at 390 px,
// in English and Gujarati, at normal and 200% text (cells cap their text growth).
import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

// Oct 2026 – Sep 2027 holds every v1 festival.
const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 9 + i, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
});

test.use({ viewport: { width: 390, height: 844 } });

for (const language of ["English", "ગુજરાતી"] as const)
  test(`Month grid labels keep whole words: ${language}`, async ({ page }) => {
    test.setTimeout(90_000);
    await onboard(page, { language });
    const bad: string[] = [];
    for (const scale of ["100%", "200%"]) {
      for (const m of MONTHS) {
        await page.goto(`/month?m=${m}`);
        // !important: the app re-applies its own text size once settings load.
        await page.addStyleTag({
          content: `html { font-size: ${scale} !important }`,
        });
        // Festivals load after the tithis; measuring earlier silently skips them.
        await expect(
          page.locator('[aria-busy="false"] [data-cell-label]').first(),
        ).toBeVisible();
        // Measure with the real fonts (the system fallback is wider).
        await page.evaluate(() =>
          Promise.all(
            [
              "400 11px 'Plus Jakarta Sans'",
              "600 11px 'Plus Jakarta Sans'",
              "400 11px 'Anek Gujarati'",
              "600 11px 'Anek Gujarati'",
            ].map((f) => document.fonts.load(f, "aક")),
          ),
        );
        bad.push(
          ...(
            await page.evaluate(() => {
              const out: string[] = [];
              for (const el of document.querySelectorAll("[data-cell-label]")) {
                const cell = el.closest("a")!.getBoundingClientRect();
                const walker = document.createTreeWalker(
                  el,
                  NodeFilter.SHOW_TEXT,
                );
                for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                  for (const w of n.textContent!.matchAll(/\S+/g)) {
                    const r = document.createRange();
                    r.setStart(n, w.index);
                    r.setEnd(n, w.index + w[0].length);
                    // Zero-width rects appear at line boundaries; they are not part of the word.
                    const rects = [...r.getClientRects()].filter(
                      (x) => x.width > 0,
                    );
                    const lines = new Set(rects.map((x) => Math.round(x.top)));
                    if (
                      lines.size > 1 ||
                      rects.some((x) => x.right > cell.right + 0.5)
                    )
                      out.push(
                        `${w[0]} (${Math.max(...rects.map((x) => x.right)) - cell.right}px, ${lines.size} lines)`,
                      );
                  }
                }
              }
              return out;
            })
          ).map((w) => `${m} @${scale}: ${w}`),
        );
      }
    }
    expect(bad).toEqual([]);
  });
