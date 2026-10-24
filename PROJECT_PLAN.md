# Pocket Panchang — Project Plan

> Master planning document. This is the source of truth for scope, architecture, and the phase-by-phase workflow.
> `CLAUDE.md` (created in Phase 0) stays short and points here.

---

## 0. Working Rules (read first, every session)

These rules apply to every phase and to every AI agent working in this repo.

1. **Never commit, push, tag, or rebase.** Bhavy commits manually. No `git commit`, `git push`, `git tag`, `git rebase`, `git reset --hard`, or `git stash drop`, ever. Read-only git commands (`git status`, `git diff`, `git log`) are fine.
2. **Work one phase at a time.** Do not start the next phase until Bhavy explicitly says so.
3. **Stop at the end of every phase** and output:
   - A summary of what was done
   - The files created or changed
   - Any open questions or deviations from this plan
   - **A suggested commit message** in Conventional Commits format (see §14)
4. **Engine ownership mode.** In phases marked `[OWN]`, Bhavy writes the core algorithms. Claude explains concepts, proposes function signatures, writes tests and fixtures, and reviews Bhavy's code. Claude writes core algorithm code only when Bhavy explicitly says "write it".
5. **No silent decisions.** If a choice isn't covered by this plan or an ADR, ask before proceeding, offering a recommended answer.
6. **No new dependencies without a stated reason.** Every added package gets a one-line justification in the phase summary.
7. **Correctness beats features.** A wrong tithi or festival date is a critical bug. Never ship unverified festival rules.
8. **Keep this file current.** If a decision changes the plan, update the relevant section. If an architectural or domain decision changes the plan, record an ADR in `docs/adr/`. Naming or tooling-alignment changes only need the plan update.

---

## 1. Product

### 1.1 One-liner
A beautiful, private, offline Hindu panchang that's Gujarati-first and diaspora-aware, built around **personal tithi reminders**: family birthdays, varsi/shraddh, and anniversaries that follow the lunar calendar.

### 1.2 Problem
- Many families (especially Gujarati) observe birthdays by **janma tithi** and the yearly **shraddh/varsi** by a relative's death tithi. Converting "Kartik Sud 5" to next year's Gregorian date is a manual, error-prone chore every year.
- Existing panchang apps (e.g., Drik Panchang) are comprehensive but dense, ad-supported, and not built around personal events.
- NRI families in the US, UK, and elsewhere need correct local dates, which depend on local sunrise and DST.

### 1.3 Differentiators (why this app should exist)
1. **Personal tithi reminders** as a first-class feature, with explicit adhik/kshaya policies.
2. **Calm, glanceable design.** Today's answer on one line, details on tap.
3. **Explainability.** A sky dial showing the Sun–Moon angle so users see *why* today is a given tithi.
4. **Gujarati-first defaults** (Amanta, Kartikadi Vikram Samvat, Choghadiya), with Hindi and English.
5. **Private by design.** No account, no server, no analytics, no ads.
6. **Measured accuracy.** A published CI accuracy report against reference data.

### 1.4 Target users
- Primary: Gujarati households in India (including older users with budget Android phones).
- Secondary: Gujarati and Hindu diaspora (DST time zones).
- Tertiary: anyone wanting a clean daily panchang.

### 1.5 Non-goals (never, unless this plan is formally changed)
- Kundali, horoscope matching, predictions, astrology readings.
- User accounts, cloud sync servers, analytics, ads.
- Hundreds of unverified festivals.

---

## 2. Scope by Version

### v1 (estimate: ~20–28 weeks part-time; see "Timeline estimate" below)
- **Amanta tradition only** (Gujarati-first). Purnimanta moves to v2.
- City search only (dense India/Gujarat city dataset). GPS and custom locations move to v2.
- Daily panchang for a chosen city: tithi, nakshatra, yoga, karana, vara, with end times; sunrise, sunset, moonrise, moonset.
- Lunar month, paksha, Vikram Samvat (Kartikadi) and Shaka year; adhik month display.
- Muhurta: Rahu Kaal, Yamaganda, Gulika, Bhadra, day and night Choghadiya, with a "now" indicator.
- Month calendar grid showing the tithi per day, including vriddhi/kshaya markers.
- **13 verified festivals** (ADR 0018): Dhanteras, Kali Chaudas, Diwali, Bestu Varas, Bhai Bij, Navratri (span), Dussehra, Janmashtami (Smarta and Vaishnava shown labelled when they differ), Raksha Bandhan (with "after Bhadra" timing), Holika Dahan, Dhuleti, Maha Shivaratri, Uttarayan (sankranti rule).
- Muhurta includes Bhadra (Vishti karana) windows.
- Personal tithi events: create, edit, delete; upcoming occurrences list.
- Reminders: Android local notifications; `.ics` calendar export (web and Android).
- Languages: Gujarati and English.
- PWA (offline web) and Android app (Capacitor).
- JSON backup export/import.
- Three palettes (Calm, Mandir, Raat), each light and dark (ADR 0017).

### v2
- Sky dial visualization (Sun/Moon/elongation/phase).
- More festivals including Ekadashi (complex rules) and Sankranti list.
- Hindi language.
- Android home-screen widget (native Kotlin).
- **Purnimanta tradition**: display, entry, and Amanta↔Purnimanta conversion including the adhik-month split (ADR 0002); Purnimanta-region festival naming; more regional calendars.
- **GPS location and custom locations** (ADR 0011).

### Timeline estimate (re-estimated 2026-10-22, after Phase 1)

Part-time at ~10 h/week. The original ~5–6 week target predates the Phase 1 scope (policy cascade, Pitru Paksha, date helper with historical time zones, observance location, family preview).

| Phase | Weeks |
|---|---|
| 2 Design lock | done (reduced scope) |
| 3 Scaffolding | 1 |
| 4 [OWN] Sunrise + tithi | 2–3 |
| 5 [OWN] Engine complete | 3–4 |
| 6 Calendar (13 festivals, policies, `.ics`) | 2–4 |
| 7 App shell (city search only) | 2 |
| 8 Design remaining screens + core screens (3 palettes) | 3–5 |
| 9 Personal events + family preview | 2–3 |
| 10 PWA, i18n, a11y, perf | 2 |
| 11 Android | 2–3 |
| 12 Release | 1 |
| **Total** | **~20–28** |

---

## 3. Domain Primer and Glossary

| Term | Meaning | Computation |
|---|---|---|
| **Tithi** | Lunar day; 30 per lunation | (Moon − Sun) longitude in 12° steps. Ayanamsa cancels → tropical longitudes OK |
| **Paksha** | Fortnight: Shukla (waxing, tithis 1–15), Krishna (waning, 16–30) | From tithi index |
| **Nakshatra** | Lunar mansion; 27 | Sidereal Moon longitude in 13°20′ steps |
| **Yoga** | 27 yogas | (Sun + Moon) **sidereal** longitude in 13°20′ steps; ayanamsa does NOT cancel |
| **Karana** | Half-tithi; 60 per lunation (11 names: 7 movable + 4 fixed) | Elongation in 6° steps |
| **Vara** | Weekday | Hindu day runs sunrise → sunrise |
| **Udaya tithi** | Tithi prevailing at local sunrise; it names the civil day | |
| **Vriddhi tithi** | Tithi present at two consecutive sunrises | |
| **Kshaya tithi** | Tithi that starts and ends between two sunrises (present at none) | |
| **Amanta** | Month ends at Amavasya (new moon). Gujarat, Maharashtra, South India | |
| **Purnimanta** | Month ends at Purnima (full moon). North India | |
| **Sankranti** | Sun entering a new sidereal rashi (30° segment) | |
| **Adhik masa** | Lunar month containing no sankranti; an extra month, named after the following month | |
| **Nija masa** | The regular month that follows an adhik month of the same name | |
| **Kshaya masa** | Lunar month containing two sankrantis; a rare dropped month | |
| **Vikram Samvat (Kartikadi)** | Gujarati year; begins Kartik Shukla Pratipada (day after Diwali) | |
| **Ayanamsa** | Offset between tropical and sidereal zodiac. Use **Lahiri** (Indian government standard) | |
| **Rahu Kaal / Yamaganda / Gulika** | Inauspicious periods: daylight split into 8 parts, segment chosen by weekday | |
| **Choghadiya** | Day and night each split into 8 parts in a rotating sequence (Amrut, Shubh, Labh, Char, Udveg, Kaal, Rog) | |
| **Festival windows** | Time-of-day a festival tithi must cover: sunrise, madhyahna (midday), aparahna, pradosh (dusk), nishita (midnight) | |
| **Purva-/Para-vyapini** | Classical tie-break rules when a tithi touches two days' windows | |

> The glossary is maintained in `GLOSSARY.md` (created by `/grill-with-docs`). Keep both consistent.

---

## 4. Calculation Specification

### 4.1 Astronomy source
- **astronomy-engine** (MIT, pure JS, ~±1 arcminute vs NOVAS, <120 KB minified).
- **Do not use Swiss Ephemeris** (AGPL or paid license; not needed at our precision).
- **grahan** (MIT TypeScript panchang library) is used **only as an independent cross-check in tests**, never as a runtime dependency.
- **Moonrise / moonset** (display only): topocentric Moon centre at 0° altitude, per sunrise-to-sunrise day ([ADR 0022](docs/adr/0022-moonrise-convention.md)).

### 4.2 Error budget (be able to explain this)
- The Moon gains ~12°/day on the Sun (varies ~10.8–14.5°/day; measured hourly over 2020–2040 with astronomy-engine: 10.75–14.39°/day).
- A 1′ longitude error therefore shifts a tithi end time by ~2 minutes.
- Target: tithi/nakshatra end times within **±2 min** of the reference; sunrise/sunset within **±1 min**.
- The measured numbers (not just targets) go in the README accuracy report.

### 4.3 Core algorithm: crossing finder
All "end times" are roots of an angular function:

```
f(t) = normalize(angle(t) − target)   // angle = elongation, sidereal moon, (sun+moon) sidereal, etc.
```
- Bracket the crossing by stepping (e.g., 1–2 h steps, using approximate rates).
- Refine with bisection or the secant method to < 1 second.
- **Handle 360° wraparound explicitly.** This is where the first bugs will appear.
- Pure function signature (proposal):
  ```ts
  findCrossing(fn: (jd: number) => number, targetDeg: number, startJd: number, endJd: number): number | null
  ```

### 4.4 Sunrise definition
- **Decided (ADR 0012):** upper limb with standard atmospheric refraction, sea level, matching the reference's stated default. Passed to the engine as a parameter `SunriseDefinition { limb: "upper" | "centre"; refraction: boolean }`; not user-facing in v1.
- Phase 4 tests both definitions against the reference and confirms which one matches; fixture files record the reference's definition.
- Polar cases (no sunrise/sunset) must not crash; return explicit states.

### 4.5 Day assembly
- Civil Hindu day = sunrise(D) → sunrise(D+1) at the selected location.
- The day's tithi = the tithi active at sunrise(D). Also list every tithi ending within the day, with end times.
- Same pattern for nakshatra, yoga, karana.
- Detect vriddhi and kshaya.

### 4.6 Months and years
- Lunar month = new moon → next new moon (Amanta). Purnimanta naming (v2) is derived from Amanta, but it is **not** a plain half-month shift in adhik-month years (see ADR 0002).
- Month name = determined by the sidereal solar rashi (sankranti logic): exact rule in ADR 0020.
- Adhik: no sankranti between consecutive new moons. Kshaya: two sankrantis (rare; must still be handled).
- Vikram Samvat (Kartikadi): increments at Kartik Shukla Pratipada. Chaitradi variant supported via settings.
- Shaka Samvat: increments at Chaitra Shukla Pratipada.

### 4.7 Festival resolver (data-driven)
Festivals are **data**, not code:

```ts
type FestivalRule = TithiFestival | SankrantiFestival | RelativeFestival; // ADR 0018

type FestivalBase = {
  id: string;                         // "holika-dahan"
  names: Record<Lang, string>;
  variant?: { group: string; label: Record<Lang, string> }; // e.g. group "janmashtami", label "Smarta" per language; label shown only when variants differ (ADR 0018)
  verified: { against: string; years: number[] };  // must be filled before shipping
};

type TithiFestival = FestivalBase & {
  kind: "tithi";
  month: LunarMonth;                  // in the Amanta frame internally
  paksha: "shukla" | "krishna";
  tithi: number;
  window: "sunrise" | "madhyahna" | "aparahna" | "pradosh" | "nishita";
  tieBreak: "purva-vyapini" | "para-vyapini" | "max-coverage";
  extra?: { nakshatra?: Nakshatra };  // e.g., Rohini for Janmashtami
  avoidBhadra?: boolean;              // date resolution skips Bhadra (Vishti karana); Holika Dahan
  span?: { end: { paksha: "shukla" | "krishna"; tithi: number } }; // multi-day, e.g. Navratri Sud 1 → Sud 9
  bhadraTiming?: "show-after";        // display "after Bhadra" timing (Raksha Bandhan); date resolution unchanged
  adhikPolicy: "nija-only";           // festivals not observed in adhik month by default
};

type SankrantiFestival = FestivalBase & {
  kind: "sankranti";
  rashi: Rashi;                       // sidereal sign entered, e.g. "makara" for Uttarayan
  afterSunset: "next-day" | "same-day"; // where it falls when the sankranti instant is after local sunset
};

type RelativeFestival = FestivalBase & {
  kind: "relative";
  of: string;                         // another festival's id, e.g. "holika-dahan"
  offsetDays: number;                 // civil days after it, e.g. 1 for Dhuleti
};
```
- Resolver (tithi kind): for each candidate day, compute the tithi coverage of the window → apply the tie-break; with `avoidBhadra`, coverage that falls inside Bhadra does not count. A `span` ends on the day the end tithi resolves to under the same window and tie-break, so its length in civil days (e.g., 8–10 for Navratri) comes from the engine. (Same-window end rule is provisional; see §13.)
- Sankranti kind: the civil day containing the sankranti instant, moved per `afterSunset`.
- Relative kind: resolved after its base festival; `of` must reference an existing rule (no cycles).
- Variants (`variant.group`): if all variants in a group resolve to the same day, show **one** marker with the festival name; show **two (or more) labelled markers** (`variant.label`) only when the dates differ.
- A festival ships only when `verified` is filled with reference years.

### 4.8 Muhurta
- Rahu Kaal / Yamaganda / Gulika: daylight / 8, weekday-indexed segment tables.
- Choghadiya: day and night / 8 each, weekday-dependent starting sequence.
- **Bhadra:** the Vishti karana window(s) of the day, shown as an inauspicious muhurta (ADR 0018).
- **Next good time:** the next good Choghadiya (Amrut, Shubh, Labh) that does not overlap Rahu Kaal or Bhadra (approved Today design, `docs/design/screens.md`).

### 4.9 Personal tithi events: occurrence rules
```ts
type EventKind = "birthday" | "shraddh" | "anniversary" | "custom";

type OccurrencePolicy = {
  adhikMonth: "nija" | "adhik" | "match-origin" | "both"; // which month counts in an adhik year (ADR 0009)
  kshayaTithi: "same-day" | "following-day"; // sunrise window: where a kshaya tithi's event goes (ADR 0010)
  vriddhiTithi: "first-day" | "second-day"; // which day when the tithi is at two sunrises (sunrise window)
  window: "sunrise" | "aparahna";           // which part of the day the tithi must cover (ADR 0003)
  pitruPaksha: boolean;                     // shraddh only: also observe in Pitru Paksha (ADR 0004)
  tithiSource: "moment" | "calendar-day";   // date helper only: tithi at the entered time vs. that date's udaya tithi (ADR 0006)
};

type PolicyOverrides = Partial<OccurrencePolicy>;

// Resolved per field (ADR 0005):
// effective = event.policyOverrides ?? settings.householdPolicy[kind] ?? BUILTIN_POLICY[kind]
```
- Built-in defaults are one complete policy per event kind. Fields that depend on family convention carry **provisional** defaults until confirmed (see §13 "Pending family confirmations"); confirmation is required before Phase 6 is complete.
- Household defaults are set in Settings → "Family conventions"; per-event overrides are under "Advanced" in the event form. Events store only overrides.
- Kshaya masa: an event whose month is kshaya that year occurs in the absorbing month (ADR 0008).
- `window` built-in: sunrise for birthday/anniversary/custom; shraddh provisional aparahna. Personal-event tie-breaks are defined in ADR 0003, not inherited from festival rules.

---

## 5. Architecture

### 5.1 Layers

```
┌─────────────────────────────────────────────────────────┐
│  UI (React)            screens, components, animations  │
├─────────────────────────────────────────────────────────┤
│  App data layer        TanStack Query  ·  Zustand       │
│                        (async computed data · settings) │
├──────────────────────────┬──────────────────────────────┤
│  Platform ports          │  Persistence                 │
│  notify · geo · share    │  IndexedDB (Dexie)           │
│  web adapter | Capacitor │  settings · events · cache   │
├──────────────────────────┴──────────────────────────────┤
│  Worker boundary (Comlink)  ← all heavy computation      │
├─────────────────────────────────────────────────────────┤
│  Domain services   day assembly · festival resolver ·    │
│                    reminder scheduler (pure TS)          │
├─────────────────────────────────────────────────────────┤
│  Engine            astronomy-engine → longitudes →       │
│                    crossing finder → tithi/nakshatra/... │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Architectural rules
1. `packages/engine` and `packages/calendar` are **pure**: no `Date.now()`, no DOM, no IndexedDB, no timezone libraries. Inputs: UTC instants (Julian Day or epoch ms) + coordinates. Outputs: plain serializable data.
2. All heavy computation runs in a **Web Worker**. The main thread never calls the engine directly.
3. Time zones are applied **only at the UI edge** via `Intl.DateTimeFormat` with the location's IANA zone.
4. Platform-specific behavior lives behind **ports** (interfaces) with web and Capacitor adapters.
5. Dependency direction: `app → calendar → engine`. Never the reverse. `i18n` may import `engine` types only; `calendar` may import `i18n` (ADR 0015, enforced by lint).
6. **Parse, don't validate** (ADR 0014): domain inputs are branded types (e.g., `CivilDate`, `LocationId`) produced only by parse functions; engine and calendar APIs accept only branded types. Every input boundary (URL, backup import, notification payloads, forms) parses.

### 5.3 Repository structure

```
pocket-panchang/
├── PROJECT_PLAN.md          # this file
├── CLAUDE.md                # short agent guide → points here
├── GLOSSARY.md              # domain glossary (grill-with-docs)
├── docs/
│   ├── adr/                 # architecture decision records
│   └── design/              # locked screen designs, tokens
├── .claude/
│   ├── settings.json        # permissions (git write ops denied)
│   └── skills/              # project skills (Phase 0)
├── packages/
│   ├── engine/              # astronomy wrapper, crossing finder, panchang elements, months, samvat
│   ├── calendar/            # festival rules (data) + resolver, muhurta, personal-event occurrences, ics
│   └── i18n/                # names of tithis, nakshatras, months, festivals (gu, en; hi in v2)
├── apps/
│   └── app/                 # React + Vite; PWA + Capacitor Android
├── fixtures/                # golden reference data per city/year (JSON)
├── scripts/                 # fixture tools, accuracy report generator
├── pnpm-workspace.yaml
└── .github/workflows/       # CI
```

### 5.4 Tech stack

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript (strict, `noUncheckedIndexedAccess`) | Correctness |
| Package manager | pnpm workspaces | Monorepo with a real package boundary |
| UI | React + Vite | Familiar; effort goes into the hard parts |
| Styling | Tailwind + design tokens (CSS variables) | Consistent scale; dark mode |
| Routing | TanStack Router, code-based routes (ADR 0014) | Typed, validated search params |
| Async computed data | TanStack Query over worker calls | Caching, dedupe, prefetch for free |
| Settings state | Zustand (persisted) | Small, synchronous reads |
| Persistence | Dexie (IndexedDB) | Versioned schema migrations |
| Worker RPC | Comlink | Type-safe worker calls |
| Astronomy | astronomy-engine | MIT, accurate enough, small |
| PWA | vite-plugin-pwa (Workbox) | Offline web |
| Android | Capacitor | Reliable local notifications; native widget later (TWA can't) |
| Animation | Motion (Framer Motion), used sparingly | UX polish |
| Unit tests | Vitest | Fast, TS-native |
| Property tests | fast-check | Invariants |
| E2E | Playwright | Main user flows on web |
| Lint/format | ESLint 9 (typescript-eslint type-checked) + Prettier (ADR 0015; TypeScript 6 and ESLint 9 are capped, see ADR) | Type-aware async rules; enforces purity and dependency direction |
| CI | GitHub Actions | Typecheck, lint, test, accuracy report, build |
| Web hosting | Vercel → `panchang.bhavyladani.in` | Existing setup |

### 5.5 Platform ports

```ts
interface ReminderPort {
  schedule(items: ReminderOccurrence[]): Promise<void>;
  cancelAll(): Promise<void>;
  capability(): "exact" | "unreliable" | "none";
}
interface GeoPort   { currentPosition(): Promise<{ lat: number; lng: number } | null>; }
interface SharePort { shareFile(name: string, data: Blob): Promise<void>; }
```
- **Android:** Capacitor Local Notifications. Schedule a rolling ~12-month window (alarm count limits). Reschedule on app open and on event changes. Detect exact-alarm permission and battery-optimization problems and guide the user.
- **Reminder timing:** occurrences are civil dates in the event's observance city; a reminder fires at the chosen device-local time but never later than that wall-clock time in the observance city (ADR 0007).
- **Web:** no reliable scheduled notifications → in-app upcoming list + **`.ics` export** (next 10 years of each personal event). `.ics` export is offered on Android too. UIDs are stable and brand-neutral: `{eventId}-{year}-{occurrence}@panchang.bhavyladani.in` (ADR 0016).

---

## 6. Data Model

```ts
type Lang = "gu" | "en" | "hi";

type Location = { id: string; name: string; lat: number; lng: number; tz: string; country: string };

type Settings = {
  location: Location;
  tradition: "amanta" | "purnimanta"; // v1: always "amanta"; kept so v2 needs no migration
  samvat: "vikram-kartikadi" | "vikram-chaitradi" | "shaka";
  language: Lang;
  palette: "calm" | "mandir" | "raat"; // colour palette (ADR 0017)
  theme: "system" | "light" | "dark";  // mode, independent of palette
  textScale: number;               // respects OS scale; extra multiplier
  householdPolicy: Partial<Record<EventKind, PolicyOverrides>>; // "Family conventions" (ADR 0005)
  observanceLocation: Location;    // household "Observance city"; snapshot, set at onboarding (ADR 0007)
};

type PersonalEvent = {
  id: string;
  title: string;                   // "Ba's varsi", "Dad's janma tithi"
  kind: EventKind;
  lunarDate: { month: LunarMonth; adhik?: boolean; paksha: "shukla" | "krishna"; tithi: number }; // Amanta frame (ADR 0002); adhik = original date in adhik month (ADR 0009)
  policyOverrides: PolicyOverrides; // sparse; resolved by cascade (§4.9, ADR 0005)
  pitruPakshaDay?: "same-tithi" | "bhadrapada-purnima" | number; // shraddh only; number = Bhadrapada Krishna tithi 1–15 (ADR 0004)
  observanceLocation?: Location;   // per-event override; snapshot (ADR 0007)
  origin?: {                       // display/audit only; never auto-recomputed (ADR 0006)
    date: string;                  // "YYYY-MM-DD", as entered (local to origin place)
    time?: string;                 // "HH:mm", as entered; interpreted in the place's historical IANA zone
    place: Location;               // where the birth/death happened; NOT the observance location
  };
  remindDaysBefore: number[];      // e.g., [0, 1]
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

/** Output of engine `assembleDay(localMidnight, coordinates)` (§4.5, Phase 5). localMidnight is computed by the caller from the IANA zone (the engine bans Intl). */
type PanchangDay = {
  kind: "day";
  sunrise: Instant; nextSunrise: Instant; sunset: SunEvent;
  vara: number;                                   // 0 = Ravivara, from the sunrise-to-sunrise day
  tithi: ElementDay; paksha: "shukla" | "krishna";
  nakshatra: ElementDay; yoga: ElementDay; karana: ElementDay;
  bhadra: { start: Instant; end: Instant }[];    // Vishti windows overlapping the day (ADR 0018)
  month: { name: LunarMonth; adhik: boolean; absorbs: LunarMonth | null }; // ADR 0020
  samvat: { vikramKartikadi: number; vikramChaitradi: number; shaka: number };
} | { kind: "no-civil-day"; sunUp: boolean };      // polar (§4.4)
type ElementDay = { atSunrise: number; ends: { index: number; endsAt: Instant }[]; vriddhi: boolean; kshaya: number[] };

type CachedMonth = {
  key: string;                     // `${engineVersion}|${locationId}|${tradition}|${yyyy-mm}`
  days: PanchangDay[];
  computedAt: number;
};
```

### Persistence (Dexie, versioned)
- Database name `panchang` (brand-neutral, ADR 0016). Tables: `settings`, `events`, `monthCache`.
- Every schema change = a new Dexie version with a migration. Never mutate a schema in place. From the first family preview (after Phase 9) onward, wiping the database is never acceptable (ADR 0013).
- Backup format: versioned JSON `{ schemaVersion, exportedAt, settings, events }`. The cache is never exported. **v1 = `schemaVersion: 1`** (Phase 9): import parses every field (ADR 0014), refuses newer versions with a plain message, and replaces settings and events after a confirmation. The settings table also holds a `meta` row `{ lastBackupAt }` for the backup nudge (no schema change).

---

## 7. Caching and Performance

- **Cache key:** `engineVersion | locationId | tradition | yyyy-mm`. Bump `engineVersion` on any calculation fix → automatic invalidation.
- **Key by city, not raw GPS.** Sunrise shifts ~4 min per degree of longitude; raw coordinates destroy the cache hit rate. GPS (if used) snaps to the nearest city.
- **Cold start:** read today's cached result from IndexedDB → render immediately → recompute in the worker → reconcile only if different. No spinners; skeletons only on true first run.
- **Prefetch:** today + current month first, then adjacent months during idle time.
- **Budgets (initial proposals, measured in Phase 10):**
  - Initial JS (gzip): **≤ 170 KB** excluding fonts and the worker (raised from 150 KB on 2026-10-23, see below)
  - Worker (gzip): ≤ 40 KB (28 KB at Phase 7)
  - Today view visible: < 1 s on a mid-range Android, warm start
  - Month computation: < 300 ms in the worker
- **Lazy-load:** city database, non-active locales, the worker bundle, the onboarding route; in Phase 8+, every route except Today.
- **Measured at end of Phase 7 (2026-10-23, `pnpm --filter @panchang/app analyze`):** initial JS 140.8 KB gzip, of which React + react-dom ≈ 64 KB, Dexie ≈ 27 KB, TanStack Router ≈ 30 KB, TanStack Query ≈ 12 KB, comlink + zustand ≈ 2 KB, app code ≈ 5 KB. The §5.4 stack alone is a ~135 KB floor, so 150 KB would leave ~10 KB for the Today screen, its i18n strings and formatting. **Decision:** budget 170 KB for initial JS (stack + Today ≤ ~35 KB); all other screens lazy per route. Rejected: swapping React for Preact/compat (saves ~50 KB, but TanStack Router/Query compatibility risk) and raw IndexedDB instead of Dexie (saves ~27 KB, but loses versioned migrations, which §6 requires). City data (788 KB gzip incl. Indian alternate names) is fetched only by city search.
- **Measured during Phase 8 (2026-10-23):** initial JS 153.4 KB gzip (Today screen +12.6 KB); worker 30.1 KB gzip (festival resolver added); Month and Day detail are one lazy chunk (4.2 KB gzip).
- **Measured in Phase 11 (2026-10-24, Android 16 emulator, 4 cores / 4 GB, on an Apple-silicon host, so faster than a budget phone):** cold process start to first frame 0.62–1.0 s, Today glance 430–610 ms after WebView navigation start; hot start (app in memory) 50–188 ms; month in a fresh worker 219–320 ms (first computation, JIT-cold; borderline vs 300 ms), 50–152 ms once warm. With 2 GB RAM the same emulator swapped and took 6–9 s, so 2 GB Android 16 is not a supported budget target. Re-measure on the S24 and a real budget phone.
- **Measured at end of Phase 10 (2026-10-24, `pnpm --filter @panchang/app e2e budgets`, production build, CPU ×4 + slow 4G via CDP):** initial JS **158.0 KB gzip** by Vite's report (152.8 KB by the E2E check's zlib) plus the active language catalogue loaded at boot (en 5.1 / gu 6.1 KB); worker **32.1 KB**; Today glance visible **139–262 ms** after a warm (service-worker + IndexedDB) reload; a never-computed month **55–133 ms** worker round trip. All budgets met. Caveat: a throttled laptop CPU is still faster than a real mid-range Android; re-measure on a device in Phase 11. Precache: 26 files, 2.58 MB (1.86 MB is the city list, for offline onboarding and city changes); Devanagari fonts are cached on first use only.
- **Measured at end of Phase 9 (2026-10-24):** initial JS 156.8 KB gzip; worker 32.0 KB gzip (moon, occurrences, .ics, date helper); all non-Today routes in one lazy chunk (11.7 KB gzip).
- **Fonts:** self-host Noto Sans Gujarati / Devanagari, subset to used glyphs.

---

## 8. Offline Location Data
- Source: GeoNames cities subset (**CC-BY 4.0: attribution required** in the About screen).
- Scope v1: Indian cities + major diaspora cities (US, UK, Canada, Australia, UAE, etc.).
- Each entry: id, name, lat, lng, IANA tz, country. Compressed JSON, lazy-loaded, searched locally.
- **Location model (ADR 0011):** v1 is **city search only**, using a dense India/Gujarat dataset. **Decided in Phase 7:** GeoNames `cities1000` for India (7,206 places) + `cities5000` for ~40 diaspora countries; 33,264 cities, 0.79 MB gzip / 0.58 MB brotli, lazy-loaded by the worker (`scripts/build-cities.mjs` → `apps/app/public/data/cities.json`). Indian names display in ASCII ("Nadiad"); search folds accents and matches Indian alternate names (untagged/English Latin names like "Baroda", "Bombay", and Gujarati script; +9 KB gzip). Measured alternatives: `cities5000` worldwide 1.34 MB gzip, `cities1000` worldwide 3.0 MB gzip; India barely differs between the two (7,206 vs 6,583). **v2** adds optional GPS (read once, on-device) that snaps to the nearest city within ~25 km or otherwise creates a **custom location** (coordinates rounded to 0.1°, user-named, device time zone with nearest-city fallback, manual tz override).

---

## 9. UX Principles

1. **Glanceable home:** one line answers why the user opened the app:
   *"Kartik Sud 2 · Choghadiya: Amrut until 10:42 · Rahu Kaal 1:30–3:00"*
2. **Elderly-friendly by default:** large base type, respects OS font scaling, ≥ 48 dp tap targets, WCAG AA contrast, no meaning conveyed by color alone.
3. **Onboarding in 2 steps (v1):** city → language. (v2 adds a tradition step when Purnimanta ships.) No jargon like "ayanamsa" in onboarding.
   **Plain labels everywhere:** forms and settings use plain-language labels (e.g., "Follow printed calendar day" / "Traditional shraddh timing (afternoon)"); technical terms appear only in help text.
4. **Responsive:** single column on mobile; month grid + day detail side by side on desktop.
5. **Trust surfaces:** a "How this is calculated" page; a "Report a mismatch" button that opens a pre-filled email/GitHub issue with date, city, settings, and engine version.
6. **Durability nudges:** prompt for a backup after 3+ personal events; one-tap export/import.
7. **Motion with purpose:** transitions explain state changes, never decorate. Respect `prefers-reduced-motion`.
8. **Dark mode** that is genuinely designed, not inverted.

### v1 screens
1. Onboarding (2 steps in v1)
2. Today (glance line, panchang elements with end times, muhurta timeline with "now")
3. Month (grid with tithi per day, festival markers, vriddhi/kshaya markers)
4. Day detail (full panchang for a selected date)
5. Personal events (list, upcoming, create/edit with policy options)
6. Settings (location, samvat, language, palette, theme mode, text size, family conventions, backup, notifications health, about/attribution)

---

## 10. Testing and Accuracy Strategy

1. **Golden fixtures:** reference values per city per year in `fixtures/` (tithi/nakshatra/yoga/karana end times, sunrise/sunset, festival dates).
   - Cities: Ahmedabad, Delhi, Chennai, New York, London.
   - Years: 2 in v1, **sampled, not scraped in full**: ~24 chosen days per city-year (seasonal anchors incl. solstices, the v1 festival days, vriddhi/kshaya tithi days, lunar-month edges, DST days). Method and politeness rules: accuracy-fixtures skill.
   - **Drik reference is Ahmedabad only (82 days, 2026–27):** Drik served a CAPTCHA after ~110 polite requests (2026-10-23); automated fetching stopped for good. The other cities are checked independently: NOAA sunrise/sunset every day, element end instants against JPL Horizons, and grahan.
   - Each fixture file records its source, retrieval date, and the reference's sunrise definition (ADR 0012).
2. **Invariant/property tests (fast-check):**
   - Exactly 30 tithis per lunation
   - Elongation monotonic between new moons
   - Nakshatras cycle in order; karana sequence correct
   - Vriddhi and kshaya counts consistent over a lunation
   - End times strictly increasing within a day
3. **Cross-check:** compare against grahan in tests; flag disagreements beyond tolerance. Independent sunrise/sunset check for **every day** of both years in all 5 cities against NOAA's published solar equations (test-only helper), with USNO spot checks on disagreement.
4. **Edge cases:** DST transition days (New York, London), date-line-adjacent zones, high latitudes, adhik-month years, kshaya tithis, leap years.
5. **CI accuracy report:** printed on every run (max/mean error per element). Published in the README.
6. **E2E (Playwright):** onboarding, today view, month navigation, create personal event, `.ics` export.

---

## 11. Privacy and Security
- No network calls at runtime except optional font/asset loading at install (prefer fully bundled).
- No analytics, no crash reporting SDKs, no ads.
- All user data stays on the device; backups are user-initiated files.
- Content Security Policy on the web build.
- Play Store data safety form: "No data collected".

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| Wrong festival date → trust loss | Verified-only festival rules; fixtures; "report mismatch"; clear stated conventions |
| Users compare with the family pandit's printed panchang | "How this is calculated" page; tradition choice (v2) |
| Android notification reliability (Samsung/Xiaomi battery optimization) | Notifications health screen; `.ics` export as fallback |
| Scope creep toward a Drik clone | Non-goals in §1.5; v1/v2 split |
| Losing data on phone loss | Backup nudges; Android Auto Backup; export/import |
| AI writes the engine and Bhavy can't explain it | `[OWN]` phases (§0 rule 4) |

---

## 13. Open Decisions (resolve in Phase 1 → ADRs)

1. **Personal events in adhik-month years:** default `nija` or `adhik`? (Proposal: `nija`; confirm with family convention.) → **Decided: ADR 0009** (default provisional).
2. **Kshaya-tithi placement default** for personal events: previous day or next day? → **Decided: ADR 0010** (`same-day | following-day`; default provisional).
3. **Location model:** city picker only, or GPS that snaps to the nearest city? (Proposal: both; GPS optional, snapped.) → **Decided: ADR 0011.**
4. **v1 platform priority:** develop web-first, release web + Android together? (Proposal: yes.) → **Decided: ADR 0013** (plus a private family web preview after Phase 9).
5. **Sunrise definition:** upper limb + refraction? Validate against the reference. → **Decided: ADR 0012** (confirm in Phase 4).
6. **Router:** TanStack Router vs React Router. → **Decided: ADR 0014** (TanStack Router, code-based routes).
7. **Lint/format:** ESLint + Prettier vs Biome. → **Decided: ADR 0015** (ESLint type-checked + Prettier; lint enforces purity and dependency direction).
8. **App name check:** confirm "Pocket Panchang" is free on the Play Store; package id proposal `in.bhavyladani.pocketpanchang`. → **Decided: ADR 0016.** The name is taken; "Pocket Panchang" stays the working name, package id `in.bhavyladani.panchang`, public name chosen before Phase 11. All persisted identifiers are brand-neutral.

### Pending before Phase 11

- [x] **Public app name** (ADR 0016): **Parivar Panchang / પરિવાર પંચાંગ** (decided 2026-10-24). Formal trademark search before production: Bhavy.

### Pending family confirmations

Convention defaults that ship as **provisional** until Bhavy confirms with family. Phase 1 may close with these open; Phase 6 may not.

- [ ] **Shraddh window** (provisional: afternoon/aparahna). Ask: "For Ba's varsi, do we go by the tithi at sunrise (printed calendar day) or the one prevailing in the afternoon?" ([ADR 0003](docs/adr/0003-personal-event-observance-window.md))
- [ ] **Vriddhi tithi day** (provisional: first day). Ask: "When the calendar shows a birthday tithi on two days, which day do we celebrate?" ([ADR 0003](docs/adr/0003-personal-event-observance-window.md))
- [ ] **Kshaya tithi day** (provisional: same day). Ask: "If the tithi is skipped in the calendar that year, do we observe it on the day it falls in the calendar, or on the next day?" ([ADR 0010](docs/adr/0010-kshaya-tithi-placement.md))
- [ ] **Aparahna "neither day" rule** (provisional: earlier day). Ask: "If the varsi tithi doesn't touch the afternoon on either day, which day do we do it?" ([ADR 0003](docs/adr/0003-personal-event-observance-window.md))
- [ ] **Pitru Paksha toggle** (provisional: on). Ask: "Do we do Ba's shraddh on her own tithi in Pitru Paksha, or only on Sarva Pitru Amavasya?" ([ADR 0004](docs/adr/0004-pitru-paksha-occurrence.md))
- [ ] **Purnima / Chaturdashi handling** (provisional: Purnima → Bhadrapada Purnima; Chaturdashi → same tithi; override available). Ask: "For someone who passed on Purnima or Chaturdashi, which Pitru Paksha day do we use?" ([ADR 0004](docs/adr/0004-pitru-paksha-occurrence.md))
- [ ] **Death-tithi source** (provisional: moment of death when a time is known). Ask: "For Ba's varsi, did we take the tithi from the time she passed, or from the calendar for that date?" ([ADR 0006](docs/adr/0006-entering-events-from-gregorian-date.md))
- [ ] **Adhik-month year** (provisional: `nija`). Ask: "In a year with an extra (adhik) month, do we do the varsi/birthday in the first month, the second, or both? Does it matter if the person was born or passed away in an adhik month?" ([ADR 0009](docs/adr/0009-adhik-month-policy.md))

### Pending source verifications

Rules that need a cited classical or reference source before being marked verified (§0 rule 7).

- [ ] *(v2, not required for Phase 6)* Purnimanta naming around an adhik month (Nija X Krishna → Adhik X → Nija X Shukla): check against the reference's Purnimanta view ([ADR 0002](docs/adr/0002-personal-event-dates-stored-in-amanta.md))
- [ ] Aparahna "neither day" tie-break: classical source ([ADR 0003](docs/adr/0003-personal-event-observance-window.md))
- [ ] Kshaya masa absorption and the 1982–83 adhik months: classical source and reference ([ADR 0008](docs/adr/0008-kshaya-masa-occurrence.md))
- [ ] Uttarayan: Gujarat's civic date (14 Jan) vs the astronomical Makar Sankranti date with the after-sunset rule; check 2025–2027 against references before deciding what to display ([ADR 0018](docs/adr/0018-festival-rules.md))
- [ ] Janmashtami: the Smarta and Vaishnava resolution rules, cited, and checked against references for the fixture years ([ADR 0018](docs/adr/0018-festival-rules.md))
- [ ] Navratri end-day rule: confirm the last day resolves under the same window and tie-break as the first (provisional), against a classical source and references ([ADR 0018](docs/adr/0018-festival-rules.md))
- [ ] New-year day when pratipada is kshaya: the year starts on the first sunrise tithi ≥ Sud 1 ([ADR 0020](docs/adr/0020-month-naming-and-samvat.md))
- [ ] Year start when Chaitra or Kartika is adhik: assumed nija ([ADR 0020](docs/adr/0020-month-naming-and-samvat.md))
- [ ] Drik's label for the 1983 two-sankranti month (engine: Pausha absorbing Magha) ([ADR 0008](docs/adr/0008-kshaya-masa-occurrence.md))
- [ ] Holika Dahan Bhadra-avoidance rule (incl. when Bhadra covers all of pradosh): classical source and reference ([ADR 0018](docs/adr/0018-festival-rules.md))

---

## 14. Commit Message Convention

Conventional Commits. Claude **suggests** the message; Bhavy commits.

```
<type>(<scope>): <summary in imperative, ≤ 72 chars>

<body: what and why, wrapped at 72>

Phase: <n>
```
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`
- Scopes: `engine`, `calendar`, `i18n`, `app`, `android`, `pwa`, `fixtures`, `ci`, `docs`, `repo`

---

## 15. Phases

Each phase ends with a **STOP**: summary, files changed, open questions, suggested commit message.

### Phase 0: Repo foundation and skills (no app code)
**Manual steps (Bhavy, before or during this phase):**
- `git init` in `pocket-panchang/`, create the GitHub repo, add the remote.
- Install Matt Pocock's skills: `npx skills@latest add mattpocock/skills` (interactive; choose Claude Code).
- Inside Claude Code, run `/setup-matt-pocock-skills` (choose local markdown or GitHub issues for tickets).

**Claude does:**
- Create `CLAUDE.md` (short, ≤ 80 lines): project summary, the Working Rules from §0, key commands, pointer to `PROJECT_PLAN.md`.
- Create `.claude/settings.json` with permission **deny** rules for git write operations: `git commit`, `git push`, `git tag`, `git rebase`, `git reset`, `git stash drop`, `git merge`.
- Create project skills in `.claude/skills/`:
  - `panchang-domain/`: glossary, calculation conventions, error budget, pointers to §3–§4.
  - `phase-workflow/`: how to run a phase, the mandatory STOP format, commit message template.
  - `engine-tutor/`: behavior for `[OWN]` phases (explain, propose signatures, write tests, review; don't write core algorithms unless told).
  - `accuracy-fixtures/`: how to add a fixture city/year, record sources, run and read the accuracy report.
  - `ui-standards/`: UX principles from §9, accessibility checklist, design tokens usage.
- Create `.gitignore`, `README.md` stub, `docs/adr/0000-template.md`, `docs/adr/0001-record-architecture-decisions.md`.

**Exit criteria:** skills load in Claude Code (`/` lists them); git write commands are denied; no app code exists.

### Phase 1: Domain grilling → ADRs
- Run `/grill-with-docs` over this plan.
- Resolve all Open Decisions (§13) → one ADR each in `docs/adr/`.
- Produce/align `GLOSSARY.md` (glossary) with §3.
- Update this plan where decisions change it.

**Exit criteria:** every §13 item has an ADR; no unresolved domain question blocks the engine.

### Phase 2: Design lock (no code)
- Define design tokens (color, type scale incl. Gujarati/Devanagari, spacing, radius, motion): ADR 0017, `docs/design/brief.md`.
- Write the design brief (`docs/design/brief.md`) covering all 6 v1 screens.
- Design and approve the **Today** screen (Calm, light) as the visual reference; record it in `docs/design/screens.md`.
- Reduced scope (decided 2026-10-22): the other five screens, dark mode, and the Mandir/Raat palettes are designed in Phase 8.

**Exit criteria:** brief and token ADR complete; Today screen (Calm, light) approved by Bhavy and linked from `docs/design/screens.md`; no code written.

### Phase 3: Monorepo scaffolding
- pnpm workspace; `packages/engine`, `packages/calendar`, `packages/i18n`, `apps/app` (Vite + React + TS).
- Strict tsconfig base; lint/format per ADR 0015 (purity and dependency-direction rules, type-aware async rules, jsx-a11y, react-hooks); Vitest in all packages; path aliases.
- GitHub Actions: install, typecheck, lint, test, build.
- Token check as a Vitest test (`apps/app/src/styles/tokens.test.ts`, runs in CI via `pnpm test`): completeness, layer rule, WCAG AA over every palette × mode, no raw colours outside `tokens.css`. `tokens.css` becomes the single source of truth; the Phase 2 prototype in `docs/design/contrast/` is superseded (ADR 0017).
- Empty app renders "Pocket Panchang" in light/dark.

**Exit criteria:** `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass locally and in CI.

### Phase 4 [OWN]: Engine spike: sunrise + tithi
- Wrap astronomy-engine: Sun/Moon apparent longitudes, sunrise/sunset for a location.
- Crossing finder (§4.3).
- Tithi at an instant + tithi end times for a civil day.
- First fixtures: Ahmedabad, ~1 month. A script prints the comparison.

**Exit criteria:** sunrise within ±1 min and tithi end times within ±2 min of the reference for the fixture month. Bhavy can explain the error budget and the crossing finder.

### Phase 5 [OWN]: Engine complete
- Lahiri ayanamsa (mean, ADR 0019); nakshatra, yoga, karana, vara.
- Vriddhi/kshaya detection; full day assembly (§4.5).
- New moons, sankrantis, lunar month naming, adhik/kshaya masa (Amanta; Purnimanta is v2).
- Vikram Samvat (Kartikadi/Chaitradi) and Shaka.
- Fixtures: all 5 cities, 2 years, ~24 sampled days per city-year (§10). NOAA sunrise cross-check for every day. Property tests. grahan cross-check. Accuracy report (`pnpm --filter @panchang/engine accuracy`).
- Investigate the +62 s tithi-end bias found in Phase 4 (fixture notes): compare the engine's Moon longitude with an independent ephemeris (e.g. JPL Horizons) for a few instants.

**Exit criteria:** all fixtures within tolerance; property tests pass; accuracy report generated in CI.

### Phase 6: Calendar package: muhurta, festivals, personal events

> **Status (2026-10-23): code complete; exit verification pending.** Open items:
> 1. Hand-verify `docs/verification/festivals-ahmedabad.md` (28 rows, 2026–27) against the family's printed panchang and Drik in a browser.
> 2. Hand-verify `docs/verification/festivals-other-cities.md` (17 rows that differ from Ahmedabad; NJ/London against temple calendars).
> 3. Confirm the 8 §13 "Pending family confirmations" (use `pnpm --filter @panchang/calendar family-history` with `fixtures/private/family-history.json`).
> 4. Cite the v1 §13 "Pending source verifications" (incl. Holika Dahan Bhadra rule, Navratri end-day rule, Janmashtami Smarta/Vaishnava, Uttarayan civic date, kshaya-pratipada new year, adhik Chaitra/Kartika year start).
> Then fill the festival rules' `verified` fields (ADR 0021).
- Rahu Kaal, Yamaganda, Gulika, Choghadiya.
- Festival rule schema + resolver (§4.7, ADR 0018); the 13 v1 festivals (§2) with `verified` filled; Bhadra muhurta.
- Personal event occurrence computation with policies (§4.9) for the next N years.
- `.ics` generation.
- Family history check script: prints computed occurrences for family-provided past events (last 2–3 years) next to the dates actually observed; used to settle §13 "Pending family confirmations". Input lives in a gitignored path (ADR 0013).

**Exit criteria:** (1) **Ahmedabad 2026–27:** all 13 festivals verified by hand against the family's printed panchang and Drik in a browser (`docs/verification/festivals-ahmedabad.md`, generated by `pnpm --filter @panchang/calendar festival-checklist`); (2) **other cities:** every festival date that differs from Ahmedabad's is verified by hand (`docs/verification/festivals-other-cities.md`; NJ/London against temple calendars); (3) rules' `verified` fields filled only after (1)–(2) (ADR 0021); occurrence tests cover adhik and kshaya cases; every item in §13 "Pending family confirmations" is confirmed (provisional defaults kept or changed, ADRs updated) and every v1 "Pending source verification" is cited.

### Phase 7: App shell

> **Status (2026-10-23): code complete;** exit criteria covered by `apps/app/src/onboarding.test.tsx` (jsdom, worker API in-process). A manual browser check of the real Comlink worker is pending.
- Worker + Comlink API; TanStack Query integration; Dexie schema v1; Zustand settings.
- Platform ports with web adapters.
- Onboarding flow (2 steps); offline city search (GeoNames subset decided here, see §8, with attribution).
- Cold-start strategy (§7).

**Exit criteria:** onboarding completes; settings persist across reloads; the worker computes today offline.

### Phase 8: Core screens
> **Status (2026-10-24): complete.** All v1 screens designed in code and approved (Bhavy waived manual review on 2026-10-23; self-checked at 390 px in all six themes and at 200% text). Moonrise/moonset (ADR 0022) and Holika Dahan's evening time added.
> **2026-10-23:** no separate design tool. Screens are designed in code from the brief, ADR 0017 tokens, and the approved Today screen, and approved from the dev build (`docs/design/screens.md`). Today, Month, and Day detail come first; Onboarding, Personal events, and Settings designs follow.
- **Design first:** design the remaining screens (Onboarding, Month, Day detail, Personal events, Settings), dark mode, and the Mandir/Raat palettes from `docs/design/brief.md`, ADR 0017 tokens, and the approved Today screen; get each approved and recorded in `docs/design/screens.md` before implementing it. (Personal events and Settings designs are implemented in Phase 9.)
- Today, Month, Day detail per the approved designs.
- Muhurta timeline with "now"; vriddhi/kshaya and festival markers.
- Responsive mobile/desktop; light/dark.

**Exit criteria:** all v1 screen designs (both modes, all three palettes) approved in `docs/design/screens.md`; implemented screens match them; navigation works offline; no main-thread jank on month change.

### Phase 9: Personal events and reminders
> **Status (2026-10-24): code complete.** Events CRUD with policy cascade + Advanced, date helper (confirm step, ±1 h warning, pre-1955 India local-time warning), Family conventions, .ics, JSON backup v1, backup nudge, family-preview build (`pnpm --filter @panchang/app build:preview` → `dist/` with `vercel.json`: `X-Robots-Tag: noindex`, SPA rewrites; persistent "save a backup before moving" banner). **Pending:** the preview deploy itself (`npx vercel deploy apps/app/dist --prod --name panchang-family-preview`, run by Bhavy: the deploy needs a local Vercel login) and the manual Google Calendar import check.
- Events CRUD with policy options; upcoming list.
- `.ics` export; JSON backup export/import with schema versioning.
- Backup nudges.

- Private family preview (ADR 0013): unlisted Vercel URL, `X-Robots-Tag: noindex`, "Report a mismatch" enabled, banner prompting export before switching to the public domain.

**Exit criteria:** create → see upcoming occurrences → export `.ics` → import into Google Calendar works; backup round-trip is lossless; family preview is live.

### Phase 10: PWA, i18n, accessibility, performance
> **Status (2026-10-24): complete.** vite-plugin-pwa (prompt-to-update, full precache incl. city list, install card in Settings and on Today from the 2nd visit, iOS "Add to Home Screen" hint); Chrome reports no installability errors (Lighthouse 12 dropped its PWA category, so `Page.getInstallabilityErrors` is the check). All UI strings in typed catalogues (`packages/i18n/src/messages/{en,gu}.ts`, only the active one loaded); Gujarati UI uses Gujarati digits and Intl's time-of-day words (provisional, brief §9 Q4/Q5); `<html lang>` follows the language. Noto Sans Gujarati/Devanagari self-hosted as script subsets (woff2, 400/600, `unicode-range`); not subset to used glyphs because family-date names are user-typed. Playwright E2E (18 tests) incl. axe WCAG 2.2 AA on every route × 3 palettes × light/dark and Gujarati, keyboard focus, offline, real-worker smoke, budgets. Gujarati review checklist: `docs/i18n/gu-review.md` (431 strings + 7 questions, all drafts).
- vite-plugin-pwa; full offline; install prompt.
- Gujarati + English complete; font subsetting.
- Accessibility audit (keyboard, screen reader, contrast, text scaling).
- Measure the performance budgets (§7); fix regressions.
- Playwright E2E suite.

**Exit criteria:** Lighthouse PWA installable; budgets met or documented; E2E green.

### Phase 11: Android (Capacitor)
> **Status (2026-10-24): code complete; S24 test pending.** Capacitor 8 (`apps/app/android`, `in.bhavyladani.panchang`, label still the working name); ReminderPort/SharePort adapters (GeoPort is v2); rolling exact reminders per [ADR 0023](docs/adr/0023-android-reminders.md) with the ADR 0007 time-zone rule and `Settings.reminderTime`; notifications health screen (`/settings/notifications`); back button; adaptive/monochrome icon, notification icon and Android 12 splash from the placeholder icon; WebView text zoom off with the system font scale applied as rem (keeps the approved ~115% label caps). `pnpm --filter @panchang/app android:debug` builds the APK. Verified on an Android 16 emulator (4 GB): reminders fire screen-off in forced Doze; offline; back button; 200% system font. Public name still pending (§13) before the Play listing.
- Capacitor setup; package id `in.bhavyladani.panchang` (ADR 0016); public name from §13 "Pending before Phase 11"; icons/splash.
- Capacitor adapters for ReminderPort/GeoPort/SharePort.
- Rolling notification scheduling; notifications health screen.
- Test on Bhavy's Samsung S24 Ultra and at least one budget device/emulator.

**Exit criteria:** reminders fire reliably on device; offline works; APK/AAB builds.

### Phase 12: Release
> **Status (2026-10-24): release-ready, launch steps with Bhavy.** Public name applied (ADR 0016); pre-sunrise "Panchang day" line on Today; `/how` and `/privacy` pages (public, bilingual); README with screenshots, architecture and the CI accuracy report; Vercel project `panchang` (Git-connected, root `apps/app`) with the domain added; signed-AAB pipeline reading the upload key from `~/.gradle/gradle.properties`; Play listing kit, data safety, exact-alarm declaration and screenshots in `docs/release/`. Festivals stay hidden until `docs/release/festival-gate.md` is complete. **Pending (Bhavy):** DNS CNAME, push to `main`, upload key + first AAB to closed testing, Play Console forms, trademark search.
- README with screenshots, architecture overview, and the **measured accuracy report**.
- "How this is calculated" page; privacy policy page.
- Deploy web to `panchang.bhavyladani.in`.
- Play Store listing; data safety form ("no data collected"); closed testing → production.

**Exit criteria:** live on the web and the Play Store (testing track at minimum).

---

## 16. Interview Story Checklist (fill in as you go)
- [ ] Error budget: why ±1′ astronomy is enough (and measured accuracy)
- [ ] Crossing finder and the 360° wraparound bug
- [ ] Why the ayanamsa cancels for tithi but not for yoga
- [ ] Data-driven festival rules and tie-break resolution
- [ ] Modeling adhik/kshaya policies for personal events
- [ ] Worker + TanStack Query as a cache over computation
- [ ] Cache invalidation via `engineVersion`
- [ ] Ports/adapters for web vs Android; `.ics` as the cross-platform reminder fix
- [ ] Android notification reliability problems and how they were handled
- [ ] Hardest bug found (write it down when it happens)

---

## 17. References
- astronomy-engine: https://github.com/cosinekitty/astronomy (MIT)
- grahan (test cross-check only): MIT TypeScript panchang library
- Matt Pocock skills: https://github.com/mattpocock/skills
- GeoNames: https://www.geonames.org (CC-BY 4.0)
- Reference panchang for fixtures: Drik Panchang (record retrieval dates per fixture)
- Classical festival rules: Nirnaya Sindhu, Dharma Sindhu (via secondary sources; cite in ADRs)
