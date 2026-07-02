# Publishing Pyramid Festival — Step-by-Step Guide

A complete, in-order walkthrough from zero to "live on both stores."

**Legend:** 🧑 = you do it (interactive / needs your accounts) · 🤖 = Claude can do it for you in a session · 💳 = needs a paid account

**Rough timeline:** setup ~1 hr · Apple review ~1–3 days · Google review ~few hours–2 days.

---

## What you need before starting

| Thing | Where | Cost |
|---|---|---|
| Expo account | https://expo.dev | free |
| Apple Developer Program | https://developer.apple.com/programs | $99 / year |
| Google Play Developer | https://play.google.com/console/signup | $25 once |
| A public URL for the privacy policy | your site or GitHub Pages | free |

Everything else (icons, screenshots, feature graphic, listing copy, `eas.json`) is already
prepared in this `store-assets/` folder and in the repo.

---

## PART 0 — One-time project setup

### Step 0.1 — 🧑 Create an Expo account
Sign up at https://expo.dev (free). Remember the email/password.

### Step 0.2 — 🧑 Log the CLI into Expo
Run this in the session (the `!` prefix runs it here so Claude can see the result):
```
! cd ReactNative && npx eas-cli@latest login
```
Enter your Expo email + password when prompted.

### Step 0.3 — 🤖 Link the project
Once logged in, tell Claude "go" — it runs:
```
npx eas-cli@latest init
```
This creates a project on your Expo account and writes `extra.eas.projectId` into `app.json`.
(Commit that change.)

---

## PART 1 — Google Play (do this first: cheaper, faster, no Apple wait)

### Step 1.1 — 💳🧑 Create the Play Developer account
Sign up + pay the $25 one-time fee at https://play.google.com/console/signup.
Google verifies identity — this can take a day, so start it early.

### Step 1.2 — 🤖 Build the Android app
No Play account needed for the build itself — EAS generates & stores the signing keystore.
```
npx eas-cli@latest build --platform android --profile production
```
First run asks "Generate a new Android Keystore?" → **Yes** (EAS keeps it safe).
Produces a downloadable **`.aab`** file (~10 min in the cloud).

### Step 1.3 — 🧑 Create the app in Play Console
In https://play.google.com/console → **Create app**:
- App name: **Pyramid Festival**
- Default language, App (not game), Free.
- Accept the declarations.

### Step 1.4 — 🧑 Fill the Play listing
**Store listing** section (assets are in this folder):
- Short + full description → copy from `README.md` → "Suggested listing copy"
- App icon → `graphics/play-icon-512.png`
- Feature graphic → `graphics/feature-graphic-1024x500.png`
- Phone screenshots → `screenshots/android/` (upload 3–5)

**App content** section:
- Privacy Policy URL (see Step 3.1)
- **Data safety** → "No data collected / No data shared" (accurate — see `privacy-policy.md`)
- Content rating questionnaire (answer honestly → likely "Everyone")
- Target audience → not primarily for children
- Ads → No ads

### Step 1.5 — 🤖 Upload the build to Play
```
npx eas-cli@latest submit --platform android --profile production
```
(First time it asks for a Google service-account key — the CLI links you to the exact page
to create it. Or manually upload the `.aab` from Step 1.2 in Play Console → Production → Create release.)

### Step 1.6 — 🧑 Send for review
Play Console → **Production** → create a release → attach the build → **Review & roll out**.

---

## PART 2 — Apple App Store

### Step 2.1 — 💳🧑 Join the Apple Developer Program
Enroll + pay $99/yr at https://developer.apple.com/programs. Enrollment can take a day or two.

### Step 2.2 — 🧑 Create the app record in App Store Connect
https://appstoreconnect.apple.com → **Apps → +**:
- Platform: iOS
- Name: **Pyramid Festival**
- Bundle ID: **com.pyramidfestival.app** (matches `app.json`)
- SKU: anything, e.g. `pyramid-festival-2026`

### Step 2.3 — 🤖 Build the iOS app
Needs your Apple Developer login so EAS can create the certificate + provisioning profile.
```
npx eas-cli@latest build --platform ios --profile production
```
When prompted, log in with your Apple ID and let EAS manage credentials. Produces a signed **`.ipa`**.

### Step 2.4 — 🤖 Upload the build
```
npx eas-cli@latest submit --platform ios --profile production
```
The build then appears in App Store Connect after ~15–30 min of Apple processing.

### Step 2.5 — 🧑 Fill the App Store listing
In App Store Connect for the 1.0 version:
- Screenshots → `screenshots/ios/` (the 6.9" set covers the required slot)
- Description, keywords → `README.md` → "Suggested listing copy"
- Category: **Music**
- Privacy Policy URL (Step 3.1)
- App Privacy → **Data Not Collected**
- Age rating questionnaire → 4+
- Attach the build from Step 2.3, set price to Free.

### Step 2.6 — 🧑 Submit for review
Click **Add for Review → Submit**. Export compliance is already pre-answered
(`usesNonExemptEncryption: false` in `app.json`), so it won't ask.

---

## PART 3 — Shared prerequisites & aftercare

### Step 3.1 — ✅ Host the privacy policy (needed by BOTH stores) — DONE
Already published via GitHub Pages. The styled page lives at
`frontend/public/app-privacy.html` and deploys automatically with the site. Public URL:

> **https://borisnikolic.github.io/timeline-app/app-privacy.html**

Use that URL in Step 1.4 (Play) and Step 2.5 (App Store). To edit it later, change that
HTML file and push to `main` — the Pages workflow redeploys it.

### Step 3.2 — After approval
- The app goes live automatically (or on the release date you set).
- Test the download on a real device.

### Step 3.3 — Shipping updates later
1. Make code changes.
2. Bump the version: `version` in `app.json` (e.g. `1.0.1`). Build numbers auto-increment.
3. 🤖 `eas build` → `eas submit` again for the changed platform(s).
4. Add "what's new" text and submit the new version for review.

---

## Quick reference — where everything lives

```
ReactNative/
├── app.json                 app config (version, bundle id, icons)
├── eas.json                 build + submit profiles
├── assets/                  app icon, adaptive icon, splash
└── store-assets/
    ├── PUBLISHING-GUIDE.md   ← this file
    ├── README.md            checklists + listing copy
    ├── privacy-policy.md     host this publicly
    ├── graphics/            Play icon 512 + feature graphic
    └── screenshots/ios , /android
```

## The fastest path, summarized
1. 🧑 `! cd ReactNative && npx eas-cli@latest login`
2. 🤖 `eas init`
3. 💳 Start Google Play + Apple Developer sign-ups (they take time to verify).
4. 🤖 `eas build -p android` → 🧑 create Play app + listing → 🤖 `eas submit -p android`.
5. 🤖 `eas build -p ios` (once Apple is active) → fill listing → 🤖 `eas submit -p ios`.
6. 🧑 Submit both for review. Done.
