import { addDays, type CivilDate, type Instant } from "@panchang/engine";
import type { Occurrence, PersonalEvent } from "./occurrences";

/** One all-day calendar entry. */
export type IcsEntry = {
  /** Stable, brand-neutral UID so re-imports update instead of duplicating (ADR 0016). */
  readonly uid: string;
  readonly date: CivilDate;
  readonly summary: string;
  readonly description?: string;
  /** Alarm days before the date, e.g. [0, 1]. */
  readonly remindDaysBefore: readonly number[];
};

const escape = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

/** UTF-8 byte length of one code point. */
function utf8Bytes(ch: string): number {
  const cp = ch.codePointAt(0)!;
  return cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
}

/** RFC 5545 line folding: ≤ 75 octets per line, continuation lines start with a space. */
function fold(line: string): string {
  if ([...line].reduce((n, ch) => n + utf8Bytes(ch), 0) <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let size = 0;
  for (const ch of line) {
    const n = utf8Bytes(ch);
    if (size + n > (parts.length === 0 ? 75 : 74)) {
      parts.push(current);
      current = "";
      size = 0;
    }
    current += ch;
    size += n;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

const ymd = (d: CivilDate) => d.replace(/-/g, "");
const stamp = (t: Instant) =>
  new Date(t)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

/**
 * An .ics calendar of all-day events (§5.5). `generatedAt` is passed in (pure package: no clock).
 * Alarms fire at `reminderTime` local to the calendar app (floating all-day start; ADR 0007
 * notes this limitation): TRIGGER = −N days + reminderTime relative to the event start.
 */
export function icsCalendar(
  entries: readonly IcsEntry[],
  generatedAt: Instant,
  reminderTime = "08:00",
): string {
  const [h, m] = reminderTime.split(":").map(Number) as [number, number];
  const trigger = (daysBefore: number) => {
    const minutes = -daysBefore * 1440 + h * 60 + m;
    const abs = Math.abs(minutes);
    return `${minutes < 0 ? "-" : ""}PT${Math.floor(abs / 60)}H${abs % 60}M`;
  };
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//panchang.bhavyladani.in//panchang//EN",
    "CALSCALE:GREGORIAN",
    ...entries.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${stamp(generatedAt)}`,
      `DTSTART;VALUE=DATE:${ymd(e.date)}`,
      `DTEND;VALUE=DATE:${ymd(addDays(e.date, 1))}`,
      `SUMMARY:${escape(e.summary)}`,
      ...(e.description ? [`DESCRIPTION:${escape(e.description)}`] : []),
      "TRANSP:TRANSPARENT",
      ...e.remindDaysBefore.flatMap((d) => [
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escape(e.summary)}`,
        `TRIGGER;RELATED=START:${trigger(d)}`,
        "END:VALARM",
      ]),
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** UID per ADR 0016: {eventId}-{lunarYear}-{occurrence}@panchang.bhavyladani.in. */
export function occurrenceUid(o: Occurrence): string {
  const label =
    o.kind === "pitru-paksha" ? "pitru-paksha" : (o.month ?? "annual");
  return `${o.eventId}-${o.lunarYear}-${label}@panchang.bhavyladani.in`;
}

/** .ics entry for an occurrence; the observance city is always named (ADR 0007). */
export function occurrenceEntry(event: PersonalEvent, o: Occurrence): IcsEntry {
  const tags = [
    o.kind === "pitru-paksha" ? "Pitru Paksha" : null,
    o.month === "adhik" ? "Adhik" : null,
  ].filter(Boolean);
  return {
    uid: occurrenceUid(o),
    date: o.date,
    summary: `${event.title}${tags.length ? ` (${tags.join(", ")})` : ""} · ${o.observance.name}`,
    remindDaysBefore: event.remindDaysBefore,
  };
}
