// UI-edge formatting (§5.2 rule 3): instants become local text only here, via Intl in the
// location's IANA zone. ponytail: English locale until Phase 10 adds the Gujarati UI.
import type { CivilDate, Instant } from "@panchang/engine";
import { clockFor } from "@/lib/clock";

const cache = new Map<string, Intl.DateTimeFormat>();
// Times read "2:47 PM" (en-US); dates read "Thu 22 Oct" (en-GB).
function fmt(
  tz: string,
  key: string,
  opts: Intl.DateTimeFormatOptions,
  locale = "en-US",
) {
  const k = `${locale}|${tz}|${key}`;
  let f = cache.get(k);
  if (!f)
    cache.set(
      k,
      (f = new Intl.DateTimeFormat(locale, { timeZone: tz, ...opts })),
    );
  return f;
}

/** "2:47 PM" */
export const time = (t: Instant, tz: string) =>
  fmt(tz, "t", { hour: "numeric", minute: "2-digit" }).format(t);

/** "2:47" (no AM/PM), for the compact "Now" tag. */
export const timeShort = (t: Instant, tz: string) =>
  time(t, tz).replace(/\s?[AP]M$/, "");

/** "1:50 – 3:16 PM", or "11:40 AM – 1:10 PM" when the meridiem changes. */
export function range(a: Instant, b: Instant, tz: string) {
  const [x, y] = [time(a, tz), time(b, tz)];
  return x.slice(-2) === y.slice(-2)
    ? `${x.slice(0, -3)} – ${y}`
    : `${x} – ${y}`;
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
export const dateShort = (d: CivilDate) =>
  civil(d, { weekday: "short", day: "numeric", month: "short" }).replace(
    ",",
    "",
  );

/** "Thursday 22 October 2026" */
export const dateLong = (d: CivilDate) =>
  civil(d, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).replace(",", "");

/** "October 2026" */
export const monthTitle = (d: CivilDate) =>
  civil(d, { month: "long", year: "numeric" });

/** Whole days from `a` to `b`. */
export const daysBetween = (a: CivilDate, b: CivilDate) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
