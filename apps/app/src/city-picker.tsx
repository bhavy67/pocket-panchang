// Offline city search (§8): onboarding, Settings, and the event form's places.
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { lang, t } from "@/i18n";
import { citySearchQuery } from "@/queries";
import { card } from "@/ui";
import type { City } from "@/worker/cities";

export const cityLabel = ({ location, admin }: City) =>
  [
    location.name,
    admin,
    new Intl.DisplayNames([lang()], { type: "region" }).of(location.country),
  ]
    .filter(Boolean)
    .join(", ");

export const inputClass =
  "min-h-(--tap-min) w-full rounded-md border-[1.5px] border-border-strong bg-surface px-3 text-body text-text placeholder:text-text-muted focus-ring";

export function CityPicker({
  label,
  onPick,
}: {
  label: string;
  onPick: (city: City) => void;
}) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const { data, isError, isFetching } = useQuery({
    ...citySearchQuery(query),
    placeholderData: keepPreviousData,
  });
  const results = query.trim().length >= 2 ? (data ?? []) : [];

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-body font-semibold">
        {label}
      </label>
      <input
        id={inputId}
        type="search"
        autoComplete="off"
        value={query}
        placeholder={t("cityPlaceholder")}
        onChange={(e) => setQuery(e.target.value)}
        className={inputClass}
      />
      <p className="text-sm text-text-muted" aria-live="polite">
        {isError
          ? t("cityLoadError")
          : query.trim().length >= 2 && !isFetching && results.length === 0
            ? t("cityNotFound")
            : ""}
      </p>
      {results.length > 0 && (
        <ul className={`overflow-hidden ${card}`}>
          {results.map((c) => (
            <li
              key={c.location.id}
              className="border-t border-border first:border-t-0"
            >
              <button
                type="button"
                className="min-h-(--tap-min) w-full px-4 py-2 text-left text-body hover:bg-surface-sunken focus-ring"
                onClick={() => {
                  onPick(c);
                  setQuery("");
                }}
              >
                {cityLabel(c)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
