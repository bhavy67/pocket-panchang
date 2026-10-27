// The live moon (ADR 0024 signature element): drawn from the real Moon–Sun elongation.
import type { Instant } from "@panchang/engine";
import { useQuery } from "@tanstack/react-query";
import { useId } from "react";
import { t } from "@/i18n";
import { illuminated, moonPath } from "@/lib/moon";
import { worker } from "@/worker/client";

/** Elongation now, refreshed every 10 minutes (the phase moves ~5° per 10 hours). */
export function useElongation(now: Instant): number | undefined {
  const bucket = Math.floor(now / 600_000);
  return useQuery({
    queryKey: ["moon-phase", bucket],
    queryFn: () => worker.moonPhase((bucket * 600_000) as Instant),
  }).data;
}

export function MoonDisc({
  elongation,
  size = "var(--moon-size)",
  decorative = false,
}: {
  elongation: number | undefined;
  /** CSS size (rem, so it grows with text size); the theme sets the default. */
  size?: string;
  decorative?: boolean;
}) {
  const e = elongation ?? 0;
  const lit = moonPath(e, 50, 46);
  const pct = Math.round(illuminated(e) * 100);
  const label = t("moonAria", {
    pct,
    phase: t(((e % 360) + 360) % 360 < 180 ? "waxing" : "waning"),
  });
  const id = useId();
  const clip = `${id}clip`;
  const blur = `${id}blur`;
  const mariaBlur = `${id}mariaBlur`;
  const earthshine = `${id}earthshine`;
  const sheen = `${id}sheen`;
  return (
    // A few themes' moon-lit sits close in lightness to the surface/card behind it (by design,
    // for a calm daylight UI); a faint, always-present `--text`-tinted contact shadow keeps the
    // disc readable against its background everywhere, independent of `--moon-glow` (which is
    // each theme's own creative choice, and "none" in several — can't just chain filters with
    // that keyword, hence the wrapper rather than one combined `filter`).
    <span
      className="inline-flex flex-none"
      style={{
        filter:
          "drop-shadow(0 1px 4px color-mix(in srgb, var(--text) 32%, transparent))",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{ width: size, height: size, filter: "var(--moon-glow)" }}
        {...(decorative || elongation === undefined
          ? { "aria-hidden": true }
          : { role: "img", "aria-label": label })}
      >
        <defs>
          <clipPath id={clip}>
            <circle cx="50" cy="50" r="46" />
          </clipPath>
          {/* Softens only the terminator (the clip below keeps the outer limb crisp). */}
          <filter id={blur} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.3" />
          </filter>
          <filter id={mariaBlur} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          {/* The old moon in the new moon's arms: a faint glow on the unlit side. */}
          <radialGradient id={earthshine}>
            <stop
              offset="0%"
              className="moon-earthshine-stop"
              stopOpacity="0.22"
            />
            <stop
              offset="100%"
              className="moon-earthshine-stop"
              stopOpacity="0"
            />
          </radialGradient>
          {/* Lit from one side, like the real thing: a soft sheen, off-centre toward the limb. */}
          <radialGradient id={sheen} cx="38%" cy="35%">
            <stop
              offset="0%"
              className="moon-earthshine-stop"
              stopOpacity="0.28"
            />
            <stop
              offset="55%"
              className="moon-earthshine-stop"
              stopOpacity="0"
            />
          </radialGradient>
        </defs>
        <g clipPath={`url(#${clip})`} style={{ isolation: "isolate" }}>
          <circle cx="50" cy="50" r="46" className="fill-moon-dark" />
          {/* A few themes' moon-lit/moon-dark sit close in lightness (by design, for a calm
            daylight UI) — too close for the dark side to read once it's also carrying texture.
            A fixed, theme-independent wash guarantees the terminator and maria stay visible
            everywhere, light or dark mode, without touching any theme's own tokens. */}
          <circle cx="50" cy="50" r="46" fill="black" fillOpacity="0.16" />
          <circle cx="50" cy="50" r="46" fill={`url(#${earthshine})`} />
          {lit && (
            <path d={lit} className="fill-moon-lit" filter={`url(#${blur})`} />
          )}
          {/* Maria (Phase 11.7): fixed on the sphere's face, not the terminator, so they shift in
            and out of the lit region exactly as the real Moon's do as the phase changes. Plain
            black (not the theme's moon-dark) so they stay visible even in low-contrast themes. */}
          <g
            fill="black"
            filter={`url(#${mariaBlur})`}
            style={{ mixBlendMode: "multiply" }}
            opacity="0.4"
          >
            <ellipse cx="38" cy="38" rx="11" ry="9" />
            <ellipse cx="58" cy="36" rx="8" ry="7" />
            <ellipse cx="64" cy="50" rx="10" ry="9" />
            <ellipse cx="28" cy="52" rx="9" ry="14" />
            <ellipse cx="40" cy="64" rx="7" ry="6" />
            <ellipse cx="74" cy="40" rx="4" ry="4" />
          </g>
          <circle
            cx="50"
            cy="50"
            r="46"
            fill={`url(#${sheen})`}
            style={{ mixBlendMode: "screen" }}
          />
        </g>
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          style={{
            stroke: "var(--moon-rim)",
            strokeWidth: "var(--moon-rim-width)",
          }}
        />
      </svg>
    </span>
  );
}
