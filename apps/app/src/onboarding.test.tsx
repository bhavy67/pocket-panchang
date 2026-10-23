// Phase 7 exit criteria: onboarding completes, settings persist across reloads, today computes.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { createAppRouter } from "@/router";
import { hydrateSettings, persistSettings, useSettings } from "@/settings";

// jsdom has no Worker: call the worker API in-process.
vi.mock("@/worker/client", async () => ({
  worker: (await import("@/worker/api")).api,
}));

beforeAll(() => {
  const cities = readFileSync(
    join(import.meta.dirname, "../public/data/cities.json"),
    "utf8",
  );
  vi.stubGlobal("fetch", () => Promise.resolve(new Response(cities)));
});

function renderApp() {
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: ["/"] }),
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

describe("onboarding", () => {
  it("picks a city and language, persists, and shows today after a reload", async () => {
    const stop = persistSettings();
    const user = userEvent.setup();
    const router = renderApp();

    await user.type(await screen.findByLabelText("Search your city"), "Nadiad");
    await user.click(
      await screen.findByRole("button", { name: "Nadiad, Gujarat, India" }),
    );
    await user.click(screen.getByRole("button", { name: /^ગુજરાતી/ }));
    await vi.waitFor(() => expect(router.state.location.pathname).toBe("/"));
    await vi.waitFor(async () => expect(await db.settings.count()).toBe(1));
    stop();

    // "Reload": empty store, read back from IndexedDB.
    useSettings.setState({ settings: null });
    const settings = await hydrateSettings();
    expect(settings?.location.name).toBe("Nadiad");
    expect(settings?.observanceLocation.name).toBe("Nadiad");
    expect(settings?.language).toBe("gu");

    renderApp();
    expect(await screen.findByRole("heading", { level: 1 })).toBeTruthy();
  });

  it("redirects to onboarding when settings are unreadable", async () => {
    await db.settings.put({ key: "current", value: { location: "garbage" } });
    expect(await hydrateSettings()).toBeNull();
    const router = renderApp();
    await vi.waitFor(() =>
      expect(router.state.location.pathname).toBe("/onboarding"),
    );
  });
});
