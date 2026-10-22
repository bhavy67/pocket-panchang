# Design brief: Pocket Panchang (working name)

> Self-contained brief for visual design. Phase 2 output; source of truth for scope remains `PROJECT_PLAN.md`.
> Status: **draft for design exploration**. Screens and tokens are locked only after Bhavy approves them.
> Working name only: "Pocket Panchang" is taken on the app stores; the public name is still open (§9 below).

---

## 1. Product

**One-liner.** A beautiful, private, offline Hindu panchang (Hindu lunar-solar almanac) that is Gujarati-first and diaspora-aware, built around **personal tithi reminders**: family birthdays, *varsi* (yearly death-anniversary rites, shraddh), and anniversaries that follow the lunar calendar.

**The problem it solves.** Many Gujarati families mark birthdays and a relative's yearly varsi by the **lunar date** (e.g., "Kartak Vad 5"), not the Gregorian date. That lunar date lands on a different Gregorian day every year, and finding it means leafing through a printed panchang. Existing apps are dense, ad-heavy, and not built around a family's own dates.

**Who it's for.**
- **Primary:** Gujarati households in India, **including older users on budget Android phones**: large text, steady hands not guaranteed, may read Gujarati more comfortably than English, may use OS font scaling at 150–200%.
- **Secondary:** Gujarati and Hindu families abroad (US, UK, Canada, Australia, UAE), whose dates depend on local sunrise and daylight-saving time, and who often observe a relative's varsi "on India's date".
- **Tertiary:** anyone who wants a clean daily panchang.

**Differentiators (what the design must make obvious).**
1. **Personal tithi reminders** are first-class, not buried.
2. **Calm, glanceable design:** today's answer in one line; details on tap.
3. **Explainability:** "How this is calculated" is always one tap away; no unexplained numbers.
4. **Gujarati-first defaults**, with English.
5. **Private by design:** no account, no server, no analytics, no ads. Nothing to sign in to.
6. **Measured accuracy:** the app publishes how accurate it is.

**v1 scope notes:** Gujarati-style months only (month ends on Amas; the North Indian "ends on Punam" style comes in v2). Location by city search only (no GPS in v1). 13 festivals (§2).

**Not in scope (never design for these):** horoscopes, kundali, predictions, astrology readings, accounts, ads, social features.

---

## 2. Example data (real values)

Use this real day for mockups. Source: Drik Panchang, Ahmedabad, retrieved 2026-10-22.

**Ahmedabad (અમદાવાદ), Thursday 22 October 2026**

| Item | Value |
|---|---|
| Weekday | Thursday (ગુરુવાર, Guruvar) |
| Lunar date (Gujarati) | **Aaso Sud 11** (આસો સુદ ૧૧, *Agiyaras*) until 2:47 PM, then Aaso Sud 12 |
| Lunar date (canonical) | Ashvin Shukla Ekadashi → Dvadashi |
| Year | Vikram Samvat 2082 (Gujarati count; the new year starts the day after Diwali. Drik shows 2083, the Chaitra-start count) |
| Sunrise / Sunset | 6:39 AM / 6:09 PM |
| Moonrise / Moonset | 3:41 PM / 3:38 AM (Fri) |
| Nakshatra | Shatabhisha until 8:49 PM, then Purva Bhadrapada |
| Yoga | Vriddhi until 11:40 PM *(a yoga name; unrelated to a "two-day tithi")* |
| Karana | Vishti until 2:47 PM, then next karana *(placeholder)* |
| Bhadra | Until 2:47 PM (Vishti karana; start time *placeholder*) |
| Rahu Kaal | 1:50 PM – 3:16 PM |
| Yamaganda, Gulika | *(placeholder times; the app computes them)* |

**Day Choghadiya** (8 periods, sunrise→sunset):

| Period | Time | Quality |
|---|---|---|
| Shubh | 6:39 – 8:06 AM | Good |
| Rog | 8:06 – 9:32 AM | Bad |
| Udveg | 9:32 – 10:58 AM | Bad |
| Char | 10:58 AM – 12:24 PM | Neutral |
| Labh | 12:24 – 1:50 PM | Good |
| Amrut | 1:50 – 3:16 PM | Best |
| Kaal | 3:16 – 4:42 PM | Bad |
| Shubh | 4:42 – 6:09 PM | Good |

**Night Choghadiya** (sunset→next sunrise): Amrut 6:09–7:42 PM · Char 7:42–9:16 PM · Rog 9:16–10:50 PM · Kaal 10:50 PM–12:24 AM · Labh 12:24–1:58 AM · Udveg 1:58–3:32 AM · Shubh 3:32–5:06 AM · Amrut 5:06–6:40 AM.

**Use "now" = 2:10 PM** in mockups. It is a good stress case: an auspicious Choghadiya (Amrut) overlaps an inauspicious period (Rahu Kaal), and the tithi changes later the same day.

**Sample personal events** (illustrative: names and dates are made up; the app computes real dates):
- "Ba's varsi": Kartak Vad 5 · Thu 5 Nov *(sample date)* · reminder 1 day before
- "Dad's janma tithi" (birthday by tithi): Magshar Sud 2 · *(sample date)*
- "Mummy-Pappa's anniversary": Maha Sud 5 · *(sample date)*
- An NRI case: "Nana's varsi" observed by Ahmedabad's date while the phone is in New Jersey → label "Nana's varsi · Thu 5 Nov (Ahmedabad)"

**Festivals (v1, 13):** Dhanteras, Kali Chaudas, Diwali, Bestu Varas (Gujarati New Year), Bhai Bij, Navratri, Dussehra, Janmashtami, Raksha Bandhan, Holika Dahan, Dhuleti, Maha Shivaratri, Uttarayan. Dates in mockups are **illustrative**; do not treat any festival date in mockups as verified.

Festival display cases the design must handle:
- **Diwali sequence:** five festivals on five consecutive days; the month grid must show five markers in a row legibly.
- **Navratri is a span** of 8, 9, or 10 days (varies by year): show it as a band across the grid cells, not a marker on one day. Day 1 and the last day are labelled.
- **Holika Dahan** (evening) followed by **Dhuleti** (next day): two adjacent markers; Holika Dahan shows its evening time.
- **Raksha Bandhan** shows a timing line, e.g. "Rakhi: after 1:42 PM (after Bhadra)" *(illustrative time)*.
- **Janmashtami** usually shows once. When the two traditions differ, two adjacent days each carry a labelled marker: "Janmashtami (Smarta)" and "Janmashtami (Vaishnava)". No setting to choose.
- **Uttarayan** (14 January in Gujarat): display rule pending verification; design a single marker.

Gujarati UI copy in this brief is a **draft** and needs review by a native Gujarati reader.

---

## 3. Screens (v1)

Six screens plus two small trust pages. Every screen must work at 360 px wide with 200% text.

### 3.1 Onboarding (2 steps, skippable to defaults)
1. **City:** search field ("Search your city"), results like "Ahmedabad, Gujarat, India". Search must handle small towns well (e.g., "Nadiad", "Unjha"). No GPS button in v1.
2. **Language:** ગુજરાતી / English (each written in its own script).

*(v2 adds a tradition step: "Month ends on Amas" vs "Month ends on Punam".)*

No jargon anywhere (no "ayanamsa", "Amanta", "udaya"). Progress dots; back always available.

### 3.2 Today (home): **approved**, see `docs/design/screens.md`
- Header: time, city (tap to change), "Thu 22 Oct · ગુરુવાર", and a **Help** button (text label, not a bare "?").
- **Glance card** (largest text on screen): tithi with Gujarati, current Choghadiya with quality, a **"Many avoid now"** box listing every avoid period in effect ("Families often wait to start new or auspicious work."), a calm sentence when a good Choghadiya overlaps one, and **"Next good time"**: the next good Choghadiya that does not overlap Rahu Kaal or Bhadra (at 2:10 PM: Shubh 4:42–6:09 PM). Screen readers get a one-line summary, e.g.:
  **"Aaso Sud 11 · Choghadiya: Amrut until 3:16 PM · Rahu Kaal 1:50–3:16 PM"**
  Gujarati: "આસો સુદ ૧૧ · ચોઘડિયું: અમૃત ૩:૧૬ સુધી · રાહુ કાળ ૧:૫૦–૩:૧૬" *(draft)*
- **Muhurta timeline ("Today, hour by hour"):** **vertical**, sunrise at the top to sunset at the bottom, in two columns: the 8 Choghadiya, and a **"Times many avoid"** lane with Rahu Kaal, Yamaganda, Gulika, and **Bhadra** when it falls in the day; a **"Now" line** crosses both columns. Tapping a block opens a detail sheet. In the example, Bhadra runs until 2:47 PM, so at 2:10 PM three things overlap: Amrut (good), Rahu Kaal (bad), Bhadra (bad).
- **Proportional time axis (all timelines):** the axis is linear in clock time. Periods that don't align with Choghadiya boundaries (Bhadra, tithi and nakshatra changes, Rahu Kaal on days it doesn't match a Choghadiya block) are positioned and sized by their **actual start and end times**, never snapped to Choghadiya tiles. In the example, the tithi change at 2:47 PM and the end of Bhadra at 2:47 PM sit inside the Amrut block (1:50–3:16 PM), not on a tile edge. Overlapping periods stack in separate lanes so none hides another. Each block carries its name and a quality label and shape (good = circle + tick, not good = diamond + bar, neutral = outlined circle), not just colour. Lane labels stop growing at about 115% text size (wrapping only between words); details stay reachable through the sheet and the glance card. Night Choghadiya follows below.
- **"Today's panchang":** five elements with end times, marked "Changes today" where they change: Tithi (Sud 11 until 2:47 PM, then Sud 12), Nakshatra, Yoga, Karana, Weekday.
- **Sun and Moon:** sunrise, sunset, moonrise, moonset.
- **Coming up:** next 1–2 family dates and festivals, each with "in N days" (e.g., "Ba's varsi · Kartak Vad 5 · Thu 5 Nov · in 14 days"; "Dhanteras · Fri 6 Nov · in 15 days"; dates illustrative).
- **Year line:** "Vikram Samvat 2082".
- Section order: header → glance card → Today's panchang → Today, hour by hour → Sun and Moon → Coming up → Vikram Samvat → "How this is calculated" → bottom navigation (Today · Month · Events · Settings).

### 3.3 Month
- Gregorian month grid (October 2026), header also shows the lunar months it spans ("Bhadarvo – Aaso").
- Each day cell: Gregorian date (large), **tithi** short label ("Sud 11" / "સુદ ૧૧"), and markers:
  - festival (icon + short name on wider screens); multi-day festivals as a band (Navratri)
  - personal event (distinct icon)
  - **two-day tithi** (same tithi on two days) and **skipped tithi** (a tithi with no day of its own): icon plus text in day detail, never colour only
  - **today** highlighted; selected day clearly indicated
- An **extra lunar month** (adhik) shows a one-line banner explaining it in plain words.
- Swipe and buttons both change month (no swipe-only).

### 3.4 Day detail
Full panchang for a selected date: all tithi/nakshatra/yoga/karana transitions with times, sun and moon times, full day and night Choghadiya, Rahu Kaal / Yamaganda / Gulika, festivals, personal events falling that day. Actions: "Report a mismatch" (pre-fills date, city, settings, app/engine version), "How this is calculated".
On desktop this sits beside the month grid (see §5).

### 3.5 Personal events
- **List:** upcoming occurrences sorted by date. Each row: title, lunar date ("Kartak Vad 5"), next Gregorian date, days until, kind icon; observance city named when it differs from the phone's city.
- When two occurrences of the same event land on one day (a varsi and its Pitru Paksha shraddh), show **one row with both labels**.
- **Backup nudge** after the 3rd event: "Save a backup of your family dates" with one-tap export.
- **Create / edit form** (plain labels only):
  - Name; Kind: Birthday (by tithi) · Varsi / Shraddh · Anniversary · Other
  - "I know the tithi" / "I know the date" toggle
    - *Tithi:* month (with an "Extra month (adhik)" option), Sud / Vad, tithi number/name
    - *Date:* date, optional time, place where it happened → **confirm screen** showing the computed tithi ("This works out to Kartak Vad 5. Is that right?"). If the moment is within ~1 hour of a tithi change: warning "Close to a tithi change. Please check with a printed calendar."
  - Reminders: "On the day", "1 day before" (multi-select)
  - Varsi only: toggle "Also remind me during Pitru Paksha (Shraddh fortnight)" + day choice ("Same tithi" default; any other Pitru Paksha day)
  - Notes
  - **Advanced** (collapsed by default; see §4)

### 3.6 Settings
- **City** (viewing city), **Year style** (Vikram Samvat Gujarati / Chaitra-start / Shaka), **Language**, **Text size**
- **Appearance:** palette (Calm · Mandir · Raat, each shown as a small live preview) and, separately, mode (System · Light · Dark)
- **Family conventions** (see §4)
- **Backup:** export / import, last backup date
- **Notifications health** (Android): permission and battery-optimisation status with fix-it steps
- **About:** "How this is calculated", privacy statement, city data attribution ("GeoNames, CC-BY 4.0"), version + engine version, "Report a mismatch"

### 3.7 Trust pages (small)
- **How this is calculated:** plain-language explanation (sunrise definition, tithi from Sun–Moon angle, reference data, measured accuracy).
- **Privacy:** "Everything stays on your phone."

---

## 4. Personal-event conventions (v1 UI scope)

Families differ in how they place a varsi or birthday when the calendar is ambiguous. v1 handles this with **household defaults set once**, plus **per-event overrides hidden under Advanced**.

**Settings → Family conventions** (per event kind: Birthday, Varsi/Shraddh, Anniversary, Other) and **Observance city** (whose sunrise decides family dates; set at onboarding).

**Event form → Advanced** (collapsed): each option shows the inherited value and where it comes from, e.g. *"Family default: Traditional shraddh timing (afternoon)"*, with a "Use family default" reset.

Plain labels (technical term only in help text):

| Option | Choices shown to users | Help-text term |
|---|---|---|
| Which part of the day counts | "Follow printed calendar day" · "Traditional shraddh timing (afternoon)" | udaya / aparahna |
| Tithi spans two days | "First day" · "Second day" | vriddhi |
| Tithi is skipped that year | "The day the tithi falls in the calendar" · "The next day" | kshaya |
| Year with an extra month | "Regular month" · "Extra month" · "Match the original month" · "Both" | adhik / nija |
| Pitru Paksha | "Also remind me during Pitru Paksha (Shraddh fortnight)" | Mahalaya |
| Date entry | "Tithi at the time of birth/passing" · "Tithi shown on the calendar for that date" | |
| Observance city | "Use sunrise in: Ahmedabad" | |

Changing a family default shows how many events it affects before applying ("This changes the dates of 3 events").

---

## 5. Layout and responsiveness

| Width | Layout |
|---|---|
| < 640 px (phones) | Single column. Bottom navigation: Today · Month · Events · Settings (icon **and** label). |
| 640–1023 px | Single column, wider cards, timeline horizontal. |
| ≥ 1024 px (desktop) | **Month grid and day detail side by side**; navigation as a side rail. |

- Content max width ~720 px in single-column layouts.
- Must survive 200% text: elements wrap, never truncate key data (times, tithi).
- No horizontal page scroll; the timeline may scroll horizontally inside its own container with visible affordance.

---

## 6. UX principles

1. **Glanceable:** the glance line answers "what is today, is now a good time" in under 2 seconds.
2. **Elderly-friendly by default:** big type, generous spacing, obvious buttons, no hidden gestures, confirmation before destructive actions (delete event).
3. **Plain labels everywhere:** forms and settings use everyday words; technical terms appear only in help text.
4. **Trust:** every computed value can lead to "How this is calculated"; "Report a mismatch" is easy to find.
5. **Durability:** backup nudges; one-tap export/import.
6. **Motion with purpose:** transitions explain a state change (e.g., month slide), never decorate.
7. **Dark mode is designed**, not inverted.
8. **No spinners:** cached data appears instantly; skeletons only on first-ever launch.

---

## 7. Accessibility requirements

- **WCAG 2.2 AA** in every theme and mode: text ≥ 4.5:1; large text and non-text UI (borders of inputs, focus ring, now-marker, icons) ≥ 3:1.
- **Never colour alone.** Auspicious/inauspicious, festival, personal event, two-day/skipped tithi, today, selected: each has a label or icon too. Assume red–green colour blindness: auspicious vs inauspicious must differ in icon/shape and label, not only hue.
- Tap targets **≥ 48 × 48 dp**, with ≥ 8 dp between targets.
- Respects OS font scaling **plus** an in-app text-size multiplier; layout survives 200%. Approved exception: timeline lane labels cap at ~115% because the same information is available at full size in the detail sheet and glance card.
- Full keyboard navigation on web with a **visible focus ring** (token `--focus-ring`).
- Screen-reader labels for every icon and marker; times read as times; Gujarati content marked `lang="gu"`.
- `prefers-reduced-motion`: no slides or parallax; opacity fades ≤ 120 ms only.
- No time limits, no auto-dismissing important messages.

---

## 8. Design tokens

### 8.1 Architecture: three layers
1. **Primitive:** raw values (colour ramps, sizes). Only theme definitions use them.
2. **Semantic:** what a value *means* (`--surface`, `--text-muted`, `--auspicious`). **Components use semantic tokens only.**
3. **Component:** optional aliases built from semantic tokens (`--timeline-now: var(--now-marker)`).

A **theme = palette × mode** (light/dark). Every theme defines the full semantic set. Switching theme = swapping values at the root; components never change.

### 8.2 Semantic colour tokens

| Token | Use |
|---|---|
| `--bg` | App background |
| `--surface` | Cards, sheets |
| `--surface-raised` | Dialogs, menus, raised cards |
| `--surface-sunken` | Wells, input backgrounds, grid gutters |
| `--text` | Primary text |
| `--text-muted` | Secondary text (still AA) |
| `--text-on-accent` | Text on accent fills |
| `--border` | Hairlines, dividers (decorative) |
| `--border-strong` | Input borders, meaningful outlines (≥ 3:1) |
| `--focus-ring` | Keyboard focus |
| `--accent` / `--accent-subtle` | Primary actions, selection / soft fill |
| `--danger` | Destructive actions (delete) |
| `--warning` / `--warning-subtle` | "Close to a tithi change", notification-health issues |
| `--auspicious` / `--auspicious-subtle` | Good Choghadiya (Amrut, Shubh, Labh) |
| `--inauspicious` / `--inauspicious-subtle` | **Rahu Kaal only** (strong treatment). Yamaganda, Gulika, Bhadra, and not-good Choghadiya (Rog, Udveg, Kaal) use a soft neutral fill plus the "not good" shape and label (approved Today design). |
| `--festival` / `--festival-subtle` | Festival markers |
| `--personal-event` / `--personal-event-subtle` | Personal event markers |
| `--now-marker` | "Now" line on timelines, today indicator |

Neutral Choghadiya (Char) uses `--text-muted` with a neutral icon.

### 8.3 Proposed v1 palettes

- **Calm** (default): soft warm-white / deep slate, teal accent. Quiet and modern.
- **Mandir** (warm traditional): ivory and turmeric tones, saffron-brown accent, maroon festival colour. Feels like a printed panchang.
- **Raat** ("night"): deep indigo with moonlight-gold accent; dark mode is its signature, light mode is lavender-white.

| Semantic token | calm-light | calm-dark | mandir-light | mandir-dark | raat-light | raat-dark |
|---|---|---|---|---|---|---|
| `--bg` | `#F7F6F2` | `#121417` | `#FBF5EA` | `#1A120D` | `#F4F4FA` | `#0F1026` |
| `--surface` | `#FFFFFF` | `#1B1E22` | `#FFFDF8` | `#241912` | `#FFFFFF` | `#171935` |
| `--surface-raised` | `#FFFFFF` | `#23272C` | `#FFFFFF` | `#2E2118` | `#FFFFFF` | `#202244` |
| `--surface-sunken` | `#EEECE6` | `#0D0F11` | `#F3E8D3` | `#120C08` | `#E8E8F3` | `#0A0B1C` |
| `--text` | `#1F2328` | `#E8EAED` | `#2B1D14` | `#F4E9DA` | `#1A1B3A` | `#E9E9F7` |
| `--text-muted` | `#57606A` | `#A9B1BA` | `#6B5444` | `#C4AE96` | `#55577A` | `#AEB0D0` |
| `--text-on-accent` | `#FFFFFF` | `#0B1F22` | `#FFFFFF` | `#241406` | `#FFFFFF` | `#1A1406` |
| `--border` | `#D8D5CC` | `#30353B` | `#E2D2B8` | `#3D2D21` | `#D5D6E8` | `#2C2E52` |
| `--border-strong` | `#8A8578` | `#7C858F` | `#94785C` | `#9C8268` | `#7E80A3` | `#7C7FA8` |
| `--focus-ring` | `#0B6E79` | `#5CC8D3` | `#8F3A00` | `#F0A35C` | `#3F3FA6` | `#E8C76A` |
| `--accent` | `#0B6E79` | `#5CC8D3` | `#8F3A00` | `#F0A35C` | `#3F3FA6` | `#E8C76A` |
| `--accent-subtle` | `#E1F1F2` | `#173338` | `#F8E4CF` | `#3D2614` | `#E4E4F7` | `#2E2A1C` |
| `--danger` | `#B42318` | `#FF8A7A` | `#B42318` | `#FF8C7F` | `#B42318` | `#FF8F87` |
| `--warning` | `#8A5300` | `#F2B65A` | `#7A4D00` | `#F2C35A` | `#7F5200` | `#F2C35A` |
| `--warning-subtle` | `#FBF0DC` | `#3A2C14` | `#F7E7C2` | `#3A2D12` | `#F8EED8` | `#352B14` |
| `--auspicious` | `#1E6B3A` | `#6FD08F` | `#2F6B2F` | `#8FD17F` | `#1F6B45` | `#7ED6A0` |
| `--auspicious-subtle` | `#E3F2E8` | `#173322` | `#E6F0DD` | `#1F311A` | `#E1F1E8` | `#16302A` |
| `--inauspicious` | `#A8321F` | `#FF8F7A` | `#A4262C` | `#FF8C85` | `#A82D2D` | `#FF9590` |
| `--inauspicious-subtle` | `#FBE7E3` | `#3D1D18` | `#F8E0DE` | `#401C1A` | `#F9E3E3` | `#3A1C2A` |
| `--festival` | `#8A3B8F` | `#E3A3E8` | `#7A1F4D` | `#F2A0C7` | `#7A3592` | `#DDA6F2` |
| `--festival-subtle` | `#F4E6F5` | `#352039` | `#F5E1EA` | `#3D1F2E` | `#F1E4F6` | `#2F1F45` |
| `--personal-event` | `#1F5FA8` | `#8DB8F2` | `#24578F` | `#94BDEB` | `#1D5E8C` | `#8EC3F0` |
| `--personal-event-subtle` | `#E3EEFA` | `#1C2B40` | `#E2ECF6` | `#1E2B3B` | `#E0EDF6` | `#1A2A45` |
| `--now-marker` | `#C2410C` | `#FF9F5A` | `#B8440F` | `#FFB070` | `#B54708` | `#FFA94D` |

**Measured contrast:** all six variants pass AA for every checked pair: `--text`, `--text-muted`, `--accent`, `--danger`, `--warning`, and every domain token as text on `--bg`, `--surface`, `--surface-raised`, `--surface-sunken` (≥ 4.5:1); `--text` and each domain colour on its own `-subtle` fill (≥ 4.5:1); `--text-on-accent` on `--accent` (≥ 4.5:1); `--border-strong`, `--focus-ring`, `--now-marker` on all backgrounds (≥ 3:1). 366 pairs, 0 failures; lowest ratio 3.11 (a 3:1 non-text pair). Designers may adjust values but must keep these pairs passing.

### 8.4 Typography

- **Latin:** system UI font stack (Roboto on Android, San Francisco on Apple, Segoe on Windows). No extra font download.
- **Gujarati:** Noto Sans Gujarati. **Devanagari** (Hindi, v2): Noto Sans Devanagari. Self-hosted, subset to used glyphs; weights **400 and 600 only**.
- All sizes in `rem` so OS scaling and the in-app text-size multiplier apply. Base body is **18 px** (larger than the web default 16 px) for older readers.

| Token | Size (rem / px at 100%) | Use |
|---|---|---|
| `--text-caption` | 0.9375 / 15 | Minimum size; metadata only |
| `--text-sm` | 1 / 16 | Secondary text |
| `--text-body` | 1.125 / 18 | Body |
| `--text-lg` | 1.25 / 20 | Emphasised body, list titles |
| `--text-title` | 1.5 / 24 | Section titles |
| `--text-headline` | 1.875 / 30 | Glance line (mobile) |
| `--text-display` | 2.25 / 36 | Glance line (desktop), big dates |

| Token | Latin | Gujarati / Devanagari |
|---|---|---|
| `--leading-body` | 1.45 | 1.65 (vowel signs above/below need room) |
| `--leading-heading` | 1.2 | 1.35 |
| `--script-scale` | 1 | 1.05 *(provisional; tune so Gujarati looks optically equal to Latin)* |

- Times use **tabular figures** so they align in timelines and tables.
- Never letter-space Gujarati or Devanagari; never use all-caps on them.

### 8.5 Spacing, radius, elevation, motion

| Spacing | `--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-5` 20 · `--space-6` 24 · `--space-8` 32 · `--space-10` 40 · `--space-12` 48 · `--space-16` 64 (px) |
|---|---|
| Tap target | `--tap-min` 48 px |
| Radius | `--radius-sm` 6 · `--radius-md` 10 · `--radius-lg` 16 · `--radius-full` 9999 |
| Elevation | `--elevation-0` flat · `--elevation-1` cards · `--elevation-2` sheets/menus · `--elevation-3` dialogs. **Light:** soft shadows. **Dark:** lighter surface (`--surface-raised`) + `--border`, minimal shadow. |
| Duration | `--dur-fast` 120 ms · `--dur-base` 200 ms · `--dur-slow` 320 ms |
| Easing | `--ease-standard` cubic-bezier(0.2, 0, 0, 1) · `--ease-exit` cubic-bezier(0.3, 0, 1, 1) |
| Reduced motion | All durations → 0 except opacity fades capped at `--dur-fast`. No slides, no scaling. |

Motion uses: month change (slide in the direction of travel), sheet open/close, now-marker moving (no animation; it just updates).

---

## 9. Open identity questions (for Bhavy)

1. **Public name:** pending. Must be distinct from "Pocket Panchang" (taken), clear on Play and App Store, pass a basic trademark search, and read and sound well in Gujarati.
2. **Icon:** proposal to explore: a sun arc meeting a crescent (the Sun–Moon angle that defines a tithi). Neutral across sects; legible at 48 px; must also work as a single-colour Android notification icon. Avoid sect-specific religious symbols.
3. **Tone of voice:** warm, respectful, plain, like a helpful family member. No exclamation marks or hype; no fear language around inauspicious times ("Rahu Kaal: many families avoid starting new work now", not "Danger!"). Gujarati copy written natively, not machine-translated.
4. **Numerals in Gujarati mode:** Gujarati digits (૧૧, ૩:૧૬) or Latin digits (11, 3:16)? Older readers may prefer either; worth asking family testers.
5. **Clock format:** 12-hour (with AM/PM or સવાર/બપોર/સાંજ/રાત words) vs 24-hour.
6. **Palette names:** v1 ships all three (Calm, Mandir, Raat). Are the names right in Gujarati and English? ("Mandir" may read as religious-specific; "Raat" is plain Gujarati/Hindi for night.)
