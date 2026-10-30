# Release plan: closed testing → production

Your Play Console account was created after 2023-11-13, so the 12-tester / 14-day closed-testing rule applies before production access ([Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465)) — budget about 3 weeks for the first launch: 14 continuous days of testing, then the production-access application, then review.

## 1. Closed testing track setup

1. Play Console → your app → Testing → Closed testing → create a track (e.g. "Family testing") if not already done (`docs/release/android.md` covers the first upload).
2. Create a release: upload the signed AAB (`android:bundle`), paste release notes, roll out.
3. Testers: Play Console → Testers tab → add an email list (your family's Gmail addresses) or a Google Group. Save.
4. Play Console gives you an **opt-in URL** for the track. Share that link directly with each tester (WhatsApp/email is fine) — they open it, tap "Become a tester," then the Play Store listing link to install.
5. **The 14-day clock starts when a tester opts in, not when you invite them** — ask them to opt in and install promptly, not "whenever."

## 2. How many testers, how long

- **Minimum 12 testers**, opted in continuously for the **14 days immediately before** you apply for production access. If a tester opts out and back in, their count may reset — don't let the list shrink below 12 at any point in that window.
- Plan for more than 12 if some family members are likely to be slow installing or might uninstall; a little buffer avoids restarting the clock.

## 3. While testing: pre-launch report and vitals

- **Pre-launch report** (Play Console → Testing → Pre-launch report, auto-generated ~a few hours after each upload): check for crashes, ANRs, and accessibility warnings Google's automated crawler hits. Given the app's offline-first design and the Phase 10 axe/E2E coverage, expect this to be clean, but review it per release — it runs on real device farm hardware, which is a different signal than the emulator.
- **Android vitals** (Play Console → Quality → Android vitals, needs a few days of real usage first): watch crash rate, ANR rate, and excessive wakeups — the last one specifically matters here since the app schedules AlarmManager wakeups for reminders; a spike would mean the reminder-scheduling logic is firing more often than intended.
- Fix anything red before applying for production, not after — a new closed-testing release restarts testers' opt-in clock if it's flagged as a different track, so batch fixes into the current track's releases.

## 4. Promoting to production

1. Confirm 12+ testers have been opted in for 14 continuous days (Play Console shows this on the production-access screen once eligible).
2. Confirm `docs/release/festival-gate.md` is where you want it — festivals ship to production only once verified (§0 rule 7); check what's currently verified before the production listing goes live, since that's what real users will see.
3. App content: confirm Data safety, content rating, target audience, ads, and the exact-alarm declaration (this pass's `declarations.md`) are all submitted and approved — the exact-alarm one specifically needs the screen recording (see `declarations.md`) and manual review, which can take a few days; submit it early, not at the last minute.
4. Play Console → Production → Create release → promote the latest closed-testing build (same AAB, no rebuild needed unless you want a final versionCode bump) → release notes → submit for review.
5. Review typically takes a few hours to a few days. Once approved, the app goes live on Play.
6. Web: separately, add the Cloudflare CNAME and promote the Vercel deployment to production (`docs/release/web.md`) — not gated by the Play review, can happen independently.

## 5. Formal trademark search

`PROJECT_PLAN.md`'s "Release finalization" section notes production promotion also waits on "the formal trademark search" being done — that's a manual step for you, not something this pass covers.
