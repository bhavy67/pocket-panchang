---
status: accepted
date: 2026-10-24
---

# 0023. Android reminders: USE_EXACT_ALARM, a rolling window, no service worker

Reminders are the headline feature (ADR 0013), and a varsi reminder that arrives hours late is a failure. The app therefore schedules **exact** alarms (`setExactAndAllowWhileIdle` via Capacitor Local Notifications, which fall back to inexact if exact alarms are unavailable) and requests **`USE_EXACT_ALARM`**. Google Play allows that permission only when "the app is a calendar app that shows event notifications" (Play policy, *Exact Alarm Permission*; Play Console declaration required), and Android's own guidance names calendar apps as an acceptable exact-alarm use. A panchang whose core job is notifying family tithi dates fits. `USE_EXACT_ALARM` is granted at install and cannot be revoked on Android 13+; Android 12 (API 31–32) keeps the user-granted `SCHEDULE_EXACT_ALARM`, capped with `maxSdkVersion="32"`.

## Rules

- **Rolling window:** the next 366 days of reminders, soonest 400 (Android caps an app at ~500 alarms), rebuilt on app open (deferred 3 s off the cold start), on resume, after any event change or backup restore, and when family conventions, the observance or viewing city, the reminder time or the language change. Reboot persistence comes from the plugin's boot receiver.
- **Timing:** ADR 0007's cross-time-zone rule (`apps/app/src/lib/reminders.ts`), at `Settings.reminderTime` (default 08:00, device-local).
- **Identifiers:** channel id `reminders`; notification ids are FNV hashes of event, date, occurrence and lead days, so reschedules replace rather than duplicate (ADR 0016).
- **No service worker in the native app:** Capacitor already serves the bundled assets locally; a service worker would only cache them twice. It registers on the web only.
- **Battery optimisation** is detected and explained, never requested via `ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` (a Play-restricted permission); the health screen opens the system list instead, with Samsung and Xiaomi steps.

## Considered options

- **`SCHEDULE_EXACT_ALARM` only:** denied by default for new installs on Android 14+, so most users would get inexact reminders until they find a settings page. Kept as the fallback if Play rejects the `USE_EXACT_ALARM` declaration (then the health screen's "On-time reminders" check guides users to grant it).
- **Inexact alarms:** can be deferred by hours in Doze; unacceptable for day-of reminders.

## Consequences

- Phase 12: complete the Play Console exact-alarm declaration; if rejected, switch the manifest to `SCHEDULE_EXACT_ALARM` (no code change: the capability check already handles both).
- Reminders fire with the screen off in Doze (verified on an Android 16 emulator with `dumpsys deviceidle force-idle`).
