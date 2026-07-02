# Store Submission Kit — Pyramid Festival

Everything needed to publish the app to the **App Store** and **Google Play**.

## What's in this folder

```
store-assets/
├── privacy-policy.md              ← host this at a public URL, use it in both stores
├── graphics/
│   ├── play-icon-512.png          ← Google Play "hi-res icon" (512×512, required)
│   └── feature-graphic-1024x500.png ← Google Play "feature graphic" (required)
└── screenshots/
    ├── ios/      01–07 .png       ← 1320×2868 (iPhone 16 Pro Max, 6.9" — App Store slot)
    └── android/  01–07 .png       ← 1080×2400 (phone)
```

App icon / splash / adaptive icon live in `../assets/` (already wired in `app.json`) and
are generated from the official Pyramid pyramid mark.

Screenshots, in order: **01** Home · **02** Lineup · **03** Event + reminder ·
**04** Map · **05** Info · **06** My Plan · **07** Reminder picker. Upload 3–5 of the
strongest (Home, Lineup, Map, My Plan make a good core set).

## Already configured (in the repo)

- `app.json` — name, `version 1.0.0`, iOS `buildNumber 1`, Android `versionCode 1`,
  bundle id / package `com.pyramidfestival.app`, `usesNonExemptEncryption: false`
  (skips the export‑compliance question), white adaptive‑icon background, dark splash.
- `eas.json` — `development` / `preview` / `production` build profiles + a `submit` profile.
- Reminders are **local notifications only** → **no APNs/FCM push credentials needed.**

## What you need to provide

1. **Apple Developer Program** membership ($99/yr) → https://developer.apple.com
2. **Google Play Developer** account ($25 one‑time) → https://play.google.com/console
3. An **Expo account** (free) for EAS Build → https://expo.dev  (run `eas login`)
4. A **public URL** hosting `privacy-policy.md` (both stores require it).

## Build & submit (EAS)

```bash
cd ReactNative
npm i -g eas-cli          # once
eas login
eas init                  # links the project, writes extra.eas.projectId into app.json

# Production builds (EAS handles signing/credentials interactively the first time)
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit the built binaries to the stores
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

`production` has `autoIncrement: true`, so build/version numbers bump automatically on
each build.

## App Store Connect checklist

- [ ] Create the app record (bundle id `com.pyramidfestival.app`).
- [ ] Upload screenshots — the **6.9"** set from `screenshots/ios/` covers the required slot.
- [ ] Privacy: choose **"Data Not Collected"** (accurate — see privacy policy).
- [ ] Privacy Policy URL.
- [ ] Category: **Music** (secondary: Travel or Entertainment).
- [ ] Age rating questionnaire (all "No" → 4+).
- [ ] `supportsTablet` is **false**, so **no iPad screenshots required.**
- [ ] Export compliance is pre‑answered via `usesNonExemptEncryption: false`.

## Google Play Console checklist

- [ ] Create the app (package `com.pyramidfestival.app`).
- [ ] Upload `graphics/play-icon-512.png` (hi‑res icon) and
      `graphics/feature-graphic-1024x500.png` (feature graphic).
- [ ] Phone screenshots from `screenshots/android/` (min 2).
- [ ] **Data safety** form: **no data collected / no data shared.**
- [ ] Privacy Policy URL.
- [ ] Content rating questionnaire.
- [ ] Category: **Music & Audio** (or Events).
- [ ] Target audience (not designed for children).

## Suggested listing copy

**Name:** Pyramid Festival
**Subtitle / short description (≤80 chars):**
> Your guide to Pyramid Festival — lineup, set times, map, and reminders.

**Description:**
> The official companion app for Pyramid Festival on Rtanj Mountain, Serbia.
> Browse the full lineup and set times across every stage and zone, explore the
> interactive village map, and build your personal plan — star the sets and events
> you can't miss and get a reminder 15 minutes before each one. Know‑before‑you‑go
> essentials, gates, and getting‑there info, all in one place. Works offline once loaded.

**Keywords (iOS):** festival, lineup, set times, schedule, Rtanj, Pyramid, music, map, reminders
