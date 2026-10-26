// Colour maths for the token tests (ADR 0017, 0025): parses the token files' primitives
// (hex or oklch) to sRGB and computes WCAG 2.x contrast. Test-only; not bundled.

/** sRGB channels 0–1, clipped to the gamut the way browsers draw out-of-gamut oklch today. */
export function toRgb(value: string): [number, number, number] {
  const hex = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (hex)
    return [0, 2, 4].map(
      (i) => parseInt(hex[1]!.slice(i, i + 2), 16) / 255,
    ) as [number, number, number];
  const ok = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(
    value.trim(),
  );
  if (!ok) throw new Error(`Unsupported colour: ${value}`);
  const [L, C, H] = [Number(ok[1]), Number(ok[2]), Number(ok[3])];
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((c) => {
    const v = Math.min(1, Math.max(0, c));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  }) as [number, number, number];
}

function luminance(value: string): number {
  const [r, g, b] = toRgb(value).map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}
