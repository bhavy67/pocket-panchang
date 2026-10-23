// Plain labels for occurrence policy (brief §4): technical terms only in help text.
import {
  BUILTIN_POLICY,
  type EventKind,
  type OccurrencePolicy,
  type PolicyOverrides,
} from "@panchang/calendar";
import { monthName, tithiLabel } from "@panchang/i18n";
import { useId } from "react";
import type { StoredEvent } from "@/db";
import { inputClass } from "@/city-picker";
import type { Settings } from "@/settings";

export const KIND_LABEL: Record<EventKind, string> = {
  birthday: "Birthday (by tithi)",
  shraddh: "Varsi / Shraddh",
  anniversary: "Anniversary",
  custom: "Other",
};

type ChoiceField = Exclude<keyof OccurrencePolicy, "pitruPaksha">;

export const FIELDS: {
  field: ChoiceField;
  label: string;
  help: string;
  options: Record<string, string>;
}[] = [
  {
    field: "window",
    label: "Which part of the day counts",
    help: "Technical terms: udaya (sunrise) or aparahna (afternoon).",
    options: {
      sunrise: "Follow printed calendar day",
      aparahna: "Traditional shraddh timing (afternoon)",
    },
  },
  {
    field: "vriddhiTithi",
    label: "When the tithi spans two days",
    help: "Technical term: vriddhi tithi.",
    options: { "first-day": "First day", "second-day": "Second day" },
  },
  {
    field: "kshayaTithi",
    label: "When the tithi is skipped that year",
    help: "Technical term: kshaya tithi.",
    options: {
      "same-day": "The day the tithi falls in the calendar",
      "following-day": "The next day",
    },
  },
  {
    field: "adhikMonth",
    label: "In a year with an extra month",
    help: "Technical terms: adhik (extra) and nija (regular) month.",
    options: {
      nija: "Regular month",
      adhik: "Extra month",
      "match-origin": "Match the original month",
      both: "Both",
    },
  },
  {
    field: "tithiSource",
    label: "When working out the tithi from a date",
    help: "Used by “I know the date”.",
    options: {
      moment: "Tithi at the time of birth/passing",
      "calendar-day": "Tithi shown on the calendar for that date",
    },
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
  inheritedLabel,
  onChange,
}: {
  field: (typeof FIELDS)[number];
  value: string | undefined;
  inheritedValue: string;
  inheritedLabel: string;
  onChange: (v: string | undefined) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-body font-semibold">
        {field.label}
      </label>
      <span className="text-sm">
        {inheritedLabel}: {field.options[inheritedValue]}
      </span>
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className={inputClass}
      >
        <option value="">Use the {inheritedLabel.toLowerCase()}</option>
        {Object.entries(field.options).map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
      <span className="text-sm text-text-muted">{field.help}</span>
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
  `${monthName(d.month, "en", d.adhik)} ${tithiLabel(d.paksha === "shukla" ? d.tithi : d.tithi + 15, "en")}`;
