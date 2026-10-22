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

### v1 (target: ~5–6 weeks part-time)
- Daily panchang for a chosen city: tithi, nakshatra, yoga, karana, vara, with end times; sunrise, sunset, moonrise, moonset.
- Lunar month, paksha, Vikram Samvat (Kartikadi) and Shaka year; adhik month display.
- Muhurta: Rahu Kaal, Yamaganda, Gulika, day and night Choghadiya, with a "now" indicator.
- Month calendar grid showing the tithi per day, including vriddhi/kshaya markers.
- ~25 **verified** major festivals.
- Personal tithi events: create, edit, delete; upcoming occurrences list.
- Reminders: Android local notifications; `.ics` calendar export (web and Android).
- Languages: Gujarati and English.
- PWA (offline web) and Android app (Capacitor).
- JSON backup export/import.

### v2
- Sky dial visualization (Sun/Moon/elongation/phase).
- More festivals including Ekadashi (complex rules) and Sankranti list.
- Hindi language.
- Android home-screen widget (native Kotlin).
- Purnimanta-region festival naming polish; more regional calendars.

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

### 4.2 Error budget (be able to explain this)
- The Moon gains ~12°/day on the Sun (varies ~10.8–14.5°/day).
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
- Default proposal: upper limb of the Sun touching the horizon, with standard atmospheric refraction.
- **Must be confirmed** in Phase 1 (ADR) and validated against the reference for each fixture city.
- Polar cases (no sunrise/sunset) must not crash; return explicit states.

### 4.5 Day assembly
- Civil Hindu day = sunrise(D) → sunrise(D+1) at the selected location.
- The day's tithi = the tithi active at sunrise(D). Also list every tithi ending within the day, with end times.
- Same pattern for nakshatra, yoga, karana.
- Detect vriddhi and kshaya.

### 4.6 Months and years
- Lunar month = new moon → next new moon (Amanta). Purnimanta derived by a half-month shift of naming.
- Month name = determined by the sidereal solar rashi (sankranti logic).
- Adhik: no sankranti between consecutive new moons. Kshaya: two sankrantis (rare; must still be handled).
- Vikram Samvat (Kartikadi): increments at Kartik Shukla Pratipada. Chaitradi variant supported via settings.
- Shaka Samvat: increments at Chaitra Shukla Pratipada.

### 4.7 Festival resolver (data-driven)
Festivals are **data**, not code:

```ts
type FestivalRule = {
  id: string;                         // "janmashtami"
  names: Record<Lang, string>;
  month: LunarMonth;                  // in the Amanta frame internally
  paksha: "shukla" | "krishna";
  tithi: number;
  window: "sunrise" | "madhyahna" | "aparahna" | "pradosh" | "nishita";
  tieBreak: "purva-vyapini" | "para-vyapini" | "max-coverage";
  extra?: { nakshatra?: Nakshatra };  // e.g., Rohini for Janmashtami
  adhikPolicy: "nija-only";           // festivals not observed in adhik month by default
  verified: { against: string; years: number[] };  // must be filled before shipping
};
```
- Resolver: for each candidate day, compute the tithi coverage of the window → apply the tie-break.
- A festival ships only when `verified` is filled with reference years.

### 4.8 Muhurta
- Rahu Kaal / Yamaganda / Gulika: daylight / 8, weekday-indexed segment tables.
- Choghadiya: day and night / 8 each, weekday-dependent starting sequence.

### 4.9 Personal tithi events: occurrence rules
```ts
type OccurrencePolicy = {
  adhikMonth: "nija" | "adhik";            // which month counts in an adhik year
  kshayaTithi: "previous-day" | "next-day"; // where to place an event whose tithi is kshaya
};
```
- Defaults are decided in Phase 1 (see Open Decisions). Defaults are user-overridable per event.

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
5. Dependency direction: `app → calendar → engine`. Never the reverse.

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
| Routing | TanStack Router or React Router (decide in Phase 1) | Type-safe routes |
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
| Lint/format | ESLint + Prettier (or Biome; decide in Phase 3) | Consistency |
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
- **Web:** no reliable scheduled notifications → in-app upcoming list + **`.ics` export** (next 10 years of each personal event). `.ics` export is offered on Android too.

---

## 6. Data Model

```ts
type Lang = "gu" | "en" | "hi";

type Location = { id: string; name: string; lat: number; lng: number; tz: string; country: string };

type Settings = {
  location: Location;
  tradition: "amanta" | "purnimanta";
  samvat: "vikram-kartikadi" | "vikram-chaitradi" | "shaka";
  language: Lang;
  theme: "system" | "light" | "dark";
  textScale: number;               // respects OS scale; extra multiplier
};

type PersonalEvent = {
  id: string;
  title: string;                   // "Ba's varsi", "Dad's janma tithi"
  kind: "birthday" | "shraddh" | "anniversary" | "custom";
  lunarDate: { month: LunarMonth; paksha: "shukla" | "krishna"; tithi: number };
  policy: OccurrencePolicy;        // §4.9
  remindDaysBefore: number[];      // e.g., [0, 1]
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

type CachedMonth = {
  key: string;                     // `${engineVersion}|${locationId}|${tradition}|${yyyy-mm}`
  days: PanchangDay[];
  computedAt: number;
};
```

### Persistence (Dexie, versioned)
- Tables: `settings`, `events`, `monthCache`.
- Every schema change = a new Dexie version with a migration. Never mutate a schema in place.
- Backup format: versioned JSON `{ schemaVersion, exportedAt, settings, events }`. The cache is never exported.

---

## 7. Caching and Performance

- **Cache key:** `engineVersion | locationId | tradition | yyyy-mm`. Bump `engineVersion` on any calculation fix → automatic invalidation.
- **Key by city, not raw GPS.** Sunrise shifts ~4 min per degree of longitude; raw coordinates destroy the cache hit rate. GPS (if used) snaps to the nearest city.
- **Cold start:** read today's cached result from IndexedDB → render immediately → recompute in the worker → reconcile only if different. No spinners; skeletons only on true first run.
- **Prefetch:** today + current month first, then adjacent months during idle time.
- **Budgets (initial proposals, measured in Phase 10):**
  - Initial JS (gzip): ≤ 150 KB excluding fonts
  - Today view visible: < 1 s on a mid-range Android, warm start
  - Month computation: < 300 ms in the worker
- **Lazy-load:** city database, non-active locales, the worker bundle.
- **Fonts:** self-host Noto Sans Gujarati / Devanagari, subset to used glyphs.

---

## 8. Offline Location Data
- Source: GeoNames cities subset (**CC-BY 4.0: attribution required** in the About screen).
- Scope v1: Indian cities + major diaspora cities (US, UK, Canada, Australia, UAE, etc.).
- Each entry: id, name, lat, lng, IANA tz, country. Compressed JSON, lazy-loaded, searched locally.

---

## 9. UX Principles

1. **Glanceable home:** one line answers why the user opened the app:
   *"Kartik Sud 2 · Choghadiya: Amrut until 10:42 · Rahu Kaal 1:30–3:00"*
2. **Elderly-friendly by default:** large base type, respects OS font scaling, ≥ 48 dp tap targets, WCAG AA contrast, no meaning conveyed by color alone.
3. **Onboarding in 3 steps:** city → tradition ("Gujarati family? choose this") → language. No jargon like "ayanamsa" in onboarding.
4. **Responsive:** single column on mobile; month grid + day detail side by side on desktop.
5. **Trust surfaces:** a "How this is calculated" page; a "Report a mismatch" button that opens a pre-filled email/GitHub issue with date, city, settings, and engine version.
6. **Durability nudges:** prompt for a backup after 3+ personal events; one-tap export/import.
7. **Motion with purpose:** transitions explain state changes, never decorate. Respect `prefers-reduced-motion`.
8. **Dark mode** that is genuinely designed, not inverted.

### v1 screens
1. Onboarding (3 steps)
2. Today (glance line, panchang elements with end times, muhurta timeline with "now")
3. Month (grid with tithi per day, festival markers, vriddhi/kshaya markers)
4. Day detail (full panchang for a selected date)
5. Personal events (list, upcoming, create/edit with policy options)
6. Settings (location, tradition, samvat, language, theme, text size, backup, notifications health, about/attribution)

---

## 10. Testing and Accuracy Strategy

1. **Golden fixtures:** reference values per city per year in `fixtures/` (tithi/nakshatra/yoga/karana end times, sunrise/sunset, festival dates).
   - Cities: Ahmedabad, Delhi, Chennai, New York, London.
   - Years: at least 2 full years in v1.
   - Each fixture file records its source and retrieval date.
2. **Invariant/property tests (fast-check):**
   - Exactly 30 tithis per lunation
   - Elongation monotonic between new moons
   - Nakshatras cycle in order; karana sequence correct
   - Vriddhi and kshaya counts consistent over a lunation
   - End times strictly increasing within a day
3. **Cross-check:** compare against grahan in tests; flag disagreements beyond tolerance.
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
| Users compare with the family pandit's printed panchang | Let users choose tradition; "How this is calculated" page |
| Android notification reliability (Samsung/Xiaomi battery optimization) | Notifications health screen; `.ics` export as fallback |
| Scope creep toward a Drik clone | Non-goals in §1.5; v1/v2 split |
| Losing data on phone loss | Backup nudges; Android Auto Backup; export/import |
| AI writes the engine and Bhavy can't explain it | `[OWN]` phases (§0 rule 4) |

---

## 13. Open Decisions (resolve in Phase 1 → ADRs)

1. **Personal events in adhik-month years:** default `nija` or `adhik`? (Proposal: `nija`; confirm with family convention.)
2. **Kshaya-tithi placement default** for personal events: previous day or next day?
3. **Location model:** city picker only, or GPS that snaps to the nearest city? (Proposal: both; GPS optional, snapped.)
4. **v1 platform priority:** develop web-first, release web + Android together? (Proposal: yes.)
5. **Sunrise definition:** upper limb + refraction? Validate against the reference.
6. **Router:** TanStack Router vs React Router.
7. **Lint/format:** ESLint + Prettier vs Biome.
8. **App name check:** confirm "Pocket Panchang" is free on the Play Store; package id proposal `in.bhavyladani.pocketpanchang`.

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
- Define design tokens (color, type scale incl. Gujarati/Devanagari, spacing, radius, motion).
- Design the 6 v1 screens (§9) for mobile and desktop, light and dark.
- Store outputs/specs in `docs/design/`.
- Optional: show screens to 3–5 target users (family) and record feedback.

**Exit criteria:** screens and tokens approved by Bhavy; no code written.

### Phase 3: Monorepo scaffolding
- pnpm workspace; `packages/engine`, `packages/calendar`, `packages/i18n`, `apps/app` (Vite + React + TS).
- Strict tsconfig base; lint/format; Vitest in all packages; path aliases.
- GitHub Actions: install, typecheck, lint, test, build.
- Empty app renders "Pocket Panchang" in light/dark.

**Exit criteria:** `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass locally and in CI.

### Phase 4 [OWN]: Engine spike: sunrise + tithi
- Wrap astronomy-engine: Sun/Moon apparent longitudes, sunrise/sunset for a location.
- Crossing finder (§4.3).
- Tithi at an instant + tithi end times for a civil day.
- First fixtures: Ahmedabad, ~1 month. A script prints the comparison.

**Exit criteria:** sunrise within ±1 min and tithi end times within ±2 min of the reference for the fixture month. Bhavy can explain the error budget and the crossing finder.

### Phase 5 [OWN]: Engine complete
- Lahiri ayanamsa; nakshatra, yoga, karana, vara.
- Vriddhi/kshaya detection; full day assembly (§4.5).
- New moons, sankrantis, lunar month naming, adhik/kshaya masa, Amanta/Purnimanta.
- Vikram Samvat (Kartikadi/Chaitradi) and Shaka.
- Fixtures: all 5 cities, 2 years. Property tests. grahan cross-check. Accuracy report script.

**Exit criteria:** all fixtures within tolerance; property tests pass; accuracy report generated in CI.

### Phase 6: Calendar package: muhurta, festivals, personal events
- Rahu Kaal, Yamaganda, Gulika, Choghadiya.
- Festival rule schema + resolver (§4.7); ~25 festivals with `verified` filled.
- Personal event occurrence computation with policies (§4.9) for the next N years.
- `.ics` generation.

**Exit criteria:** festival dates match the reference for all fixture cities/years; occurrence tests cover adhik and kshaya cases.

### Phase 7: App shell
- Worker + Comlink API; TanStack Query integration; Dexie schema v1; Zustand settings.
- Platform ports with web adapters.
- Onboarding flow (3 steps); offline city search (GeoNames subset with attribution).
- Cold-start strategy (§7).

**Exit criteria:** onboarding completes; settings persist across reloads; the worker computes today offline.

### Phase 8: Core screens
- Today, Month, Day detail per the locked designs.
- Muhurta timeline with "now"; vriddhi/kshaya and festival markers.
- Responsive mobile/desktop; light/dark.

**Exit criteria:** screens match the designs; navigation works offline; no main-thread jank on month change.

### Phase 9: Personal events and reminders
- Events CRUD with policy options; upcoming list.
- `.ics` export; JSON backup export/import with schema versioning.
- Backup nudges.

**Exit criteria:** create → see upcoming occurrences → export `.ics` → import into Google Calendar works; backup round-trip is lossless.

### Phase 10: PWA, i18n, accessibility, performance
- vite-plugin-pwa; full offline; install prompt.
- Gujarati + English complete; font subsetting.
- Accessibility audit (keyboard, screen reader, contrast, text scaling).
- Measure the performance budgets (§7); fix regressions.
- Playwright E2E suite.

**Exit criteria:** Lighthouse PWA installable; budgets met or documented; E2E green.

### Phase 11: Android (Capacitor)
- Capacitor setup; package id; icons/splash.
- Capacitor adapters for ReminderPort/GeoPort/SharePort.
- Rolling notification scheduling; notifications health screen.
- Test on Bhavy's Samsung S24 Ultra and at least one budget device/emulator.

**Exit criteria:** reminders fire reliably on device; offline works; APK/AAB builds.

### Phase 12: Release
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
