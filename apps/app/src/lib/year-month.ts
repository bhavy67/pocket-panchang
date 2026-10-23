import {
  isParseError,
  parseCivilDate,
  type CivilDate,
  type ParseError,
} from "@panchang/engine";

declare const yearMonthBrand: unique symbol;

/** A calendar month "YYYY-MM" (ADR 0014). */
export type YearMonth = string & { readonly [yearMonthBrand]: true };

export function parseYearMonth(input: string): YearMonth | ParseError {
  const first = /^\d{4}-\d{2}$/.test(input)
    ? parseCivilDate(`${input}-01`)
    : null;
  if (first === null || isParseError(first))
    return {
      kind: "parse-error",
      message: `Month must be YYYY-MM, got "${input}"`,
    };
  return input as YearMonth;
}

export const yearMonthOf = (date: CivilDate) => date.slice(0, 7) as YearMonth;

export const firstDay = (month: YearMonth) => `${month}-01` as CivilDate;
