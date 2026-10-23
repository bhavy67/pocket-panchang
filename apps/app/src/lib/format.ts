// UI-edge formatting (§5.2 rule 3): instants become local text only here, via Intl in the
// location's IANA zone, in the loaded UI language. English: "2:47 PM", "Thu 22 Oct".
// Gujarati: Gujarati digits and the time-of-day word, "૨:૪૭ બપોરે", "ગુરુ, ૨૨ ઑક્ટો"
// (brief §9 Q4/Q5: provisional until family testers answer).
import type { CivilDate, Instant } from "@panchang/engine";
import { lang } from "@/i18n";
import { clockFor } from "@/lib/clock";

const cache = new Map<string, Intl.DateTimeFormat>();
function fmt(
  tz: string,
  key: string,
  opts: Intl.DateTimeFormatOptions,
  english = "en-US",
) {
  const locale = lang() === "gu" ? "gu-u-nu-gujr" : english;
  const k = `${locale}|${tz}|${key}`;
  let f = cache.get(k);
  if (!f)
    cache.set(
      k,
      (f = new Intl.DateTimeFormat(locale, { timeZone: tz, ...opts })),
    );
  return f;
}

const timeOpts = (): Intl.DateTimeFormatOptions =>
  lang() === "gu"
    ? { hour: "numeric", minute: "2-digit", dayPeriod: "short" }
    : { hour: "numeric", minute: "2-digit" };

const parts = (t: Instant, tz: string) =>
  fmt(tz, "t", timeOpts()).formatToParts(t);
const join = (ps: Intl.DateTimeFormatPart[]) =>
  ps
    .map((p) => p.value)
    .join("")
    .trim();
const isPeriod = (p: Intl.DateTimeFormatPart) => p.type === "dayPeriod";
/** The clock reading without AM/PM or the Gujarati time-of-day word. */
const clockOnly = (ps: Intl.DateTimeFormatPart[]) =>
  join(ps.filter((p) => !isPeriod(p)));

/** "2:47 PM" / "૨:૪૭ બપોરે" */
export const time = (t: Instant, tz: string) => join(parts(t, tz));

/** "2:47" (no AM/PM), for the compact "Now" tag. */
export const timeShort = (t: Instant, tz: string) => clockOnly(parts(t, tz));

/** "1:50 – 3:16 PM", or "11:40 AM – 1:10 PM" when the time of day changes. */
export function range(a: Instant, b: Instant, tz: string) {
  const [x, y] = [parts(a, tz), parts(b, tz)];
  const same = x.find(isPeriod)?.value === y.find(isPeriod)?.value;
  return `${same ? clockOnly(x) : join(x)} – ${join(y)}`;
}

/** "3:38 AM Fri" when the instant falls on a different local date than `date`. */
export const timeOn = (t: Instant, tz: string, date: CivilDate) =>
  clockFor(tz).localDate(t) === date
    ? time(t, tz)
    : `${time(t, tz)} ${fmt(tz, "w", { weekday: "short" }).format(t)}`;

/** Civil dates are zone-free: format them as UTC midnight. */
const civil = (d: CivilDate, opts: Intl.DateTimeFormatOptions) =>
  fmt("UTC", JSON.stringify(opts), opts, "en-GB").format(Date.parse(d));

/** "Thu 22 Oct" */
export const dateShort = (d: CivilDate) => {
  const s = civil(d, { weekday: "short", day: "numeric", month: "short" });
  return lang() === "gu" ? s : s.replace(",", "");
};

/** "Thursday 22 October 2026" */
export const dateLong = (d: CivilDate) => {
  const s = civil(d, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return lang() === "gu" ? s : s.replace(",", "");
};

/** "October 2026" */
export const monthTitle = (d: CivilDate) =>
  civil(d, { month: "long", year: "numeric" });

/** Short weekday names Sunday-first, for the month grid header. */
export const weekdayInitials = () =>
  Array.from({ length: 7 }, (_, i) =>
    civil(`2026-01-${String(4 + i).padStart(2, "0")}` as CivilDate, {
      weekday: "short",
    }),
  );

/** A day number in the UI language's digits. */
export const dayNumber = (d: CivilDate) => civil(d, { day: "numeric" });

/** Whole days from `a` to `b`. */
export const daysBetween = (a: CivilDate, b: CivilDate) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
