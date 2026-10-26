// Theme lab (Phase 11.6, ADR 0025): Today in all six themes, light and dark, side by side at
// phone width. Each frame is the real app in an iframe (?palette preview), so
// every theme gets its own document, viewport and text size. Dev and E2E builds only (LAB), so
// these strings are not translated.
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSettings } from "@/settings";

const THEMES = [
  {
    id: "calm",
    name: "Calm",
    who: "Everyone (default)",
    why: "Contemporary and quiet: light neutral ground, soft elevation instead of borders, one indigo accent.",
    type: "Plus Jakarta Sans + Anek Gujarati",
  },
  {
    id: "raat",
    name: "Raat",
    who: "Night owls, younger users, checks at night",
    why: "True-black OLED with tonal layers, a glowing moon and a luminous cyan accent; dark first.",
    type: "Space Grotesk + Anek Gujarati",
  },
  {
    id: "kagaz",
    name: "Kagaz",
    who: "Elders, traditional households, printed-panchang lovers",
    why: "Modern editorial: paper white, ink black, print red, ruled sections, larger type for reading at arm's length.",
    type: "Fraunces + Noto Serif Gujarati",
  },
  {
    id: "mandir",
    name: "Mandir",
    who: "Devotional users, daily puja, temple-goers",
    why: "Warm and serene: saffron ground, marigold moon halo, maroon headings, gold hairlines, unhurried spacing.",
    type: "Marcellus + Hind Vadodara",
  },
  {
    id: "utsav",
    name: "Utsav",
    who: "Young families, festivals, kids",
    why: "Joyful and rounded: rangoli brights on a calm base, tonal pink cards, pill ribbon, big radii.",
    type: "Baloo Bhai 2",
  },
  {
    id: "shunya",
    name: "Shunya",
    who: "Busy professionals and NRIs who want facts fast",
    why: "Minimal monochrome, compact density, hairline rules instead of cards, one signal-orange accent.",
    type: "Geist + Anek Gujarati",
  },
] as const;

type Opt<T extends string> = { value: T; label: string };

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Opt<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">{label}</legend>
      <span aria-hidden="true" className="text-sm text-text-muted">
        {label}
      </span>
      {options.map((o) => (
        <label
          key={o.value}
          className="flex min-h-11 cursor-pointer items-center rounded-full bg-surface-sunken px-4 text-sm font-label has-checked:bg-accent has-checked:text-text-on-accent has-focus-visible:outline-3 has-focus-visible:outline-focus-ring"
        >
          <input
            type="radio"
            name={label}
            className="sr-only"
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}

export function ThemeLab() {
  const onboarded = useSettings((st) => !!st.settings);
  const [lang, setLang] = useState<"en" | "gu">("en");
  const [scale, setScale] = useState<"1" | "2">("1");
  const [modes, setModes] = useState<"both" | "light" | "dark">("both");

  return (
    <main className="flex flex-col gap-8 px-4 py-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline font-heading">Theme lab</h1>
        <p className="max-w-160 text-body text-text-muted">
          Today in all six themes at phone width. Each frame is the live app, so
          you can scroll and tap inside it. Swipe sideways to compare light and
          dark.
        </p>
        {!onboarded && (
          <p className="text-body">
            Set a city first, then come back:{" "}
            <Link to="/onboarding" className="text-accent underline focus-ring">
              open setup
            </Link>
            .
          </p>
        )}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Choice
            label="Language"
            value={lang}
            onChange={setLang}
            options={[
              { value: "en", label: "English" },
              { value: "gu", label: "ગુજરાતી" },
            ]}
          />
          <Choice
            label="Text"
            value={scale}
            onChange={setScale}
            options={[
              { value: "1", label: "100%" },
              { value: "2", label: "200%" },
            ]}
          />
          <Choice
            label="Modes"
            value={modes}
            onChange={setModes}
            options={[
              { value: "both", label: "Both" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </div>
      </header>

      {onboarded &&
        THEMES.map((th) => {
          const order =
            th.id === "raat" ? ["dark", "light"] : ["light", "dark"];
          return (
            <section
              key={th.id}
              aria-labelledby={`lab-${th.id}`}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1">
                <h2 id={`lab-${th.id}`} className="text-title font-heading">
                  {th.name}
                </h2>
                <p className="text-sm font-label">{th.who}</p>
                <p className="max-w-160 text-sm text-text-muted">
                  {th.why} <span className="whitespace-nowrap">{th.type}.</span>
                </p>
              </div>
              <div
                role="region"
                aria-label={`${th.name} frames`}
                // A focusable scroller lets keyboard users scroll it (axe scrollable-region-focusable).
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={0}
                className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 focus-ring"
              >
                {order
                  .filter((m) => modes === "both" || modes === m)
                  .map((mode) => (
                    <figure
                      key={mode}
                      className="flex flex-none snap-center flex-col gap-1"
                    >
                      <iframe
                        title={`${th.name} ${mode}`}
                        loading="lazy"
                        src={`/?palette=${th.id}&mode=${mode}&lang=${lang}&scale=${scale}`}
                        className="h-[48rem] w-[min(390px,calc(100vw-2rem))] rounded-md bg-surface-sunken"
                      />
                      <figcaption className="text-sm text-text-muted">
                        {th.name} · {mode}
                      </figcaption>
                    </figure>
                  ))}
              </div>
            </section>
          );
        })}
    </main>
  );
}
