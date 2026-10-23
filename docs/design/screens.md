# Screen designs

Status of each v1 screen design. Approved designs are the visual reference for implementation; `docs/design/brief.md` and ADR 0017 (tokens) govern everything not shown in them.

| Screen | Status | Palette / mode | Link |
|---|---|---|---|
| Today | **Approved** (2026-10-22) | Calm, light | https://claude.ai/artifact/ESE5hDoDYmfpqJXoza5Jn7 |
| Onboarding | Designed in Phase 8 | | |
| Month | **Built in code, awaiting approval** (2026-10-23) | Calm, Mandir, Raat × light/dark via tokens | dev: `/month?m=2026-10` |
| Day detail | **Built in code, awaiting approval** (2026-10-23) | Calm, Mandir, Raat × light/dark via tokens | dev: `/day?date=2026-10-22` |
| Personal events (list + form) | Designed in Phase 8 | | |
| Settings | Designed in Phase 8 | | |
| Dark mode (all screens) | **Built in code for Today/Month/Day, awaiting approval** | Calm dark | dev: `?mode=dark` |
| Mandir and Raat palettes (all screens) | **Built in code for Today/Month/Day, awaiting approval** | light + dark | dev: `?palette=mandir&mode=dark` |

Phase 8 designs the remaining screens from the brief, the ADR 0017 tokens, and the approved Today screen as the visual reference. **Changed 2026-10-23 (Bhavy):** no separate design tool; each screen is designed directly in code and approved from the running dev build.

**Additions made while building Month and Day detail (pending approval):**
- Month cells cap text growth at ~120% (date ≤ 24 px, tithi ≤ 18 px, markers ≤ 16 px), the same rule as the timeline lane labels: seven columns can't hold 200% text at 360 px, and every cell's full detail is one tap away.
- Month markers: festival = diamond (name shown from 640 px), two-day tithi = "2×" chip, skipped tithi = dashed "skip" chip, today = ring in `--now-marker`, selected = accent fill; a key sits under the grid. Navratri is a band under its week rows labelled "Day 1" and "Last day".
- At large text, glance-card rows and list rows wrap their text under the icon rather than squeezing it.

## Decisions established by the approved Today screen

These apply to every later screen, not just Today.

1. **Glance card** at the top: tithi (with Gujarati), the current Choghadiya with its quality, then:
   - **"Many avoid now"**: one box listing every avoid period currently in effect (e.g., "Bhadra until 2:47 PM", "Rahu Kaal until 3:16 PM"), with the plain explanation "Families often wait to start new or auspicious work."
   - A calm sentence when a good Choghadiya overlaps an avoid period (no alarm language).
   - **"Next good time"**: the next good Choghadiya that does **not** overlap Rahu Kaal or Bhadra. At 2:10 PM in the example it points to Shubh 4:42–6:09 PM, not the current Amrut.
   - Screen readers get a one-line summary of the card.
2. **Shape + label coding, never colour alone:** good = filled circle with a tick; not good = diamond with a bar; neutral = outlined circle. Each always has a word label (Good / Neutral / Not good).
3. **Restrained warning colour:** only **Rahu Kaal** gets the strong `--inauspicious` (red) treatment. Not-good Choghadiya, Yamaganda, Gulika, and Bhadra use a soft neutral fill and rely on shape + label.
4. **Timeline:** vertical, sunrise at the top to sunset at the bottom, with two columns: Choghadiya, and a **"Times many avoid"** lane. The avoid lane is a **proportional time axis**: each block is placed and sized from its own start and end time (Bhadra is a slim bar from before sunrise that visibly ends two-thirds of the way through Amrut). The "Now" line crosses both columns and passes behind text. Tapping any block opens a detail sheet with a Close button. Night Choghadiya follows below.
5. **Lane labels cap their growth at about 115% text size** so names wrap only between words; the full details stay available at any text size through the detail sheet and the glance card. All other text scales to 200%.
6. **A "Help" button with a text label**, not a bare "?" icon.
7. **Section order:** header (time, city, date with Gujarati weekday, Help) → glance card → "Today's panchang" (five elements, with "Changes today") → "Today, hour by hour" (legend + timeline) → "Sun and Moon" → "Coming up" (family dates and festivals, each with "in N days") → Vikram Samvat → "How this is calculated" → bottom navigation (Today · Month · Events · Settings).
8. **Tokens only:** colour comes from semantic tokens on `[data-palette][data-mode]`; sizes in rem; Latin text uses the system UI stack, Gujarati uses Noto Sans Gujarati.
