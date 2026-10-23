// Settings (brief §3.6). Notifications health arrives with Android (Phase 11).
import {
  type EventKind,
  type OccurrencePolicy,
  type PolicyOverrides,
} from "@panchang/calendar";
import {
  addDays,
  ENGINE_VERSION,
  isParseError,
  type Instant,
} from "@panchang/engine";
import { useQuery } from "@tanstack/react-query";
import { useId, useState, type ReactNode } from "react";
import { parseBackup } from "@/backup";
import { CityPicker } from "@/city-picker";
import type { StoredEvent } from "@/db";
import { btnPrimary } from "@/events";
import {
  householdOf,
  metaQuery,
  replaceEvents,
  useEvents,
} from "@/events-data";
import { exportBackup, exportIcs } from "@/exports";
import { useNow } from "@/day-data";
import { clockFor } from "@/lib/clock";
import { dateLong } from "@/lib/format";
import { howSheet, mismatchUrl } from "@/panchang";
import {
  FIELDS,
  inherited,
  KIND_LABEL,
  PolicySelect,
  setOverride,
} from "@/policy";
import {
  EVENT_KINDS,
  saveSettings,
  useSettings,
  type Settings,
} from "@/settings";
import { btnOutline, card, Section, Sheet, type SheetContent } from "@/ui";
import { worker } from "@/worker/client";

const radio =
  "flex min-h-(--tap-min) cursor-pointer items-center gap-3 rounded-md border-[1.5px] border-border bg-surface px-3 has-checked:border-accent has-checked:bg-accent-subtle has-focus-visible:outline-3 has-focus-visible:outline-focus-ring";

function Choice<T extends string | number>({
  legend,
  value,
  options,
  onChange,
  render,
  min = "9rem",
}: {
  legend: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (v: T) => void;
  render?: (v: T, label: string) => ReactNode;
  /** Narrowest column; long labels get one option per row. */
  min?: string;
}) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-body font-semibold">{legend}</legend>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}, 100%), 1fr))`,
        }}
      >
        {options.map(([v, label]) => (
          <label key={v} className={radio}>
            <input
              type="radio"
              name={name}
              checked={value === v}
              onChange={() => onChange(v)}
              className="size-5 flex-none accent-(--accent)"
            />
            {render ? (
              render(v, label)
            ) : (
              <span className="text-body">{label}</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const PALETTES = [
  ["calm", "Calm"],
  ["mandir", "Mandir"],
  ["raat", "Raat"],
] as const;

/** A live swatch: the palette's own tokens, applied by data attributes (ADR 0017). */
function PaletteSwatch({ palette, label }: { palette: string; label: string }) {
  const mode = document.documentElement.dataset.mode ?? "light";
  return (
    <span
      data-palette={palette}
      data-mode={mode}
      className="flex flex-1 items-center gap-2 rounded-md bg-bg p-2"
    >
      <span className="flex flex-1 flex-col rounded-sm bg-surface px-2 py-1 text-text">
        <span className="text-body font-semibold">{label}</span>
        <span className="flex gap-1" aria-hidden="true">
          <span className="block size-3 rounded-full bg-accent" />
          <span className="block size-3 rounded-full bg-auspicious" />
          <span className="block size-3 rotate-45 bg-festival" />
        </span>
      </span>
    </span>
  );
}

export function SettingsScreen() {
  const s = useSettings((st) => st.settings)!;
  const set = (patch: Partial<Settings>) => saveSettings({ ...s, ...patch });
  const events = useEvents() ?? [];
  const { data: meta } = useQuery(metaQuery);
  const [sheet, setSheet] = useState<SheetContent | null>(null);
  const [status, setStatus] = useState("");
  const today = clockFor(s.location.tz).localDate(useNow());

  return (
    <main className="mx-auto max-w-180">
      <h1 className="px-4 pt-4 text-headline leading-(--leading-heading) font-bold">
        Settings
      </h1>

      <Section title="Place">
        <div className={`flex flex-col gap-5 p-5 ${card}`}>
          <div className="flex flex-col gap-2">
            <p className="text-body">
              Showing the panchang for{" "}
              <strong className="font-semibold">{s.location.name}</strong>
            </p>
            <CityPicker
              label="Change city"
              onPick={(c) => set({ location: c.location })}
            />
          </div>
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="text-body">
              Family dates use sunrise in{" "}
              <strong className="font-semibold">
                {s.observanceLocation.name}
              </strong>
            </p>
            <p className="text-sm text-text-muted">
              Usually where the family observes them. Living abroad but
              following India's date? Choose the Indian city.
            </p>
            <ObservanceCity s={s} events={events} />
          </div>
        </div>
      </Section>

      <Section title="Display">
        <div className={`flex flex-col gap-6 p-5 ${card}`}>
          <Choice
            legend="Year style"
            min="100%"
            value={s.samvat}
            options={[
              ["vikram-kartikadi", "Vikram Samvat (Gujarati, from Diwali)"],
              ["vikram-chaitradi", "Vikram Samvat (from Chaitra)"],
              ["shaka", "Shaka Samvat"],
            ]}
            onChange={(samvat) => set({ samvat })}
          />
          <Choice
            legend="Language"
            value={s.language}
            options={[
              ["gu", "ગુજરાતી"],
              ["en", "English"],
            ]}
            onChange={(language) => set({ language })}
          />
          {s.language === "gu" && (
            <p className="-mt-4 text-sm text-text-muted">
              The Gujarati screens are coming soon; Gujarati names already show.
            </p>
          )}
          <Choice
            legend="Text size"
            value={s.textScale}
            options={[
              [1, "Normal"],
              [1.25, "Large"],
              [1.5, "Larger"],
              [2, "Largest"],
            ]}
            onChange={(textScale) => set({ textScale })}
          />
          <Choice
            legend="Colours"
            value={s.palette}
            options={PALETTES}
            onChange={(palette) => set({ palette })}
            render={(v, label) => <PaletteSwatch palette={v} label={label} />}
          />
          <Choice
            legend="Light or dark"
            value={s.theme}
            options={[
              ["system", "Same as phone"],
              ["light", "Light"],
              ["dark", "Dark"],
            ]}
            onChange={(theme) => set({ theme })}
          />
        </div>
      </Section>

      <Section
        title="Family conventions"
        sub="How your family places dates when the calendar is unclear. Each family date can still change these under Advanced."
      >
        <div className="flex flex-col gap-2">
          {EVENT_KINDS.map((k) => (
            <Conventions key={k} kind={k} s={s} events={events} />
          ))}
        </div>
      </Section>

      <Section
        title="Backup"
        sub="Family dates live only on this phone. Save a backup file to keep them safe or move them to another phone."
      >
        <div id="backup" className={`flex flex-col gap-3 p-5 ${card}`}>
          <p className="text-body">
            {meta?.lastBackupAt
              ? `Last backup: ${dateLong(clockFor(s.location.tz).localDate(meta.lastBackupAt as Instant))}`
              : "No backup saved yet."}
          </p>
          <button
            type="button"
            className={btnPrimary}
            onClick={() =>
              void exportBackup(s, events).then(() =>
                setStatus("Backup saved."),
              )
            }
          >
            Save a backup
          </button>
          <ImportBackup current={events} onStatus={setStatus} />
          <button
            type="button"
            className={btnOutline}
            disabled={events.length === 0}
            onClick={() =>
              void exportIcs(s, events, today, addDays(today, 730)).then(() =>
                setStatus("Calendar file saved."),
              )
            }
          >
            Save calendar file (.ics)
          </button>
          <p aria-live="polite" className="text-sm text-text-muted">
            {status}
          </p>
        </div>
      </Section>

      <Section title="About">
        <div className={`flex flex-col gap-3 p-5 ${card}`}>
          <button
            type="button"
            className={btnOutline}
            onClick={() => setSheet(howSheet(s, today))}
          >
            How this is calculated
          </button>
          <a
            href={mismatchUrl(s, today)}
            target="_blank"
            rel="noreferrer"
            className={btnOutline}
          >
            Report a mismatch
          </a>
          <p className="text-body">
            <strong className="font-semibold">Private by design.</strong>{" "}
            Everything stays on your phone. No account, no ads, no tracking.
          </p>
          <p className="text-sm text-text-muted">
            City data: GeoNames (geonames.org), CC-BY 4.0.
          </p>
          <p className="text-sm text-text-muted">
            Engine version {ENGINE_VERSION}
          </p>
        </div>
      </Section>
      <div className="h-8" />
      <Sheet content={sheet} onClose={() => setSheet(null)} />
    </main>
  );
}

/** Counts events whose next-year dates change under a new household (brief §4). */
async function changedCount(
  s: Settings,
  next: Settings,
  events: readonly StoredEvent[],
) {
  if (events.length === 0) return 0;
  const today = clockFor(s.location.tz).localDate(Date.now() as Instant);
  const to = addDays(today, 365);
  const [a, b] = await Promise.all([
    worker.occurrences(events, householdOf(s), today, to),
    worker.occurrences(events, householdOf(next), today, to),
  ]);
  const key = (o: (typeof a)[number]) =>
    `${o.eventId}|${o.kind}|${o.month}|${o.date}`;
  const before = new Set(a.map(key));
  const after = new Set(b.map(key));
  return events.filter((e) =>
    [...before, ...after].some(
      (k) => k.startsWith(`${e.id}|`) && before.has(k) !== after.has(k),
    ),
  ).length;
}

/** Applies a household change, confirming first when it moves any event's dates. */
async function applyHouseholdChange(
  s: Settings,
  next: Settings,
  events: readonly StoredEvent[],
) {
  const n = await changedCount(s, next, events);
  if (
    n === 0 ||
    window.confirm(
      `This changes the dates of ${n} family date${n === 1 ? "" : "s"}. Continue?`,
    )
  )
    saveSettings(next);
}

function ObservanceCity({
  s,
  events,
}: {
  s: Settings;
  events: readonly StoredEvent[];
}) {
  return (
    <CityPicker
      label="Change city for family dates"
      onPick={(c) =>
        void applyHouseholdChange(
          s,
          { ...s, observanceLocation: c.location },
          events,
        )
      }
    />
  );
}

function Conventions({
  kind,
  s,
  events,
}: {
  kind: EventKind;
  s: Settings;
  events: readonly StoredEvent[];
}) {
  const current: PolicyOverrides = s.householdPolicy[kind] ?? {};
  const update = (field: keyof OccurrencePolicy, v: unknown) => {
    const next = {
      ...s,
      householdPolicy: {
        ...s.householdPolicy,
        [kind]: setOverride(current, field, v),
      },
    };
    void applyHouseholdChange(
      s,
      next,
      events.filter((e) => e.kind === kind),
    );
  };
  return (
    <details className={`p-4 ${card}`}>
      <summary className="flex min-h-(--tap-min) cursor-pointer items-center text-body font-semibold focus-ring">
        {KIND_LABEL[kind]}
      </summary>
      <div className="mt-3 flex flex-col gap-5">
        {FIELDS.map((f) => (
          <PolicySelect
            key={f.field}
            field={f}
            value={current[f.field]}
            inheritedValue={String(
              inherited({ ...s, householdPolicy: {} }, kind, f.field).value,
            )}
            inheritedLabel="Usual default"
            onChange={(v) => update(f.field, v)}
          />
        ))}
        {kind === "shraddh" && (
          <label className={radio}>
            <input
              type="checkbox"
              checked={
                current.pitruPaksha ??
                inherited({ ...s, householdPolicy: {} }, kind, "pitruPaksha")
                  .value
              }
              onChange={(e) => update("pitruPaksha", e.target.checked)}
              className="size-5 accent-(--accent)"
            />
            <span className="text-body">
              Also remind during Pitru Paksha (Shraddh fortnight)
            </span>
          </label>
        )}
      </div>
    </details>
  );
}

function ImportBackup({
  current,
  onStatus,
}: {
  current: readonly StoredEvent[];
  onStatus: (s: string) => void;
}) {
  const id = useId();
  const [error, setError] = useState("");
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className={`${btnOutline} cursor-pointer has-focus-visible:outline-3 has-focus-visible:outline-focus-ring`}
      >
        Restore from a backup file
        <input
          id={id}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            void file.text().then(async (text) => {
              const b = parseBackup(text);
              if (isParseError(b)) return setError(b.message);
              setError("");
              const when = new Date(b.exportedAt).toLocaleDateString("en-GB", {
                dateStyle: "long",
              });
              if (
                !window.confirm(
                  `Replace your ${current.length} family date${current.length === 1 ? "" : "s"} and settings with the backup from ${when} (${b.events.length} family date${b.events.length === 1 ? "" : "s"})?`,
                )
              )
                return;
              await replaceEvents(b.events);
              saveSettings(b.settings);
              onStatus("Backup restored.");
            });
          }}
        />
      </label>
      {error && (
        <p role="alert" className="text-body text-warning">
          {error}
        </p>
      )}
    </div>
  );
}
