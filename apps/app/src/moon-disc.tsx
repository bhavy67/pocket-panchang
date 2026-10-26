// The live moon (ADR 0024 signature element): drawn from the real Moon–Sun elongation.
import type { Instant } from "@panchang/engine";
import { useQuery } from "@tanstack/react-query";
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
  return (
    <svg
      viewBox="0 0 100 100"
      style={{ width: size, height: size, filter: "var(--moon-glow)" }}
      className="flex-none"
      {...(decorative || elongation === undefined
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": label })}
    >
      <circle cx="50" cy="50" r="46" className="fill-moon-dark" />
      {lit && <path d={lit} className="fill-moon-lit" />}
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
  );
}
