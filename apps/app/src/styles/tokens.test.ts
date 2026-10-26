import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PALETTES } from "@/settings";
import { contrast } from "./colour";

// tokens.css is the single source of truth for theme values (ADR 0017, 0025). This test fails
// the build if any theme or theme × mode is incomplete, breaks the layer rule, misses WCAG AA,
// drops below the modern baseline, or if a raw colour appears in any other stylesheet.

const STYLES_DIR = import.meta.dirname;
const SRC_DIR = join(STYLES_DIR, "..");
const css = readFileSync(join(STYLES_DIR, "tokens.css"), "utf8");

const MODES = ["light", "dark"] as const;
const COLOUR = [
  "bg",
  "surface",
  "surface-raised",
  "surface-sunken",
  "card-bg",
  "tile-bg",
  "text",
  "text-muted",
  "text-on-accent",
  "hero-text",
  "border",
  "border-strong",
  "focus-ring",
  "accent",
  "accent-subtle",
  "danger",
  "warning",
  "warning-subtle",
  "auspicious",
  "auspicious-subtle",
  "inauspicious",
  "inauspicious-subtle",
  "festival",
  "festival-subtle",
  "personal-event",
  "personal-event-subtle",
  "now-marker",
  "moon-lit",
  "moon-dark",
] as const;
type Colour = (typeof COLOUR)[number];
/** Per theme × mode, besides colours. */
const MODE_STYLE = ["card-shadow", "tile-shadow", "moon-glow"];
/** Per theme (mode-independent). Kagaz may also enlarge the --text-* scale. */
const STYLE = [
  "font-ui",
  "font-gu",
  "font-display",
  "font-weight-hero",
  "font-weight-heading",
  "font-weight-strong",
  "font-weight-label",
  "tracking-display",
  "radius-sm",
  "radius-md",
  "radius-cell",
  "radius-tile",
  "radius-lg",
  "radius-card",
  "spacing",
  "spacing-card",
  "spacing-tile",
  "card-border",
  "card-divider",
  "tile-border",
  "tile-divider",
  "moon-size",
  "moon-rim",
  "moon-rim-width",
  "ribbon-h",
  "ribbon-gap",
  "ribbon-radius",
  "ribbon-end-radius",
  "ribbon-lane-h",
];

const RAW_COLOUR =
  /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/;

function declarations(block: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out.set(m[1] ?? "", (m[2] ?? "").trim());
  }
  return out;
}

const primitives = declarations(/:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? "");
const block = (selector: string) =>
  declarations(
    new RegExp(
      `(?:^|\\n)${selector.replace(/[[\]]/g, "\\$&")}\\s*\\{([^}]*)\\}`,
    ).exec(css)?.[1] ?? "",
  );

function resolve(theme: Map<string, string>, token: Colour): string {
  const ref = /^var\((--[a-z0-9-]+)\)$/.exec(
    theme.get(`--${token}`) ?? "",
  )?.[1];
  const value = ref ? primitives.get(ref) : undefined;
  if (!value) throw new Error(`--${token} does not resolve to a primitive`);
  return value;
}

// Pairs from docs/design/brief.md §8.3 (+ ADR 0025 surfaces): [foreground, background, minimum].
const BACKGROUNDS: Colour[] = [
  "bg",
  "surface",
  "surface-raised",
  "surface-sunken",
  "card-bg",
  "tile-bg",
];
const TEXT_ON_BG: Colour[] = [
  "text",
  "text-muted",
  "hero-text",
  "accent",
  "danger",
  "warning",
  "auspicious",
  "inauspicious",
  "festival",
  "personal-event",
];
const NON_TEXT_ON_BG: Colour[] = ["border-strong", "focus-ring", "now-marker"];
const WITH_SUBTLE = [
  "auspicious",
  "inauspicious",
  "festival",
  "personal-event",
  "accent",
  "warning",
] as const;

const PAIRS: [Colour, Colour, number][] = [
  ...BACKGROUNDS.flatMap((bg) => [
    ...TEXT_ON_BG.map((fg): [Colour, Colour, number] => [fg, bg, 4.5]),
    ...NON_TEXT_ON_BG.map((fg): [Colour, Colour, number] => [fg, bg, 3]),
  ]),
  ["text-on-accent", "accent", 4.5],
  // Labels on solid "good" fills (Amrut in the ribbon) use the surface colour (ADR 0024).
  ["surface", "auspicious", 4.5],
  ...WITH_SUBTLE.flatMap((d): [Colour, Colour, number][] => [
    ["text", `${d}-subtle`, 4.5],
    [d, `${d}-subtle`, 4.5],
  ]),
];

it("defines a theme for every Settings palette, and no others", () => {
  const themes = [...css.matchAll(/\n\[data-palette="([a-z]+)"\] \{/g)].map(
    (m) => m[1],
  );
  expect(themes).toEqual([...PALETTES]);
});

it("shares the modern baseline: plain status rows", () => {
  const shared = declarations(
    [...css.matchAll(/:root\s*\{([^}]*)\}/g)][1]?.[1] ?? "",
  );
  expect(Object.fromEntries(shared)).toEqual({
    "--row-fill": "0%",
    "--row-pad": "0rem",
  });
});

it.each(PALETTES)("%s sets every style token, with modern weights", (p) => {
  const style = block(`[data-palette="${p}"]`);
  const set = [...style.keys()]
    .map((k) => k.slice(2))
    .filter((k) => !k.startsWith("text-"));
  expect(set.sort()).toEqual([...STYLE].sort());
  for (const w of ["hero", "heading", "strong", "label"])
    expect(Number(style.get(`--font-weight-${w}`))).toBeLessThanOrEqual(700);
  // The ribbon segments are buttons: ≥ 44 px at 100% text.
  expect(parseFloat(style.get("--ribbon-h") ?? "0")).toBeGreaterThanOrEqual(
    2.75,
  );
});

describe.each(PALETTES.flatMap((p) => MODES.map((m) => [p, m] as const)))(
  "%s %s",
  (palette, mode) => {
    const theme = block(`[data-palette="${palette}"][data-mode="${mode}"]`);

    it("defines exactly the colour set (each a primitive) plus mode style", () => {
      const defined = [...theme.keys()].map((k) => k.slice(2)).sort();
      expect(defined).toEqual([...COLOUR, ...MODE_STYLE].sort());
      for (const token of COLOUR)
        expect(() => resolve(theme, token)).not.toThrow();
    });

    it("meets WCAG AA for every required pair", () => {
      const failures = PAIRS.map(([fg, bg, min]) => ({
        fg,
        bg,
        min,
        ratio: contrast(resolve(theme, fg), resolve(theme, bg)),
      }))
        .filter(({ ratio, min }) => ratio < min)
        .map(
          ({ fg, bg, min, ratio }) =>
            `${fg} on ${bg}: ${ratio.toFixed(2)} < ${min}`,
        );
      expect(failures).toEqual([]);
    });
  },
);

it("has no raw colour values in any stylesheet except tokens.css", () => {
  const offenders = readdirSync(SRC_DIR, { recursive: true, encoding: "utf8" })
    .filter((f) => f.endsWith(".css") && !f.endsWith("tokens.css"))
    .filter((f) => RAW_COLOUR.test(readFileSync(join(SRC_DIR, f), "utf8")));
  expect(offenders).toEqual([]);
});
