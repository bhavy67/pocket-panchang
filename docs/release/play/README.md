# Play Console asset map

Generated from the real production build (`pnpm --filter @panchang/app build && pnpm --filter @panchang/app preview`) via a scratch Playwright script, plus two on-device captures for the notification shot (emulator, screen locked, reminder actually fired — not mocked). Source screens: Ahmedabad, two realistic family dates ("Ba's varsi" as a Pitru-Paksha shraddh, "Papa" as a tithi birthday), verified festival (Dussehra) visible on the Month screen.

## Where each file goes in Play Console → Store presence → Main store listing

| Field | File |
|---|---|
| App icon (512×512) | `graphics/icon-512.png` |
| Feature graphic (1024×500) | `graphics/feature-graphic-en.png` (en-US listing), `graphics/feature-graphic-gu.png` (gu listing) |
| Phone screenshots, English listing | `screenshots/en/01`–`07` in order |
| Phone screenshots, Gujarati listing | `screenshots/gu/01`–`07` in order |
| 7-inch tablet screenshots | `screenshots/tablet/7in-01-today.png`, `7in-02-month.png` |
| 10-inch tablet screenshots | `screenshots/tablet/10in-01-today.png`, `10in-02-month.png` |

## Phone screenshot order and headline

| # | Screen | English headline | Gujarati headline |
|---|---|---|---|
| 01 | Today (Calm) | Today's tithi at a glance | આજની તિથિ, એક નજરમાં |
| 02 | Today (Raat, dark) | Beautiful by day or night | દિવસે કે રાત્રે, એકસરખું સુંદર |
| 03 | Month, with a verified festival | Festivals, clearly marked | તહેવારો, સ્પષ્ટ રીતે |
| 04 | Family dates | Never miss Ba's varsi | બાની વરસી ક્યારેય ના ચૂકો |
| 05 | Reminder notification (real, on-device) | Right on time, every year | દર વર્ષે, બરાબર સમયે |
| 06 | Settings → themes | Make it yours | તમારી પસંદ મુજબ |
| 07 | Today (Shunya, minimal) | Simple and clear for everyone | બધા માટે સરળ અને સ્પષ્ટ |

**Deviation from the brief:** the brief asked for a "Kagaz, for elders" screenshot. Kagaz (and Mandir) were removed in the Phase 11.7 follow-up (ADR 0026, 2026-10-27) — the app now ships four palettes (Calm, Raat, Utsav, Shunya), not six. #07 uses **Shunya** instead ("minimal, facts first" in-app), the closest existing match to the elders/simplicity brief.

## Tablets

The layout isn't deliberately tablet-optimized (no distinct breakpoint beyond what Tailwind's responsive classes give it for free), but it holds up: checked Today and Month at both 7-inch (600×960@2x) and 10-inch (800×1280@2x) widths — content reflows (e.g. the Panchang tile grid goes 3→4 columns), nothing clips or stretches oddly. Included rather than declaring phone-only; the 10-inch Month screenshot has a lot of empty space below the grid since nothing stretches to fill — cosmetic, not broken, worth a look before upload.

## Not regenerated here

README screenshots (`docs/design/screens/readme-today.png` etc.) are separate, already current per the 2026-10-30 commit; not touched by this pass.
