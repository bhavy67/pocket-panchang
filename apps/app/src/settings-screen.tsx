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
import { useId, useState, type CSSProperties, type ReactNode } from "react";
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
import { MoonDisc } from "@/moon-disc";
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
import { btnOutline, InstallCard, Section } from "@/ui";
import { worker } from "@/worker/client";

const radio =
  "flex min-h-(--tap-min) cursor-pointer items-center gap-3 rounded-md border-[1.5px] border-border bg-surface px-3 has-checked:border-accent has-checked:bg-accent-subtle has-focus-visible:outline-3 has-focus-visible:outline-focus-ring";

function Choice<T extends string | number>({
  legend,
  value,
  options,
  onChange,
  render,
  min = "11rem",
}: {
  legend: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (v: T) => void;
  render?: (v: T, label: string) => ReactNode;
  /** Narrowest preview column (only with `render`). */
  min?: string;
}) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-body font-label">{legend}</legend>
      {/* Text options size to their labels, so one never wraps while a row has room to spare;
          a pair splits the row in half; previews share a grid. */}
      <div
        className={render ? "grid gap-2" : "flex flex-wrap gap-2"}
        style={
          render
            ? {
                gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}, 100%), 1fr))`,
              }
            : undefined
        }
      >
        {options.map(([v, label]) => (
          <label
            key={v}
            className={`${radio} ${render ? "" : options.length === 2 ? "flex-1 basis-0" : "grow"}`}
          >
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
  ["raat", "paletteRaat"],
  ["kagaz", "paletteKagaz"],
  ["mandir", "paletteMandir"],
  ["utsav", "paletteUtsav"],
  ["shunya", "paletteShunya"],
] as const;

const PALETTE_HINTS = {
  calm: "paletteCalmHint",
  raat: "paletteRaatHint",
  kagaz: "paletteKagazHint",
  mandir: "paletteMandirHint",
  utsav: "paletteUtsavHint",
  shunya: "paletteShunyaHint",
} as const;

/** Thursday's day Choghadiya, for the preview ribbon. */
const SAMPLE = [
  "good",
  "bad",
  "bad",
  "neutral",
  "good",
  "best",
  "bad",
  "good",
] as const;
const sampleStyle = (q: (typeof SAMPLE)[number]) =>
  q === "best"
    ? "bg-auspicious"
    : q === "good"
      ? "bg-auspicious-subtle"
      : q === "bad"
        ? "bg-inauspicious-subtle"
        : "bg-surface-sunken";

/**
 * A live preview (moon, name, who it suits, ribbon) in the palette's own colours, shapes and
 * current mode (data attributes scope the tokens, ADR 0017). Text stays in the current theme's
 * fonts so opening Settings never downloads another theme's fonts (ADR 0025).
 */
function PalettePreview({
  palette,
  label,
}: {
  palette: keyof typeof PALETTE_HINTS;
  label: string;
}) {
  const root = getComputedStyle(document.documentElement);
  const font = (v: string) => root.getPropertyValue(v).trim();
  return (
    <span
      data-palette={palette}
      data-mode={document.documentElement.dataset.mode ?? "light"}
      className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-border bg-bg px-3 py-2 text-text"
      style={
        {
          "--font-ui": font("--font-ui"),
          "--font-gu": font("--font-gu"),
          "--font-display": font("--font-ui"),
        } as CSSProperties
      }
    >
      <MoonDisc elongation={130} size="1.75rem" decorative />
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-body font-strong">{label}</span>
        <span className="text-caption text-text-muted">
          {t(PALETTE_HINTS[palette])}
        </span>
      </span>
      <span aria-hidden="true" className="flex h-2.5 w-10 flex-none gap-px">
        {SAMPLE.map((q, i) => (
          <span
            key={i}
            className={`flex-1 ${sampleStyle(q)} ${i === 0 ? "rounded-l-full" : i === 7 ? "rounded-r-full" : ""}`}
          />
        ))}
      </span>
    </span>
  );
}

/** Jump links to each section below, for anyone who lands deep in a long page. */
function SettingsNav() {
  const items: [string, string][] = [
    ["place", t("place")],
    ["display", t("display")],
    ["conventions", t("familyConventions")],
    ["reminders", t("reminders")],
    ["backup", t("backup")],
    ["about", t("about")],
  ];
  return (
    <nav
      aria-label={t("settings")}
      className="flex flex-wrap gap-1 px-4 pt-3"
    >
      {items.map(([id, label]) => (
        <a
          key={id}
          href={`#${id}`}
          className="min-h-(--tap-min) rounded-md px-2 py-1 text-sm font-label text-accent hover:bg-accent-subtle focus-ring"
        >
          {label}
        </a>
      ))}
    </nav>
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
      <h1 className="px-4 pt-4 text-headline leading-(--leading-heading) font-strong">
        {t("settings")}
      </h1>
      <SettingsNav />

      <Section id="place" title={t("place")}>
        <div className="flex flex-col gap-5 px-card py-5 card">
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

      <Section id="display" title={t("display")}>
        <div className="flex flex-col gap-6 px-card py-5 card">
          <Choice
            legend={t("yearStyle")}
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
              [0.875, t("sizeSmaller")],
              [1, t("sizeNormal")],
              [1.25, t("sizeLarge")],
            ]}
            onChange={(textScale) => set({ textScale })}
          />
          <Choice
            legend={t("colours")}
            value={s.palette}
            options={PALETTES.map(([v, k]) => [v, t(k)] as const)}
            min="14rem"
            onChange={(palette) => set({ palette })}
            render={(v, label) => <PalettePreview palette={v} label={label} />}
          />
          <Choice
            legend={t("lightOrDark")}
            // "system" (the default) follows the phone until a mode is picked; show what it resolves to.
            value={
              s.theme === "system"
                ? document.documentElement.dataset.mode === "dark"
                  ? "dark"
                  : "light"
                : s.theme
            }
            options={[
              ["light", t("modeLight")],
              ["dark", t("modeDark")],
            ]}
            onChange={(theme) => set({ theme })}
          />
        </div>
      </Section>

      <Section
        id="conventions"
        title={t("familyConventions")}
        sub={t("familyConventionsSub")}
      >
        <div className="flex flex-col gap-2">
          {EVENT_KINDS.map((k) => (
            <Conventions key={k} kind={k} s={s} events={events} />
          ))}
        </div>
      </Section>

      <Section id="reminders" title={t("reminders")}>
        <div className="flex flex-col gap-3 px-card py-5 card">
          <ReminderTime s={s} />
          <Link to="/settings/notifications" className={btnOutline}>
            {t("healthLink")}
          </Link>
        </div>
      </Section>

      <Section title={t("backup")} sub={t("backupSub")}>
        <div id="backup" className="flex flex-col gap-3 px-card py-5 card">
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

      <Section id="about" title={t("about")}>
        <div className="flex flex-col gap-3 px-card py-5 card">
          <p className="text-lg font-label">
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
            <strong className="font-label">{t("privateTitle")}</strong>{" "}
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
      <label htmlFor={id} className="text-body font-label">
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
    <details className="px-card py-4 card">
      <summary className="flex min-h-(--tap-min) cursor-pointer items-center text-body font-label focus-ring">
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
