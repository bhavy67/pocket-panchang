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
  const hero = await screen.findByRole("region", { name: "Today's tithi" });
  expect(
    within(hero).getByRole("heading", { level: 1, name: "Aaso Sud 11" }),
  ).toBeTruthy();
  expect(within(hero).getByText(/until 2:4\d\sPM, then Sud 12/)).toBeTruthy();
  const now = screen.getByRole("region", { name: /^Good time starts at/ });
  const n = within(now);
  // Next good time skips Amrut (overlaps Rahu Kaal and Bhadra) and Kaal (not good): Shubh.
  expect(
    n.getByRole("heading", { name: /^Good time starts at 4:4\d\sPM$/ }),
  ).toBeTruthy();
  expect(
    n.getByText(
      "Amrut is a good time, but Bhadra and Rahu Kaal are on, so many families wait.",
    ),
  ).toBeTruthy();
  expect(
    n.getByRole("button", { name: /^Amrut · good until 3:1\d\sPM$/ }),
  ).toBeTruthy();
  expect(
    n.getByRole("button", { name: /^Bhadra · avoid until 2:4\d\sPM$/ }),
  ).toBeTruthy();
  expect(
    n.getByRole("button", { name: /^Rahu Kaal · avoid until 3:1\d\sPM$/ }),
  ).toBeTruthy();
  // The ribbon names all 8 day Choghadiya.
  expect(
    within(screen.getByRole("list", { name: "Your day" })).getAllByRole(
      "button",
    ),
  ).toHaveLength(8);
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
  expect(
    await screen.findByRole("heading", {
      name: /^સારો સમય ૪:૪[૦-૯] સાંજે એ શરૂ થાય છે$/,
    }),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", { name: /^અમૃત · સારો ૩:૧[૦-૯] બપોરે સુધી$/ }),
  ).toBeTruthy();
  await loadLanguage("en");
});

it("before sunrise, names the panchang day still running and when it ends", async () => {
  vi.setSystemTime(new Date("2026-10-22T00:30:00Z")); // 6:00 AM IST Thu, before 6:39 sunrise
  saveSettings(defaultSettings(AHMEDABAD, "en"));
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider
        router={createAppRouter(createMemoryHistory({ initialEntries: ["/"] }))}
      />
    </QueryClientProvider>,
  );
  expect(
    await screen.findByText(
      /^Panchang day: Wednesday · until sunrise 6:3\d\sAM$/,
    ),
  ).toBeTruthy();
  // The glance is still Wednesday's tithi (Aaso Sud 10 at Wednesday's sunrise → Sud 11 now).
  expect(
    await screen.findByRole("heading", { level: 1, name: /^Aaso Sud 1[01]$/ }),
  ).toBeTruthy();
  vi.setSystemTime(new Date("2026-10-22T08:40:00Z"));
});
