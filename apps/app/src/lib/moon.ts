// Moon-phase drawing (ADR 0024): the lit part of a disc for a Moon–Sun elongation e (degrees).
// Illuminated fraction k = (1 − cos e) / 2. Waxing (e < 180°) is lit on the right, waning on
// the left (as seen from the northern tropics, where printed panchangs draw it).

/** Fraction of the disc that is lit, 0 (new) … 1 (full). */
export const illuminated = (e: number) =>
  (1 - Math.cos((e * Math.PI) / 180)) / 2;

/**
 * SVG path (centre `c`, radius `r`) for the lit region: the lit half-circle on one side, closed
 * by the terminator, a half-ellipse whose x-radius is r·|cos e|. Returns "" at new moon.
 */
export function moonPath(e: number, c: number, r: number): string {
  const deg = ((e % 360) + 360) % 360;
  const cos = Math.cos((deg * Math.PI) / 180);
  if (1 - cos < 1e-6) return ""; // new moon: nothing lit
  const waxing = deg < 180;
  const rx = Math.round(Math.abs(cos) * r * 100) / 100;
  const top = `${c} ${c - r}`;
  const bottom = `${c} ${c + r}`;
  // Outer limb on the lit side: top → bottom, clockwise for the right side.
  const limb = `A ${r} ${r} 0 0 ${waxing ? 1 : 0} ${bottom}`;
  // Terminator back to the top: bulges toward the lit side when crescent (cos > 0), away when gibbous.
  const bulgeTowardLit = cos > 0;
  const sweep = waxing === bulgeTowardLit ? 0 : 1;
  const terminator = `A ${rx} ${r} 0 0 ${sweep} ${top}`;
  return `M ${top} ${limb} ${terminator} Z`;
}
