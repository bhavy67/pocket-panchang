import { useQuery } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
  redirect,
  type RouterHistory,
} from "@tanstack/react-router";
import type { Instant } from "@panchang/engine";
import { clockFor } from "@/lib/clock";
import { yearMonthOf } from "@/lib/year-month";
import { monthQuery } from "@/queries";
import { useSettings, type Settings } from "@/settings";

// Code-based routes, no codegen (ADR 0014).
const rootRoute = createRootRoute({ component: Outlet });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's redirect idiom
    if (!useSettings.getState().settings) throw redirect({ to: "/onboarding" });
  },
  component: Home,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  // Lazy: only first-run users need it (and the city search behind it).
  component: lazyRouteComponent(() => import("@/onboarding"), "Onboarding"),
});

export const routeTree = rootRoute.addChildren([indexRoute, onboardingRoute]);

export const createAppRouter = (history?: RouterHistory) =>
  createRouter({ routeTree, ...(history && { history }) });

/** Today's civil date in the settings city. */
export const todayIn = (s: Settings) =>
  clockFor(s.location.tz).localDate(Date.now() as Instant);

// ponytail: placeholder until the Phase 8 Today screen; proves the worker computes today.
// Shows the calendar date's panchang, not yet the sunrise-to-sunrise "current" day.
function Home() {
  const settings = useSettings((s) => s.settings)!;
  const today = todayIn(settings);
  const { data } = useQuery(monthQuery(settings, yearMonthOf(today)));
  const day = data?.find((d) => d.date === today)?.day;

  return (
    <main className="min-h-dvh bg-bg p-6 text-text">
      <h1 className="text-title font-semibold">Pocket Panchang</h1>
      <p>
        {settings.location.name} · {today}
      </p>
      {day?.kind === "day" && (
        <p data-testid="today-tithi">
          Tithi {day.tithi.atSunrise} ({day.paksha}) · {day.month.name}
        </p>
      )}
    </main>
  );
}

export const router = createAppRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
