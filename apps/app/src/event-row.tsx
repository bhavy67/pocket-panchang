// One family-date row and marker, shared by Today, Events, Month and Day detail.
import type { CivilDate } from "@panchang/engine";
import { Link } from "@tanstack/react-router";
import type { UpcomingRow } from "@/events-data";
import { t } from "@/i18n";
import { dateShort, daysBetween } from "@/lib/format";
import { lunarLabel } from "@/policy";
import type { Settings } from "@/settings";
import { card } from "@/ui";

export const inDays = (n: number) =>
  n === 0 ? t("inToday") : n === 1 ? t("inTomorrow") : t("inDays", { n });

export const rowLabels = (r: UpcomingRow) =>
  r.occurrences.map((o) =>
    o.kind === "pitru-paksha"
      ? t("pitruPaksha")
      : o.month === "adhik"
        ? t("extraMonth")
        : null,
  );

export function EventRow({
  r,
  today,
  s,
}: {
  r: UpcomingRow;
  today: CivilDate;
  s: Settings;
}) {
  const labels = rowLabels(r).filter(Boolean);
  const city = r.occurrences[0]!.observance;
  return (
    <Link
      to="/events/$id"
      params={{ id: r.event.id }}
      className={`flex min-h-18 w-full flex-wrap items-center gap-3 p-4 hover:bg-surface-sunken focus-ring ${card}`}
    >
      <PersonalIcon />
      <span className="flex min-w-[min(9rem,100%)] flex-1 flex-col">
        <span className="text-caption font-semibold text-personal-event">
          {t("familyDate")}
          {labels.length > 0 &&
            t("rowLabelSep") + labels.join(t("rowLabelSep"))}
        </span>
        <span className="text-lg leading-tight font-semibold">
          {r.event.title}
        </span>
        <span className="text-sm text-text-muted">
          {lunarLabel(r.event.lunarDate)} · {dateShort(r.date)}
          {city.id !== s.location.id && t("inCity", { city: city.name })}
        </span>
      </span>
      <span className="flex-none text-right text-sm font-semibold">
        {inDays(daysBetween(today, r.date))}
      </span>
    </Link>
  );
}

/** Personal-event marker: a ring (festivals use a diamond). */
export function PersonalIcon({ small = false }: { small?: boolean }) {
  return small ? (
    <span
      aria-hidden="true"
      className="block size-2.5 flex-none rounded-full border-2 border-personal-event"
    />
  ) : (
    <span
      aria-hidden="true"
      className="flex size-11 flex-none items-center justify-center rounded-full bg-personal-event-subtle"
    >
      <span className="block size-4 rounded-full border-3 border-personal-event" />
    </span>
  );
}
