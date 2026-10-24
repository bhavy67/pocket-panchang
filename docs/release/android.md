# Android release (AAB) with your upload key

Package `in.bhavyladani.panchang`, label "Parivar Panchang" (Gujarati phones: "પરિવાર પંચાંગ"). Play App Signing holds the app-signing key; you sign uploads with your **upload key**. No key, password or keystore path is ever committed (`*.jks`/`*.keystore` are gitignored).

## One-time setup

1. **Create the upload key** (skip if you already have one; store it outside the repo and back it up, e.g. in your password manager):

   ```sh
   mkdir -p ~/keys
   keytool -genkeypair -v -keystore ~/keys/panchang-upload.jks -alias upload \
     -keyalg RSA -keysize 4096 -validity 10000
   ```

2. **Tell Gradle where it is**, in `~/.gradle/gradle.properties` (your home folder, not the repo):

   ```properties
   PANCHANG_UPLOAD_STORE_FILE=/Users/<you>/keys/panchang-upload.jks
   PANCHANG_UPLOAD_STORE_PASSWORD=<store password>
   PANCHANG_UPLOAD_KEY_ALIAS=upload
   PANCHANG_UPLOAD_KEY_PASSWORD=<key password>
   ```

   `android/app/build.gradle` signs release builds only when these exist; without them `bundleRelease` produces an unsigned bundle (Play rejects it).

3. **Play Console:** create the app "Parivar Panchang", default language English (India), add Gujarati as a listing language, and accept **Play App Signing** when you upload the first bundle.

## Every release

1. Bump `versionCode` (+1, integer) and `versionName` in `apps/app/android/app/build.gradle`, and `version` in `apps/app/package.json` (shown in Settings → About).
2. Build:

   ```sh
   pnpm install
   pnpm --filter @panchang/app android:bundle
   ```

   Output: `apps/app/android/app/build/outputs/bundle/release/app-release.aab`.
3. Check the signature: `jarsigner -verify -verbose -certs apps/app/android/app/build/outputs/bundle/release/app-release.aab | grep -m1 "CN="` should show your upload key's name, not "Android Debug".
4. Play Console → Testing → **Closed testing** (start here; production after testers confirm reminders) → Create release → upload the AAB → release notes → review → roll out.

## First upload checklist (Play Console)

- App content: privacy policy URL `https://panchang.bhavyladani.in/privacy`; Data safety (see `play-store.md`); Ads: no; Target audience: 18+ is simplest (the app is for all ages but makes no child-directed claims); Content rating questionnaire: reference/utility, no objectionable content.
- **Exact alarm declaration** for `USE_EXACT_ALARM` (text in `play-store.md`). If rejected, switch the manifest to `SCHEDULE_EXACT_ALARM` only (ADR 0023); no code change.
- Store listing text and screenshots: `play-store.md`, `docs/screenshots/`.
- If your Play developer account is a **personal account created after 13 Nov 2023**, production access needs a closed test with **at least 12 testers opted in for the last 14 days** ([Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465)). Plan the family testers accordingly; organisation accounts are exempt.
