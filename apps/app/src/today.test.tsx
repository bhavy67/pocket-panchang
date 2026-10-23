// The approved design's stress case (brief §2): Ahmedabad, Thu 22 Oct 2026 at 2:10 PM, when a
// good Choghadiya (Amrut) overlaps Rahu Kaal and Bhadra. Reference times: Drik Panchang.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { loadLanguage } from "@/i18n";
import { createAppRouter } from "@/router";
import { AHMEDABAD, defaultSettings, saveSettings } from "@/settings";

vi.mock("@/worker/client", async () => ({
  worker: (await import("@/worker/api")).api,
}));

beforeAll(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-22T08:40:00Z")); // 2:10 PM IST
  saveSettings(defaultSettings(AHMEDABAD, "en"));
});
afterAll(() => vi.useRealTimers());

it("shows the glance card for Aaso Sud 11 at 2:10 PM", async () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider
        router={createAppRouter(createMemoryHistory({ initialEntries: ["/"] }))}
      />
    </QueryClientProvider>,
  );
  const glance = await screen.findByRole("region", { name: /^Aaso Sud 11\./ });
  const g = within(glance);
  expect(g.getByText(/until 2:4\d\sPM, then Sud 12/)).toBeTruthy();
  expect(g.getByText("Choghadiya: Amrut")).toBeTruthy();
  expect(g.getByText("Many avoid now")).toBeTruthy();
  expect(
    g.getByRole("button", { name: /^Bhadra until 2:4\d\sPM$/ }),
  ).toBeTruthy();
  expect(
    g.getByRole("button", { name: /^Rahu Kaal until 3:1\d\sPM$/ }),
  ).toBeTruthy();
  // Next good time skips Amrut (overlaps Rahu Kaal and Bhadra) and Kaal (not good).
  expect(g.getByText(/^Shubh, 4:4\d – 6:\d\d\sPM$/)).toBeTruthy();
});

it("renders Today in Gujarati, with Gujarati digits and time words", async () => {
  await loadLanguage("gu");
  saveSettings(defaultSettings(AHMEDABAD, "gu"));
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider
        router={createAppRouter(createMemoryHistory({ initialEntries: ["/"] }))}
      />
    </QueryClientProvider>,
  );
  const h1 = await screen.findByRole("heading", {
    level: 1,
    name: "આસો સુદ ૧૧",
  });
  expect(h1).toBeTruthy();
  expect(await screen.findByText("ચોઘડિયું: અમૃત")).toBeTruthy();
  expect(screen.getByText(/^શુભ, ૪:૪[૦-૯] – ૬:[૦-૯]{2}\sસાંજે$/)).toBeTruthy();
  await loadLanguage("en");
});
