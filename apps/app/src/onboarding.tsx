// Onboarding (§9, brief §3.1): city → language, skippable to defaults, in the Today screen's
// visual language. ponytail: English strings inline until packages/i18n gets UI strings (Phase 10).
import type { Lang } from "@panchang/calendar";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CityPicker, cityLabel } from "@/city-picker";
import { deviceLang, loadLanguage, t } from "@/i18n";
import { AHMEDABAD, defaultSettings, saveSettings } from "@/settings";
import { btnOutline } from "@/ui";
import type { City } from "@/worker/cities";

const LANGUAGES: { lang: Lang; label: string; note: string }[] = [
  { lang: "gu", label: "ગુજરાતી", note: "Gujarati" },
  { lang: "en", label: "English", note: "English" },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [city, setCity] = useState<City | null>(null);
  // The device guess shown on step 1, until the step 2 cards confirm (or this toggle overrides) it.
  const [uiLang, setUiLang] = useState<Lang>(deviceLang);
  const step = city ? 2 : 1;
  const switchLanguage = (l: Lang) =>
    void loadLanguage(l).then(() => setUiLang(l));
  const finish = async (location = AHMEDABAD, language: Lang = uiLang) => {
    await loadLanguage(language);
    saveSettings(defaultSettings(location, language));
    await navigate({ to: "/" });
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 bg-bg p-4 text-text">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {city ? (
          <button
            type="button"
            className={btnOutline}
            onClick={() => setCity(null)}
          >
            {t("back")}
          </button>
        ) : (
          <button
            type="button"
            lang={uiLang === "gu" ? "en" : "gu"}
            className="min-h-(--tap-min) rounded-md px-2 text-body text-text-muted underline underline-offset-3 focus-ring"
            onClick={() => switchLanguage(uiLang === "gu" ? "en" : "gu")}
          >
            {uiLang === "gu" ? "English" : "ગુજરાતી"}
          </button>
        )}
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <span className="sr-only">{t("stepOf", { n: step, total: 2 })}</span>
          {[1, 2].map((n) => (
            <span
              key={n}
              aria-hidden="true"
              className={`block size-2.5 rounded-full ${n === step ? "bg-accent" : "bg-border-strong"}`}
            />
          ))}
        </p>
        <button
          type="button"
          className="min-h-(--tap-min) px-3 text-body text-text-muted underline underline-offset-3 focus-ring"
          onClick={() => void finish()}
        >
          {t("skip")}
        </button>
      </div>

      {step === 1 && (
        <header className="flex flex-col gap-2">
          <h1 className="text-headline leading-(--leading-heading) font-strong">
            {t("onbTitle")}
          </h1>
          <p className="text-body text-text-muted">{t("onbBody")}</p>
        </header>
      )}

      {city ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-title leading-(--leading-heading) font-strong">
            {t("chooseLanguage")}
          </h2>
          <p className="text-text-muted">{cityLabel(city)}</p>
          {LANGUAGES.map(({ lang, label, note }) => (
            <button
              key={lang}
              type="button"
              lang={lang}
              className="flex min-h-16 flex-col items-start justify-center px-card text-left hover:bg-surface-sunken focus-ring card"
              onClick={() => void finish(city.location, lang)}
            >
              <span className="text-lg font-label">{label}</span>
              {lang !== "en" && (
                <span lang="en" className="text-sm text-text-muted">
                  {note}
                </span>
              )}
            </button>
          ))}
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <CityPicker label={t("searchCity")} onPick={setCity} />
          <p className="text-sm text-text-muted">{t("onbCityHint")}</p>
        </section>
      )}
      <p className="mt-auto text-caption text-text-muted">
        {t("cityAttributionShort")}
      </p>
    </main>
  );
}
