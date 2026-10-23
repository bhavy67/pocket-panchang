import { parseError, type ParseError } from "./parse";

declare const civilDateBrand: unique symbol;

/** A local calendar date "YYYY-MM-DD" with no time zone attached (ADR 0014). */
export type CivilDate = string & { readonly [civilDateBrand]: true };

/** Accepts a real calendar date "YYYY-MM-DD" between 1800 and 2200 (e.g. rejects 2026-02-30). */
export function parseCivilDate(input: string): CivilDate | ParseError {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!m) return parseError(`Civil date must be YYYY-MM-DD, got "${input}"`);
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return parseError(`Not a calendar date: "${input}"`);
  }
  if (year < 1800 || year > 2200)
    return parseError(`Civil date ${input} is outside 1800–2200`);
  return input as CivilDate;
}

/** `date` + `days` (may be negative), as pure calendar arithmetic. */
export function addDays(date: CivilDate, days: number): CivilDate {
  const ms = Date.parse(`${date}T00:00:00Z`) + days * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10) as CivilDate;
}
