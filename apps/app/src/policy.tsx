// Plain labels for occurrence policy (brief §4): technical terms only in help text.
import {
  BUILTIN_POLICY,
  type EventKind,
  type OccurrencePolicy,
  type PolicyOverrides,
} from "@panchang/calendar";
import { monthName, tithiLabel, type MessageKey } from "@panchang/i18n";
import { useId } from "react";
import type { StoredEvent } from "@/db";
import { inputClass } from "@/city-picker";
import { lang, t } from "@/i18n";
import type { Settings } from "@/settings";

export const KIND_LABEL: Record<EventKind, MessageKey> = {
  birthday: "kindBirthday",
  shraddh: "kindShraddh",
  anniversary: "kindAnniversary",
  custom: "kindCustom",
};

type ChoiceField = Exclude<keyof OccurrencePolicy, "pitruPaksha">;

/** Policy fields with message keys; resolve with t() at render time. */
export const FIELDS: {
  field: ChoiceField;
  label: MessageKey;
  help: MessageKey;
  options: Record<string, MessageKey>;
}[] = [
  {
    field: "window",
    label: "polWindow",
    help: "polWindowHelp",
    options: { sunrise: "polWindowSunrise", aparahna: "polWindowAparahna" },
  },
  {
    field: "vriddhiTithi",
    label: "polVriddhi",
    help: "polVriddhiHelp",
    options: {
      "first-day": "polVriddhiFirst",
      "second-day": "polVriddhiSecond",
    },
  },
  {
    field: "kshayaTithi",
    label: "polKshaya",
    help: "polKshayaHelp",
    options: { "same-day": "polKshayaSame", "following-day": "polKshayaNext" },
  },
  {
    field: "adhikMonth",
    label: "polAdhik",
    help: "polAdhikHelp",
    options: {
      nija: "polAdhikNija",
      adhik: "polAdhikAdhik",
      "match-origin": "polAdhikMatch",
      both: "polAdhikBoth",
    },
  },
  {
    field: "tithiSource",
    label: "polSource",
    help: "polSourceHelp",
    options: { moment: "polSourceMoment", "calendar-day": "polSourceCalendar" },
  },
];

/** The value an event inherits (family convention, else built-in) and where it comes from. */
export function inherited<K extends keyof OccurrencePolicy>(
  s: Settings,
  kind: EventKind,
  field: K,
) {
  const family = s.householdPolicy[kind]?.[field];
  return family === undefined
    ? { value: BUILTIN_POLICY[kind][field], source: "built-in" as const }
    : { value: family, source: "family" as const };
}

/** A select whose first option means "no override: use the inherited value". */
export function PolicySelect({
  field,
  value,
  inheritedValue,
  inheritedFrom,
  onChange,
}: {
  field: (typeof FIELDS)[number];
  value: string | undefined;
  inheritedValue: string;
  /** Where the inherited value comes from. */
  inheritedFrom: "built-in" | "family";
  onChange: (v: string | undefined) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-body font-semibold">
        {t(field.label)}
      </label>
      <span className="text-sm">
        {t("inheritedValue", {
          source: t(
            inheritedFrom === "family" ? "familyDefault" : "usualDefault",
          ),
          value: t(field.options[inheritedValue]!),
        })}
      </span>
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className={inputClass}
      >
        <option value="">
          {t(
            inheritedFrom === "family" ? "useFamilyDefault" : "useUsualDefault",
          )}
        </option>
        {Object.entries(field.options).map(([v, label]) => (
          <option key={v} value={v}>
            {t(label)}
          </option>
        ))}
      </select>
      <span className="text-sm text-text-muted">{t(field.help)}</span>
    </div>
  );
}

export const setOverride = (
  o: PolicyOverrides,
  field: keyof OccurrencePolicy,
  v: unknown,
): PolicyOverrides => {
  const next: Record<string, unknown> = { ...o };
  if (v === undefined) delete next[field];
  else next[field] = v;
  return next;
};

/** "Kartak Vad 5", with "Adhik" when the original date was in an extra month. */
export const lunarLabel = (d: StoredEvent["lunarDate"]) =>
  `${monthName(d.month, lang(), d.adhik)} ${tithiLabel(d.paksha === "shukla" ? d.tithi : d.tithi + 15, lang())}`;
