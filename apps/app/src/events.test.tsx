// Phase 9 exit flow: create a family date by tithi → it shows in upcoming with its next date.
import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { db } from "@/db";
import { queryClient } from "@/queries";
import { createAppRouter } from "@/router";
import { AHMEDABAD, defaultSettings, saveSettings } from "@/settings";

vi.mock("@/worker/client", async () => ({
  worker: (await import("@/worker/api")).api,
}));

beforeAll(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-22T08:40:00Z"));
  saveSettings(defaultSettings(AHMEDABAD, "en"));
});
afterAll(() => vi.useRealTimers());

it("creates a varsi by tithi and lists its next occurrence", async () => {
  const user = userEvent.setup();
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: ["/events/new"] }),
  );
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await user.type(await screen.findByLabelText("Name"), "Ba's varsi");
  await user.click(screen.getByLabelText("Varsi / Shraddh"));
  await user.click(screen.getByLabelText("I know the tithi"));
  await user.selectOptions(screen.getByLabelText("Month"), "Kartika");
  await user.selectOptions(screen.getByLabelText("Sud / Vad"), "krishna");
  await user.selectOptions(screen.getByLabelText("Tithi"), "5");
  await user.click(screen.getByRole("button", { name: "Save" }));

  await vi.waitFor(() =>
    expect(router.state.location.pathname).toBe("/events"),
  );
  expect(await db.events.count()).toBe(1);
  // The annual date, then Pitru Paksha (on by default for a varsi) next September.
  const [annual, pitru] = await screen.findAllByRole("link", {
    name: /Ba's varsi/,
  });
  expect(annual!.textContent).toMatch(/Kartak Vad 5 · \w{3} \d{1,2} Nov/);
  expect(pitru!.textContent).toMatch(/Pitru Paksha.*\w{3} \d{1,2} (Sep|Oct)/);
});
