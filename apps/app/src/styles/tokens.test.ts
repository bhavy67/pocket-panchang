import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// tokens.css is the single source of truth for colour (ADR 0017). This test fails the
// build if any palette × mode is incomplete, breaks the layer rule, or misses WCAG AA,
// and if a raw colour appears in any other stylesheet.

const STYLES_DIR = import.meta.dirname;
const SRC_DIR = join(STYLES_DIR, "..");
const css = readFileSync(join(STYLES_DIR, "tokens.css"), "utf8");

const PALETTES = ["calm", "mandir", "raat"] as const;
const MODES = ["light", "dark"] as const;
const SEMANTIC = [
  "bg",
  "surface",
  "surface-raised",
  "surface-sunken",
  "text",
  "text-muted",
  "text-on-accent",
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
] as const;
type Semantic = (typeof SEMANTIC)[number];

const RAW_COLOUR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;

function declarations(block: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out.set(m[1] ?? "", (m[2] ?? "").trim());
  }
  return out;
}

const primitives = declarations(/:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? "");

function themeBlock(palette: string, mode: string): Map<string, string> {
  const re = new RegExp(
    `\\[data-palette="${palette}"\\]\\[data-mode="${mode}"\\]\\s*\\{([^}]*)\\}`,
  );
  return declarations(re.exec(css)?.[1] ?? "");
}

function resolve(theme: Map<string, string>, token: Semantic): string {
  const ref = /^var\((--[a-z0-9-]+)\)$/.exec(
    theme.get(`--${token}`) ?? "",
  )?.[1];
  const hex = ref ? primitives.get(ref) : undefined;
  if (!hex) throw new Error(`--${token} does not resolve to a primitive`);
  return hex;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}

// Pairs from docs/design/brief.md §8.3: [foreground, background, minimum ratio].
const BACKGROUNDS: Semantic[] = [
  "bg",
  "surface",
  "surface-raised",
  "surface-sunken",
];
const TEXT_ON_BG: Semantic[] = [
  "text",
  "text-muted",
  "accent",
  "danger",
  "warning",
  "auspicious",
  "inauspicious",
  "festival",
  "personal-event",
];
const NON_TEXT_ON_BG: Semantic[] = [
  "border-strong",
  "focus-ring",
  "now-marker",
];
const WITH_SUBTLE = [
  "auspicious",
  "inauspicious",
  "festival",
  "personal-event",
  "accent",
  "warning",
] as const;

const PAIRS: [Semantic, Semantic, number][] = [
  ...BACKGROUNDS.flatMap((bg) => [
    ...TEXT_ON_BG.map((fg): [Semantic, Semantic, number] => [fg, bg, 4.5]),
    ...NON_TEXT_ON_BG.map((fg): [Semantic, Semantic, number] => [fg, bg, 3]),
  ]),
  ["text-on-accent", "accent", 4.5],
  ...WITH_SUBTLE.flatMap((d): [Semantic, Semantic, number][] => [
    ["text", `${d}-subtle`, 4.5],
    [d, `${d}-subtle`, 4.5],
  ]),
];

describe.each(PALETTES.flatMap((p) => MODES.map((m) => [p, m] as const)))(
  "%s %s",
  (palette, mode) => {
    const theme = themeBlock(palette, mode);

    it("defines exactly the semantic token set, each as var(--primitive)", () => {
      const defined = [...theme.keys()].map((k) => k.slice(2)).sort();
      expect(defined).toEqual([...SEMANTIC].sort());
      for (const token of SEMANTIC)
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
