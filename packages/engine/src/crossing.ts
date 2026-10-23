import { normalizeDegrees } from "./longitude";
import type { Instant } from "./time";

const DEFAULT_STEP_MS = 3_600_000;
const DEFAULT_TOLERANCE_MS = 1000;

export type CrossingOptions = {
  /** Bracketing step. Must be short enough that the angle moves < 180° per step. Default 1 h. */
  readonly stepMs?: number;
  /** Refine until the bracket is at most this wide. Default 1000 ms (§4.3: < 1 s). */
  readonly toleranceMs?: number;
};

/**
 * First instant in (start, end] at which `angle` reaches `targetDeg` going forward (§4.3).
 *
 * `angle` returns degrees in [0, 360) and increases monotonically, wrapping 360 → 0
 * (elongation, sidereal Moon, Sun + Moon). `targetDeg` is in [0, 360).
 * The result is within `toleranceMs` of the true crossing. Returns null if there is none.
 */
export function findCrossing(
  angle: (t: Instant) => number,
  targetDeg: number,
  start: Instant,
  end: Instant,
  options: CrossingOptions = {},
): Instant | null {
  const stepMs = options.stepMs ?? DEFAULT_STEP_MS;
  const toleranceMs = options.toleranceMs ?? DEFAULT_TOLERANCE_MS;

  // Signed distance to the target in (−180, 180]: negative before the crossing, ≥ 0 at or
  // after it. Its only other jump (+180 → −180) is at the opposite point, which we ignore.
  const offset = (t: Instant): number => {
    const d = normalizeDegrees(angle(t) - targetDeg);
    return d > 180 ? d - 360 : d;
  };

  // Bracket: walk forward until the offset turns from negative to non-negative.
  let lo = start;
  let offsetLo = offset(lo);
  while (lo < end) {
    const hi = Math.min(lo + stepMs, end) as Instant;
    const offsetHi = offset(hi);
    if (offsetLo < 0 && offsetHi >= 0)
      return refine(offset, lo, hi, toleranceMs);
    lo = hi;
    offsetLo = offsetHi;
  }
  return null;
}

/**
 * Bisects on integer milliseconds. Invariant: offset(lo) < 0 ≤ offset(hi), so the
 * crossing is in (lo, hi]. Returns hi, which lies in (start, end].
 */
function refine(
  offset: (t: Instant) => number,
  lo: Instant,
  hi: Instant,
  toleranceMs: number,
): Instant {
  while (hi - lo > toleranceMs) {
    const mid = Math.floor((lo + hi) / 2) as Instant;
    if (offset(mid) < 0) lo = mid;
    else hi = mid;
  }
  return hi;
}
