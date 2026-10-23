// Lazy route components (§7: every route except Today loads on demand).
import { getRouteApi } from "@tanstack/react-router";
import { DayDetail } from "@/day-detail";
import { EventFormRoute } from "@/event-form";
import { Month } from "@/month";
import { todayIn } from "@/router";
import { yearMonthOf } from "@/lib/year-month";
import { useSettings } from "@/settings";

const monthApi = getRouteApi("/app/month");
const dayApi = getRouteApi("/app/day");
const eventApi = getRouteApi("/app/events/$id");

export { Events as EventsRoute } from "@/events";
export { SettingsScreen as SettingsRoute } from "@/settings-screen";
export { NotificationsHealth as NotificationsRoute } from "@/notifications-health";

export function EventRoute() {
  const { id } = eventApi.useParams();
  return <EventFormRoute id={id} />;
}

export function MonthRoute() {
  const s = useSettings((st) => st.settings)!;
  const { m, date } = monthApi.useSearch();
  const month = m ?? (date ? yearMonthOf(date) : yearMonthOf(todayIn(s)));
  return <Month month={month} {...(date ? { date } : {})} />;
}

export function DayRoute() {
  const s = useSettings((st) => st.settings)!;
  const { date } = dayApi.useSearch();
  return (
    <main>
      <DayDetail date={date ?? todayIn(s)} />
    </main>
  );
}
