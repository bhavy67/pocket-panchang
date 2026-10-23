// Lazy route components (§7: every route except Today loads on demand).
import { getRouteApi } from "@tanstack/react-router";
import { DayDetail } from "@/day-detail";
import { Month } from "@/month";
import { todayIn } from "@/router";
import { yearMonthOf } from "@/lib/year-month";
import { useSettings } from "@/settings";

const monthApi = getRouteApi("/app/month");
const dayApi = getRouteApi("/app/day");

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
