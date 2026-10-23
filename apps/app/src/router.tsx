import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
  redirect,
  type RouterHistory,
} from "@tanstack/react-router";
import {
  isParseError,
  parseCivilDate,
  type CivilDate,
  type Instant,
  type ParseError,
} from "@panchang/engine";
import { clockFor } from "@/lib/clock";
import { parseYearMonth, type YearMonth } from "@/lib/year-month";
import { useSettings, type Settings } from "@/settings";
import { Today } from "@/today";
import { Shell } from "@/ui";

// Code-based routes, no codegen (ADR 0014). Search params are parsed at the route: a malformed
// ?date= or ?m= is dropped before any component sees it. Every route except Today is lazy (§7).

/** Today's civil date in the settings city. */
export const todayIn = (s: Settings) =>
  clockFor(s.location.tz).localDate(Date.now() as Instant);

const parsed = <T,>(
  v: unknown,
  parse: (s: string) => T | ParseError,
): T | undefined => {
  if (typeof v !== "string") return undefined;
  const r = parse(v);
  return isParseError(r) ? undefined : r;
};

const rootRoute = createRootRoute({ component: Outlet });

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's redirect idiom
    if (!useSettings.getState().settings) throw redirect({ to: "/onboarding" });
  },
  component: Shell,
});

const indexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  component: Today,
});

const monthRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/month",
  validateSearch: (
    q: Record<string, unknown>,
  ): { m?: YearMonth; date?: CivilDate } => {
    const m = parsed(q.m, parseYearMonth);
    const date = parsed(q.date, parseCivilDate);
    return { ...(m && { m }), ...(date && { date }) };
  },
  component: lazyRouteComponent(() => import("@/routes"), "MonthRoute"),
});

const dayRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/day",
  validateSearch: (q: Record<string, unknown>): { date?: CivilDate } => {
    const date = parsed(q.date, parseCivilDate);
    return date ? { date } : {};
  },
  component: lazyRouteComponent(() => import("@/routes"), "DayRoute"),
});

const eventsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/events",
  component: lazyRouteComponent(() => import("@/routes"), "EventsRoute"),
});

const eventRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/events/$id",
  component: lazyRouteComponent(() => import("@/routes"), "EventRoute"),
});

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/settings",
  component: lazyRouteComponent(() => import("@/routes"), "SettingsRoute"),
});

const notificationsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/settings/notifications",
  component: lazyRouteComponent(() => import("@/routes"), "NotificationsRoute"),
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  // Lazy: only first-run users need it (and the city search behind it).
  component: lazyRouteComponent(() => import("@/onboarding"), "Onboarding"),
});

export const routeTree = rootRoute.addChildren([
  appRoute.addChildren([
    indexRoute,
    monthRoute,
    dayRoute,
    eventsRoute,
    eventRoute,
    settingsRoute,
    notificationsRoute,
  ]),
  onboardingRoute,
]);

export const createAppRouter = (history?: RouterHistory) =>
  createRouter({ routeTree, ...(history && { history }) });

export const router = createAppRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
