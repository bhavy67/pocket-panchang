// Create / edit a personal event (brief §3.5, §4). Plain labels; the lunar date is the single
// source of truth (ADR 0002); the date helper only proposes one, confirmed by the user (ADR 0006).
import type {
  EventKind,
  Location,
  LunarDate,
  PolicyOverrides,
} from "@panchang/calendar";
import {
  isParseError,
  LUNAR_MONTHS,
  parseCivilDate,
  type CivilDate,
} from "@panchang/engine";
import { monthName } from "@panchang/i18n";
import { useNavigate } from "@tanstack/react-router";
import { useId, useState, type ReactNode } from "react";
import { CityPicker, inputClass } from "@/city-picker";
import type { StoredEvent } from "@/db";
import { deleteEvent, saveEvent, useEvents } from "@/events-data";
import { btnPrimary } from "@/events";
import { dateShort } from "@/lib/format";
import {
  FIELDS,
  inherited,
  KIND_LABEL,
  lunarLabel,
  PolicySelect,
  setOverride,
} from "@/policy";
import { useSettings, type Settings } from "@/settings";
import { btnOutline, card } from "@/ui";
import { worker } from "@/worker/client";
import type { TithiProposal } from "@/worker/api";

/** Gujarati year order: Kartak first. */
const MONTHS = [...LUNAR_MONTHS.slice(7), ...LUNAR_MONTHS.slice(0, 7)];
const KINDS: EventKind[] = ["birthday", "shraddh", "anniversary", "custom"];

export function EventFormRoute({ id }: { id: string }) {
  const events = useEvents();
  if (!events) return null;
  const existing = events.find((e) => e.id === id);
  if (id !== "new" && !existing)
    return <p className="p-4 text-body">This family date no longer exists.</p>;
  return <EventForm key={id} existing={existing} />;
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: (id: string) => ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-body font-semibold">
        {label}
      </label>
      {children(id)}
      {hint && <span className="text-sm text-text-muted">{hint}</span>}
    </div>
  );
}

const radio =
  "flex min-h-(--tap-min) cursor-pointer items-center gap-3 rounded-md border-[1.5px] border-border bg-surface px-3 has-checked:border-accent has-checked:bg-accent-subtle has-focus-visible:outline-3 has-focus-visible:outline-focus-ring";

function EventForm({ existing }: { existing: StoredEvent | undefined }) {
  const s = useSettings((st) => st.settings)!;
  const navigate = useNavigate();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [kind, setKind] = useState<EventKind>(existing?.kind ?? "birthday");
  const [mode, setMode] = useState<"tithi" | "date">(
    existing ? "tithi" : "date",
  );
  const [lunar, setLunar] = useState<LunarDate>(
    existing?.lunarDate ?? { month: "Kartika", paksha: "shukla", tithi: 1 },
  );
  const [origin, setOrigin] = useState(existing?.origin);
  const [overrides, setOverrides] = useState<PolicyOverrides>(
    existing?.policyOverrides ?? {},
  );
  const [pitruDay, setPitruDay] = useState(existing?.pitruPakshaDay);
  const [observance, setObservance] = useState<Location | undefined>(
    existing?.observanceLocation,
  );
  const [remind, setRemind] = useState<number[]>([
    ...(existing?.remindDaysBefore ?? [0, 1]),
  ]);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [confirmed, setConfirmed] = useState(!!existing);
  const [error, setError] = useState("");

  const pitru =
    overrides.pitruPaksha ?? inherited(s, kind, "pitruPaksha").value;

  const save = async () => {
    if (!title.trim()) return setError("Please give this date a name.");
    if (!confirmed)
      return setError("Please work out and confirm the tithi first.");
    const now = Date.now();
    await saveEvent({
      id: existing?.id ?? crypto.randomUUID(),
      title: title.trim(),
      kind,
      lunarDate: lunar,
      policyOverrides: overrides,
      ...(kind === "shraddh" &&
        pitruDay !== undefined && { pitruPakshaDay: pitruDay }),
      ...(observance && { observanceLocation: observance }),
      ...(origin && { origin }),
      remindDaysBefore: [...remind].sort(),
      ...(notes.trim() && { notes: notes.trim() }),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    void navigate({ to: "/events" });
  };

  return (
    <main className="mx-auto flex max-w-180 flex-col gap-6 px-4 pt-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className={btnOutline}
          onClick={() => void navigate({ to: "/events" })}
        >
          ‹ Family dates
        </button>
      </header>
      <h1 className="text-headline leading-(--leading-heading) font-bold">
        {existing ? "Edit family date" : "Add a family date"}
      </h1>

      <Field label="Name">
        {(id) => (
          <input
            id={id}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ba's varsi"
            maxLength={200}
            className={inputClass}
          />
        )}
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-body font-semibold">
          What kind of date?
        </legend>
        {KINDS.map((k) => (
          <label key={k} className={radio}>
            <input
              type="radio"
              name="kind"
              checked={kind === k}
              onChange={() => setKind(k)}
              className="size-5 accent-(--accent)"
            />
            <span className="text-body">{KIND_LABEL[k]}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-body font-semibold">The date</legend>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(12rem,100%),1fr))] gap-2">
          {(
            [
              ["date", "I know the date"],
              ["tithi", "I know the tithi"],
            ] as const
          ).map(([m, label]) => (
            <label key={m} className={radio}>
              <input
                type="radio"
                name="mode"
                checked={mode === m}
                onChange={() => setMode(m)}
                className="size-5 accent-(--accent)"
              />
              <span className="text-body">{label}</span>
            </label>
          ))}
        </div>
        {mode === "tithi" ? (
          <TithiPicker
            value={lunar}
            onChange={(d) => {
              setLunar(d);
              setConfirmed(true);
            }}
          />
        ) : (
          <DateHelper
            s={s}
            kind={kind}
            overrides={overrides}
            initial={origin}
            onConfirm={(p, o) => {
              setLunar(p.lunarDate);
              setOrigin(o);
              setConfirmed(true);
              setMode("tithi");
            }}
          />
        )}
        {confirmed && mode === "tithi" && (
          <p className="text-body">
            Tithi:{" "}
            <strong className="font-semibold">{lunarLabel(lunar)}</strong>
            {origin && (
              <span className="block text-sm text-text-muted">
                Worked out from {dateShort(origin.date)}{" "}
                {origin.date.slice(0, 4)}
                {origin.time && `, ${origin.time}`}, {origin.place.name}
              </span>
            )}
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-body font-semibold">Remind me</legend>
        {(
          [
            [0, "On the day"],
            [1, "1 day before"],
          ] as const
        ).map(([n, label]) => (
          <label key={n} className={radio}>
            <input
              type="checkbox"
              checked={remind.includes(n)}
              onChange={(e) =>
                setRemind(
                  e.target.checked
                    ? [...remind, n]
                    : remind.filter((x) => x !== n),
                )
              }
              className="size-5 accent-(--accent)"
            />
            <span className="text-body">{label}</span>
          </label>
        ))}
        <span className="text-sm text-text-muted">
          On the web, reminders come through the calendar file (Family dates →
          Save calendar file).
        </span>
      </fieldset>

      {kind === "shraddh" && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-body font-semibold">Pitru Paksha</legend>
          <label className={radio}>
            <input
              type="checkbox"
              checked={pitru}
              onChange={(e) =>
                setOverrides(
                  setOverride(overrides, "pitruPaksha", e.target.checked),
                )
              }
              className="size-5 accent-(--accent)"
            />
            <span className="text-body">
              Also remind me during Pitru Paksha (Shraddh fortnight)
            </span>
          </label>
          {pitru && (
            <Field
              label="Which Pitru Paksha day"
              hint="Technical term: Mahalaya."
            >
              {(id) => (
                <select
                  id={id}
                  value={pitruDay === undefined ? "" : String(pitruDay)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPitruDay(
                      v === ""
                        ? undefined
                        : v === "bhadrapada-purnima"
                          ? v
                          : Number(v),
                    );
                  }}
                  className={inputClass}
                >
                  <option value="">Same tithi (usual)</option>
                  <option value="bhadrapada-purnima">Bhadarvo Punam</option>
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n === 15
                        ? "Bhadarvo Vad Amas (Sarva Pitru Amas)"
                        : `Bhadarvo Vad ${n}`}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          )}
        </fieldset>
      )}

      <Field label="Notes (optional)">
        {(id) => (
          <textarea
            id={id}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={`${inputClass} py-2`}
          />
        )}
      </Field>

      <details className={`group p-4 ${card}`}>
        <summary className="flex min-h-(--tap-min) cursor-pointer items-center text-body font-semibold text-accent focus-ring">
          Advanced: how this date is placed
        </summary>
        <div className="mt-3 flex flex-col gap-5">
          <p className="text-sm text-text-muted">
            Leave these on the family default unless this date follows a
            different custom. Family defaults are in Settings → Family
            conventions.
          </p>
          {FIELDS.map((f) => {
            const inh = inherited(s, kind, f.field);
            return (
              <PolicySelect
                key={f.field}
                field={f}
                value={overrides[f.field]}
                inheritedValue={String(inh.value)}
                inheritedLabel={
                  inh.source === "family" ? "Family default" : "Usual default"
                }
                onChange={(v) =>
                  setOverrides(setOverride(overrides, f.field, v))
                }
              />
            );
          })}
          <div className="flex flex-col gap-2">
            <span className="text-body font-semibold">Use sunrise in</span>
            <p className="text-body">
              {(observance ?? s.observanceLocation).name}{" "}
              <span className="text-sm text-text-muted">
                {observance ? "(this date only)" : "(family default)"}
              </span>
            </p>
            {observance && (
              <button
                type="button"
                className={btnOutline}
                onClick={() => setObservance(undefined)}
              >
                Use family default ({s.observanceLocation.name})
              </button>
            )}
            <CityPicker
              label="Change city for this date"
              onPick={(c) => setObservance(c.location)}
            />
          </div>
          {Object.keys(overrides).some((k) => k !== "pitruPaksha") && (
            <button
              type="button"
              className={btnOutline}
              onClick={() =>
                setOverrides(
                  overrides.pitruPaksha === undefined
                    ? {}
                    : { pitruPaksha: overrides.pitruPaksha },
                )
              }
            >
              Use family defaults for all of these
            </button>
          )}
        </div>
      </details>

      {error && (
        <p
          role="alert"
          className="rounded-md bg-warning-subtle p-3 text-body text-warning"
        >
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3 pb-8">
        <button
          type="button"
          className={btnPrimary}
          onClick={() => void save()}
        >
          Save
        </button>
        {existing && (
          <button
            type="button"
            className="flex min-h-(--tap-min) items-center rounded-md border-[1.5px] border-danger px-5 text-body font-semibold text-danger focus-ring"
            onClick={() => {
              if (
                window.confirm(
                  `Delete “${existing.title}”? This can't be undone.`,
                )
              )
                void deleteEvent(existing.id).then(() =>
                  navigate({ to: "/events" }),
                );
            }}
          >
            Delete
          </button>
        )}
      </div>
    </main>
  );
}

function TithiPicker({
  value,
  onChange,
}: {
  value: LunarDate;
  onChange: (d: LunarDate) => void;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(10rem,100%),1fr))] gap-3">
      <Field label="Month">
        {(id) => (
          <select
            id={id}
            value={value.month}
            onChange={(e) =>
              onChange({
                ...value,
                month: e.target.value as LunarDate["month"],
              })
            }
            className={inputClass}
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {monthName(m, "en")} ({monthName(m, "gu")})
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Sud / Vad">
        {(id) => (
          <select
            id={id}
            value={value.paksha}
            onChange={(e) =>
              onChange({
                ...value,
                paksha: e.target.value as LunarDate["paksha"],
              })
            }
            className={inputClass}
          >
            <option value="shukla">Sud (bright half)</option>
            <option value="krishna">Vad (dark half)</option>
          </select>
        )}
      </Field>
      <Field label="Tithi">
        {(id) => (
          <select
            id={id}
            value={value.tithi}
            onChange={(e) =>
              onChange({ ...value, tithi: Number(e.target.value) })
            }
            className={inputClass}
          >
            {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n === 15
                  ? value.paksha === "shukla"
                    ? "Punam (15)"
                    : "Amas (15)"
                  : n}
              </option>
            ))}
          </select>
        )}
      </Field>
      <label className={`${radio} col-span-full`}>
        <input
          type="checkbox"
          checked={!!value.adhik}
          onChange={(e) => {
            const { adhik: _a, ...rest } = value;
            void _a;
            onChange(e.target.checked ? { ...rest, adhik: true } : rest);
          }}
          className="size-5 accent-(--accent)"
        />
        <span className="text-body">It was in an extra month (adhik)</span>
      </label>
    </div>
  );
}

/** Before 1955 much of India kept local time (Bombay, Calcutta) that tz data doesn't model (ADR 0006). */
const historicalZoneWarning = (place: Location, date: string, time: string) =>
  place.tz === "Asia/Kolkata" && time && date < "1955-01-01"
    ? "Before 1955, many places in India kept their own local time (such as Bombay time), so the time you entered may be off by up to 40 minutes. Please check the tithi with a printed calendar from that year."
    : null;

function DateHelper({
  s,
  kind,
  overrides,
  initial,
  onConfirm,
}: {
  s: Settings;
  kind: EventKind;
  overrides: PolicyOverrides;
  initial: StoredEvent["origin"];
  onConfirm: (
    p: TithiProposal,
    origin: NonNullable<StoredEvent["origin"]>,
  ) => void;
}) {
  const [date, setDate] = useState<string>(initial?.date ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [place, setPlace] = useState<Location>(
    initial?.place ?? s.observanceLocation,
  );
  const [proposal, setProposal] = useState<TithiProposal | null>(null);
  const [error, setError] = useState("");
  const source =
    overrides.tithiSource ?? inherited(s, kind, "tithiSource").value;

  const workOut = async () => {
    const parsed = parseCivilDate(date);
    if (isParseError(parsed)) return setError("Please enter a full date.");
    setError("");
    try {
      setProposal(
        await worker.tithiFromDate(place, parsed, time || undefined, source),
      );
    } catch {
      setError("The tithi couldn't be worked out for that place and date.");
    }
  };

  if (proposal) {
    const warning = historicalZoneWarning(place, date, time);
    return (
      <div className={`flex flex-col gap-3 p-4 ${card}`}>
        <p className="text-lg">
          This works out to{" "}
          <strong className="font-semibold">
            {lunarLabel(proposal.lunarDate)}
          </strong>
          . Is that right?
        </p>
        {proposal.civilDate !== date && (
          <p className="text-sm">
            The time is before sunrise, so it counts as the day of{" "}
            {dateShort(proposal.civilDate)}.
          </p>
        )}
        {proposal.nearChange && (
          <p className="rounded-md bg-warning-subtle p-3 text-body text-warning">
            Close to a tithi change. Please check with a printed calendar.
          </p>
        )}
        {warning && (
          <p className="rounded-md bg-warning-subtle p-3 text-body text-warning">
            {warning}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={btnPrimary}
            onClick={() =>
              onConfirm(proposal, {
                date: date as CivilDate,
                ...(time && { time }),
                place,
              })
            }
          >
            Yes, use this
          </button>
          <button
            type="button"
            className={btnOutline}
            onClick={() => setProposal(null)}
          >
            Change the date
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(12rem,100%),1fr))] gap-3">
        <Field label="Date">
          {(id) => (
            <input
              id={id}
              type="date"
              min="1800-01-01"
              max="2200-12-31"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          )}
        </Field>
        <Field label="Time (optional)" hint="Local time where it happened.">
          {(id) => (
            <input
              id={id}
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputClass}
            />
          )}
        </Field>
      </div>
      <p className="text-body">
        Where it happened:{" "}
        <strong className="font-semibold">{place.name}</strong>
      </p>
      <CityPicker label="Change place" onPick={(c) => setPlace(c.location)} />
      {error && (
        <p role="alert" className="text-body text-warning">
          {error}
        </p>
      )}
      <button
        type="button"
        className={btnOutline}
        onClick={() => void workOut()}
      >
        Work out the tithi
      </button>
    </div>
  );
}
