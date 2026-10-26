// E2E (Phase 10) against the production build served by `vite preview`, so the real Comlink
// worker, service worker and fonts are exercised. Locally it uses the installed Chrome; CI
// installs Playwright's Chromium (`pnpm exec playwright install chromium`).
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  testMatch: "*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
    ...devices["Pixel 7"],
    ...(process.env.CI ? {} : { channel: "chrome" }),
  },
  webServer: {
    // Festival rules are still unverified, so production hides them; E2E opts in to test markers
    // and to the theme lab (Phase 11.6).
    command:
      "VITE_SHOW_UNVERIFIED=1 VITE_LAB=1 pnpm build --outDir dist-e2e && pnpm preview --outDir dist-e2e --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
