// Onboarding (§9, brief §3.1): city → language, skippable to defaults. Visual design is Phase 8.
// ponytail: English strings inline until packages/i18n gets UI strings (Phase 10).
import type { Lang } from "@panchang/calendar";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useId, useState } from "react";
import { citySearchQuery } from "@/queries";
import { AHMEDABAD, defaultSettings, saveSettings } from "@/settings";
import type { City } from "@/worker/cities";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const cityLabel = ({ location, admin }: City) =>
  [location.name, admin, countryNames.of(location.country)]
    .filter(Boolean)
    .join(", ");

const LANGUAGES: { lang: Lang; label: string }[] = [
  { lang: "gu", label: "ગુજરાતી" },
  { lang: "en", label: "English" },
];

const button =
  "min-h-(--tap-min) rounded-md px-4 text-body focus-visible:outline-3 focus-visible:outline-focus-ring";

export function Onboarding() {
  const navigate = useNavigate();
  const [city, setCity] = useState<City | null>(null);
  const finish = (location = AHMEDABAD, language: Lang = "gu") => {
    saveSettings(defaultSettings(location, language));
    void navigate({ to: "/" });
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 bg-bg p-4 text-text">
      <div className="flex items-center justify-between">
        {city ? (
          <button
            type="button"
            className={`${button} border border-border`}
            onClick={() => setCity(null)}
          >
            Back
          </button>
        ) : (
          <span />
        )}
        <p className="text-sm text-text-muted">Step {city ? 2 : 1} of 2</p>
        <button
          type="button"
          className={`${button} text-text-muted underline`}
          onClick={() => finish()}
        >
          Skip
        </button>
      </div>
      {city ? (
        <LanguageStep
          onPick={(lang) => finish(city.location, lang)}
          city={city}
        />
      ) : (
        <CityStep onPick={setCity} />
      )}
    </main>
  );
}

function CityStep({ onPick }: { onPick: (city: City) => void }) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const { data, isError, isFetching } = useQuery({
    ...citySearchQuery(query),
    placeholderData: keepPreviousData,
  });
  const results = query.trim().length >= 2 ? (data ?? []) : [];

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-title font-semibold">
        <label htmlFor={inputId}>Search your city</label>
      </h1>
      <input
        id={inputId}
        type="search"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="min-h-(--tap-min) rounded-md border border-border-strong bg-surface px-3 text-body focus-visible:outline-3 focus-visible:outline-focus-ring"
      />
      <p className="text-sm text-text-muted" aria-live="polite">
        {isError
          ? "City list could not be loaded. Try again."
          : query.trim().length >= 2 && !isFetching && results.length === 0
            ? "No city found. Try a nearby larger town."
            : ""}
      </p>
      <ul className="flex flex-col gap-2">
        {results.map((c) => (
          <li key={c.location.id}>
            <button
              type="button"
              className={`${button} w-full border border-border bg-surface text-left`}
              onClick={() => onPick(c)}
            >
              {cityLabel(c)}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-auto text-caption text-text-muted">
        City data: GeoNames (geonames.org), CC-BY 4.0
      </p>
    </section>
  );
}

function LanguageStep({
  city,
  onPick,
}: {
  city: City;
  onPick: (lang: Lang) => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-title font-semibold">Choose your language</h1>
      <p className="text-text-muted">{cityLabel(city)}</p>
      {LANGUAGES.map(({ lang, label }) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          className={`${button} border border-border bg-surface text-lg`}
          onClick={() => onPick(lang)}
        >
          {label}
        </button>
      ))}
    </section>
  );
}
