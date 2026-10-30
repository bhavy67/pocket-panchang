# Play Console declarations

Exact answers for the App content section. Listing copy, full data-safety rationale and the original exact-alarm text live in `docs/release/play-store.md` (Phase 12) — this file has the console-field answers plus what changed since then.

## Permissions audit (merged manifest)

| Permission | Reason | Keep? |
|---|---|---|
| `INTERNET` | From the Capacitor template; the app makes no network calls (city data, fonts and the worker are all bundled). Kept rather than removed — untested whether WebView needs it to load bundled local-scheme assets; flagged for a real-device test before removing. | Keep, flagged |
| `POST_NOTIFICATIONS` | Family-date reminders. Requested lazily, only when the user saves their first reminder (`event-form.tsx`) — confirmed in this pass's quality-gate run, no manifest or code change needed. | Keep |
| `VIBRATE` | Haptics (Phase 11.7) on selections and month-swipe commits. | Keep |
| `USE_EXACT_ALARM` | Reminders must fire at the chosen minute even in Doze (see below). | Keep |
| `SCHEDULE_EXACT_ALARM` (maxSdkVersion 32) | Fallback for Android 12, which has no `USE_EXACT_ALARM`. | Keep |

## Data safety

No data collected or shared. See `play-store.md` for the full rationale (no analytics/ads SDKs, no network calls with user data, backups are user-initiated local files).

## Content rating questionnaire

Reference/utility app. No violence, no user-generated content, no sharing between users, no unrestricted web access, no real-money gambling. Expect a maximum **3+ / Everyone** rating.

## Target audience and content

Not designed for children: no child-directed marketing, no COPPA-style attestations needed. Suggested target age: 18+ as the simplest accurate answer (the app itself has no age gate and is usable by any age, but makes no child-directed claims).

## Ads

No ads.

## App access

No login needed; all features are available without restriction immediately on install.

## USE_EXACT_ALARM declaration — updated for the current Restricted Permissions form

Play's Restricted Permissions declaration (App content → Permissions declaration form) now also asks for a **short screen recording** demonstrating the feature that needs the exact alarm, in addition to the text explanation — this is new since Phase 12 and not something I can produce (needs a human on a device/emulator). Text to paste into the form:

> Parivar Panchang is a Hindu lunar calendar (panchang). Its core feature is reminding users of their own family events that follow the lunar calendar: birthdays by tithi, varsi/shraddh death anniversaries and wedding anniversaries. Each event's date is recalculated every year, and the app shows a notification at the time the user chooses on the day before and on the day itself. These are user-facing calendar event notifications, which must arrive at that time even when the phone is idle; inexact alarms can be deferred by hours in Doze, which would make a day-of reminder arrive too late. The app schedules at most one alarm per event per lead day (a rolling 12-month window, capped at 400) and uses no other background work.

**Recording script** (≤30s, screen recorded on a device or emulator):
1. Open Settings → Reminders.
2. Tap "Check that reminders can arrive" → "Send a test reminder in 1 minute".
3. Lock the phone.
4. Wait for the notification to arrive on the lock screen with the phone idle.

This exact flow was run and verified working on the budget emulator during this pass (screen locked, notification fired on time, both in English and Gujarati) — confirms the script works, just needs recording.

## Government / health / financial

None apply: the app is a calendar/utility, handles no payments, makes no health claims, and is not a government service.

## 16 KB page size / native code

No native libraries ship in the app (`unzip -l app-release.aab | grep '\.so$'` returns nothing) — confirmed by building a real release bundle. Nothing to align; not applicable.
