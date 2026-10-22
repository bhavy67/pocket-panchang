---
status: accepted
date: 2026-10-22
---

# 0013. Web-first development, private family preview, joint public release (§13 #4)

Development is web-first (phase order unchanged). After **Phase 9** (events and `.ics` work), a **private web preview** goes to family testers on an unlisted Vercel URL (not `panchang.bhavyladani.in`), with "Report a mismatch" enabled. The **public** release of web and Android happens together in Phase 12. Reason: the headline feature, personal tithi reminders, is only reliable on Android, so a public web-only launch would show its weaker form; but the biggest risk (§12) is a wrong date, and family using real data early surfaces mismatches months sooner.

## Consequences

- **Data doesn't carry over automatically.** IndexedDB is per-origin, so preview data does not appear on `panchang.bhavyladani.in`. The migration path is **JSON backup export → import** (§6). The preview shows a persistent banner prompting testers to export before switching.
- **Real migrations from the first preview on.** Once Phase 9 ships to testers, every Dexie schema change needs a real migration; wiping the database is no longer acceptable (§6 persistence rules).
- **Not indexed.** The preview deployment sends `X-Robots-Tag: noindex`.
- **Family history check (Phase 6).** An engine script prints computed occurrences for family-provided past events (last 2–3 years) next to the dates the family actually observed. It is used to settle the §13 "Pending family confirmations" with real history. The family data file is personal: it lives in a **gitignored** path (proposed: `fixtures/private/`) and is never committed.
