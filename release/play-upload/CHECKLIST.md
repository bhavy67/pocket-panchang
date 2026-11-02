# Play Console upload checklist: Parivar Panchang 1.2.0 (versionCode 3)

Specs from Play Console Help, retrieved 2026-11-02: [preview assets](https://support.google.com/googleplay/android-developer/answer/9866151), [store listing](https://support.google.com/googleplay/android-developer/answer/9859152), [release notes](https://support.google.com/googleplay/android-developer/answer/9859348). Images measured from the PNG headers in this folder (bit depth = channels × 8; "no alpha" = no alpha channel and no tRNS chunk). The Help page gives no file-size limit for phone screenshots or the feature graphic, so 8 MB (its stated screenshot limit) is applied as a conservative bound.

| Play Console field | File | Spec | Measured | Result |
|---|---|---|---|---|
| Release → App bundle | `01-app-bundle/parivar-panchang-1.2.0-vc3.aab` (gitignored) | Signed AAB, versionName 1.2.0, versionCode 3 | `jarsigner -verify`: jar verified; upload cert CN=Bhavy Ladani, C=IN, SHA-256 5F:9F:DD:0D:…:AD:7D:E1, valid to 2054; versionCode 3, versionName 1.2.0; 2.9 MB; no native `.so` | PASS |
| Main store listing → App icon | `02-app-icon/icon-512.png` | PNG, 512×512, 32-bit with alpha, ≤ 1024 KB | 512×512, 32-bit, alpha channel yes (opaque), 7 KB | PASS (fixed: was 24-bit) |
| Main store listing → Feature graphic (en-IN) | `03-feature-graphic/feature-graphic-en.png` | JPEG or 24-bit PNG, no alpha, 1024×500 | 1024×500, 24-bit, no alpha, 153 KB | PASS |
| Main store listing → Feature graphic (gu) | `03-feature-graphic/feature-graphic-gu.png` | JPEG or 24-bit PNG, no alpha, 1024×500 | 1024×500, 24-bit, no alpha, 149 KB | PASS |
| Phone screenshots (en-IN) | `04-phone-screenshots/en/01-today.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 219 KB | PASS |
| Phone screenshots (en-IN) | `04-phone-screenshots/en/02-today-dark.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 226 KB | PASS |
| Phone screenshots (en-IN) | `04-phone-screenshots/en/03-month.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 226 KB | PASS |
| Phone screenshots (en-IN) | `04-phone-screenshots/en/04-family.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 207 KB | PASS |
| Phone screenshots (en-IN) | `04-phone-screenshots/en/05-notification.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 183 KB | PASS |
| Phone screenshots (en-IN) | `04-phone-screenshots/en/06-themes.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 183 KB | PASS |
| Phone screenshots (en-IN) | `04-phone-screenshots/en/07-shunya.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 194 KB | PASS |
| Phone screenshots (en) count | `04-phone-screenshots/en/` | 2–8 (4+ recommended) | 7 | PASS |
| Phone screenshots (gu) | `04-phone-screenshots/gu/01-today.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 211 KB | PASS |
| Phone screenshots (gu) | `04-phone-screenshots/gu/02-today-dark.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 222 KB | PASS |
| Phone screenshots (gu) | `04-phone-screenshots/gu/03-month.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 200 KB | PASS |
| Phone screenshots (gu) | `04-phone-screenshots/gu/04-family.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 175 KB | PASS |
| Phone screenshots (gu) | `04-phone-screenshots/gu/05-notification.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 150 KB | PASS |
| Phone screenshots (gu) | `04-phone-screenshots/gu/06-themes.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 167 KB | PASS |
| Phone screenshots (gu) | `04-phone-screenshots/gu/07-shunya.png` | JPEG or 24-bit PNG, no alpha; sides 320–3840 px, long ≤ 2× short; 9:16 at ≥ 1080 px for promotion; ≤ 8 MB | 1080×1920 (9:16), 24-bit, no alpha, 184 KB | PASS |
| Phone screenshots (gu) count | `04-phone-screenshots/gu/` | 2–8 (4+ recommended) | 7 | PASS |
| Main store listing → App name (en-IN) | `07-listing-text/en-IN.txt` | ≤ 30 characters | 16 | PASS |
| Main store listing → Short description (en-IN) | `07-listing-text/en-IN.txt` | ≤ 80 characters | 76 | PASS |
| Main store listing → Full description (en-IN) | `07-listing-text/en-IN.txt` | ≤ 4000 characters | 1798 | PASS |
| Main store listing → App name (gu) | `07-listing-text/gu.txt` | ≤ 30 characters | 13 | PASS |
| Main store listing → Short description (gu) | `07-listing-text/gu.txt` | ≤ 80 characters | 77 | PASS |
| Main store listing → Full description (gu) | `07-listing-text/gu.txt` | ≤ 4000 characters | 1626 | PASS |
| Release → Release notes (en-IN) | `08-release-notes/en-IN.txt` | ≤ 500 Unicode characters per language | 370 | PASS |
| Release → Release notes (gu) | `08-release-notes/gu.txt` | ≤ 500 Unicode characters per language | 341 | PASS |
| App content → Exact alarm / Permissions declaration | `09-declarations/exact-alarm-declaration.txt` | Text plus a screen recording | Text ready (729 characters); **recording not made yet** | Text PASS, recording TODO |
| App content → Data safety, rating, audience, ads, app access | `09-declarations/declarations.md` | n/a | Answers ready | PASS |
| App content → Privacy policy | `10-links.txt` | Public URL, matches the app | HTTP 200; renders the Parivar Panchang policy (no data collected, permissions listed, Auto Backup sentence) | PASS |
| Store settings → Website, email | `10-links.txt` | Email required | Website set; email bhavy.ladani6701@gmail.com | PASS |
| Tablet 7″ / 10″ screenshots | not included | 4+ per type to be shown on tablets; 9:16, 1080–7680 px | Only 2 per type, 10:16, layout not tablet-optimized | Left out (Bhavy, 2026-11-02) |

Character counts are Unicode code points (Python `len`), which is how Play counts.

**Notes**
- Privacy policy: now states that Android Auto Backup may copy data to the user's own Google account and that we never receive it (updated 2 November 2026).
- Live web build is **one commit behind**: panchang.bhavyladani.in still serves `theme-color #0B6E79` (last modified 2026-10-31, i.e. 35d92b6); `main` (bbb0118) has `#F6F7FA`. That meta tag is the only app-code difference. To fix: Vercel → panchang → Deployments → the bbb0118 deployment → Promote to Production.

## Upload order in Play Console

1. **App content** (Policy → App content): privacy policy URL, app access (no login), ads (none), content rating, target audience, data safety, government app (no), financial features (none), health (none), **exact alarm / permissions declaration** (text + recording).
2. **Store settings**: category Lifestyle, tags, email, website.
3. **Main store listing**, en-IN (default): name, short and full description, icon, feature graphic, 7 phone screenshots. Then **Add translation → Gujarati (gu)**: gu text, gu feature graphic, gu screenshots. Skip the video.
4. **Testing → Closed testing → Create release**: upload `01-app-bundle/*.aab` (accept Play App Signing on the first upload), paste `08-release-notes/release-notes-console.txt`, add testers, review, then **Send for review**.
5. After 14 days with 12+ testers: apply for production access (`docs/release/play/release-plan.md`).
