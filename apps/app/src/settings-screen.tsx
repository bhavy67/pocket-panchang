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
import { backupErrorKey, parseBackup } from "@/backup";
import { loadLanguage, t } from "@/i18n";
import { Link } from "@tanstack/react-router";
import { CityPicker, inputClass } from "@/city-picker";
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
import { mismatchUrl } from "@/panchang";
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
import { btnOutline, card, InstallCard, Section } from "@/ui";
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
  ["calm", "paletteCalm"],
  ["mandir", "paletteMandir"],
  ["raat", "paletteRaat"],
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
  const [status, setStatus] = useState("");
  const today = clockFor(s.location.tz).localDate(useNow());

  return (
    <main className="mx-auto max-w-180">
      <h1 className="px-4 pt-4 text-headline leading-(--leading-heading) font-bold">
        {t("settings")}
      </h1>

      <Section title={t("place")}>
        <div className={`flex flex-col gap-5 p-5 ${card}`}>
          <div className="flex flex-col gap-2">
            <p className="text-body">
              {t("showingFor", { city: s.location.name })}
            </p>
            <CityPicker
              label={t("changeCity")}
              onPick={(c) => set({ location: c.location })}
            />
          </div>
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="text-body">
              {t("familySunriseIn", { city: s.observanceLocation.name })}
            </p>
            <p className="text-sm text-text-muted">{t("familySunriseHelp")}</p>
            <ObservanceCity s={s} events={events} />
          </div>
        </div>
      </Section>

      <Section title={t("display")}>
        <div className={`flex flex-col gap-6 p-5 ${card}`}>
          <Choice
            legend={t("yearStyle")}
            min="100%"
            value={s.samvat}
            options={[
              ["vikram-kartikadi", t("yearKartikadi")],
              ["vikram-chaitradi", t("yearChaitradi")],
              ["shaka", t("yearShaka")],
            ]}
            onChange={(samvat) => set({ samvat })}
          />
          <Choice
            legend={t("language")}
            value={s.language}
            options={[
              ["gu", "ગુજરાતી"],
              ["en", "English"],
            ]}
            onChange={(language) =>
              void loadLanguage(language).then(() => set({ language }))
            }
          />
          <Choice
            legend={t("textSize")}
            value={s.textScale}
            options={[
              [1, t("sizeNormal")],
              [1.25, t("sizeLarge")],
              [1.5, t("sizeLarger")],
              [2, t("sizeLargest")],
            ]}
            onChange={(textScale) => set({ textScale })}
          />
          <Choice
            legend={t("colours")}
            value={s.palette}
            options={PALETTES.map(([v, k]) => [v, t(k)] as const)}
            onChange={(palette) => set({ palette })}
            render={(v, label) => <PaletteSwatch palette={v} label={label} />}
          />
          <Choice
            legend={t("lightOrDark")}
            value={s.theme}
            options={[
              ["system", t("modeSystem")],
              ["light", t("modeLight")],
              ["dark", t("modeDark")],
            ]}
            onChange={(theme) => set({ theme })}
          />
        </div>
      </Section>

      <Section title={t("familyConventions")} sub={t("familyConventionsSub")}>
        <div className="flex flex-col gap-2">
          {EVENT_KINDS.map((k) => (
            <Conventions key={k} kind={k} s={s} events={events} />
          ))}
        </div>
      </Section>

      <Section title={t("reminders")}>
        <div className={`flex flex-col gap-3 p-5 ${card}`}>
          <ReminderTime s={s} />
          <Link to="/settings/notifications" className={btnOutline}>
            {t("healthLink")}
          </Link>
        </div>
      </Section>

      <Section title={t("backup")} sub={t("backupSub")}>
        <div id="backup" className={`flex flex-col gap-3 p-5 ${card}`}>
          <p className="text-body">
            {meta?.lastBackupAt
              ? t("lastBackup", {
                  date: dateLong(
                    clockFor(s.location.tz).localDate(
                      meta.lastBackupAt as Instant,
                    ),
                  ),
                })
              : t("noBackupYet")}
          </p>
          <button
            type="button"
            className={btnPrimary}
            onClick={() =>
              void exportBackup(s, events).then(() =>
                setStatus(t("backupSaved")),
              )
            }
          >
            {t("saveBackup")}
          </button>
          <ImportBackup s={s} onStatus={setStatus} />
          <button
            type="button"
            className={btnOutline}
            disabled={events.length === 0}
            onClick={() =>
              void exportIcs(s, events, today, addDays(today, 730)).then(() =>
                setStatus(t("icsSaved")),
              )
            }
          >
            {t("saveIcs")}
          </button>
          <p aria-live="polite" className="text-sm text-text-muted">
            {status}
          </p>
        </div>
      </Section>

      <div className="px-4 pt-8 empty:hidden">
        <InstallCard where="settings" />
      </div>

      <Section title={t("about")}>
        <div className={`flex flex-col gap-3 p-5 ${card}`}>
          <p className="text-lg font-semibold">
            {t("appName")}{" "}
            <span className="text-sm font-normal text-text-muted">
              {t("appVersion", { v: __APP_VERSION__ })}
            </span>
          </p>
          <Link to="/how" className={btnOutline}>
            {t("howCalculated")}
          </Link>
          <Link to="/privacy" className={btnOutline}>
            {t("privacyPolicy")}
          </Link>
          <a
            href={mismatchUrl(s, today)}
            target="_blank"
            rel="noreferrer"
            className={btnOutline}
          >
            {t("reportMismatch")}
          </a>
          <p className="text-body">
            <strong className="font-semibold">{t("privateTitle")}</strong>{" "}
            {t("privateBody")}
          </p>
          <p className="text-sm text-text-muted">{t("cityAttribution")}</p>
          <p className="text-sm text-text-muted">
            {t("engineVersion", { v: ENGINE_VERSION })}
          </p>
        </div>
      </Section>
      <div className="h-8" />
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
      n === 1 ? t("confirmChangeOne") : t("confirmChangeMany", { n }),
    )
  )
    saveSettings(next);
}

function ReminderTime({ s }: { s: Settings }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-body font-semibold">
        {t("reminderTime")}
      </label>
      <input
        id={id}
        type="time"
        value={s.reminderTime}
        onChange={(e) => {
          if (/^\d{2}:\d{2}$/.test(e.target.value))
            saveSettings({ ...s, reminderTime: e.target.value });
        }}
        className={`${inputClass} max-w-48`}
      />
      <span className="text-sm text-text-muted">{t("reminderTimeHelp")}</span>
    </div>
  );
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
      label={t("changeFamilyCity")}
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
        {t(KIND_LABEL[kind])}
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
            inheritedFrom="built-in"
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
            <span className="text-body">{t("alsoPitruShort")}</span>
          </label>
        )}
      </div>
    </details>
  );
}

function ImportBackup({
  s,
  onStatus,
}: {
  s: Settings;
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
        {t("restoreBackup")}
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
              if (isParseError(b)) return setError(t(backupErrorKey(b)));
              setError("");
              const when = dateLong(
                clockFor(s.location.tz).localDate(b.exportedAt as Instant),
              );
              if (
                !window.confirm(
                  t(
                    b.events.length === 1
                      ? "confirmRestoreOne"
                      : "confirmRestoreMany",
                    { date: when, count: b.events.length },
                  ),
                )
              )
                return;
              await replaceEvents(b.events);
              saveSettings(b.settings);
              onStatus(t("backupRestored"));
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
