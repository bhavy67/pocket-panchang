---
status: accepted; public name decided 2026-10-24
date: 2026-10-22
---

# 0016. Working name, neutral package id, and brand-neutral persistent identifiers (§13 #8)

"Pocket Panchang" is **taken**: a same-category Google Play app (`com.dailyapps.pocketpanchangapp`, released 2026-04-13, 1,000+ installs) and an Apple App Store app (id 6754751035) use that exact name (checked 2026-10-22). It stays our **working name** for the repo and docs only. A distinct **public name** is chosen **before Phase 11** (Play listing), checked for Play and App Store availability, a basic trademark search, and how it reads and sounds in Gujarati.

**Decided 2026-10-24 (Bhavy): "Parivar Panchang" (Gujarati: "પરિવાર પંચાંગ").** Checks on 2026-10-24: no app with that exact name on Google Play (search for the exact phrase) or in a web search; the nearest is "Parivaar Pro", a family app that includes a panchang (some similarity risk, different name). "Parivar" (family) states the app's purpose and reads naturally in Gujarati. A formal trademark search (IP India; USPTO for diaspora markets) is Bhavy's step before production. Where it appears: UI strings (`appName` in `packages/i18n`), the PWA manifest (`name` "Parivar Panchang", `short_name` "Parivar"), the page title, Capacitor `appName`, and Android `app_name` (with a Gujarati label in `values-gu`). The repo, packages and docs keep the working name.

## Persistent identifiers are brand-neutral

Anything persisted on user devices or in their calendars is as permanent as the package id, so none of it carries the brand:

| Identifier | Value |
|---|---|
| Android package id | `in.bhavyladani.panchang` (matches `panchang.bhavyladani.in`) |
| IndexedDB / Dexie database name | `panchang` |
| Android notification channel ids | neutral, e.g. `reminders` |
| `.ics` UIDs | `{eventId}-{year}-{occurrence}@panchang.bhavyladani.in` |
| localStorage / Capacitor Preferences keys | neutral, e.g. `panchang.*` or unprefixed |
| PWA manifest `id` | neutral path (e.g. `/`), not the name |

The brand appears only in UI strings and the manifest's `name` / `short_name`.

**`.ics` UID year = lunar (Shaka) year** of the occurrence day (Phase 6), not the Gregorian year: an event in Pausha can occur twice in one Gregorian year (early January and late December) but only once per lunar year.

**`.ics` UID discriminator:** one event can yield several occurrences in one year (annual + Pitru Paksha, ADR 0004; `both` in an adhik year, ADR 0009). `{eventId}-{year}` alone would collide, and calendar apps would merge them. `{occurrence}` is `annual`, `pitru-paksha`, or `adhik` / `nija` when `both` applies. UIDs must be stable so re-exported `.ics` files update existing calendar entries instead of duplicating them.

## Consequences

- §13 "Pending" gains the public-name decision as a Phase 11 prerequisite.
- Required test: re-exporting `.ics` produces identical UIDs for unchanged occurrences, and distinct UIDs for same-year annual and Pitru Paksha occurrences.
