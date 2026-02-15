# KinTales App - Deployment Guide

## Prerequisites

### Accounts

1. **Expo Account** — https://expo.dev/signup
2. **Apple Developer Account** ($99/year) — https://developer.apple.com/programs/
3. **Google Play Console** ($25 one-time) — https://play.google.com/console/signup

### Tools

```bash
npm install -g eas-cli
eas login
```

## Initial Setup

### 1. Publish @kintales/tree-view to npm

```bash
cd kintales-tree-view
npm test              # Verify 61 tests pass
npm run build         # Build dist/
npm login             # npm account
npm publish           # Publish @kintales/tree-view@1.0.0
```

### 2. Configure EAS Project

```bash
cd kintales-app
eas build:configure   # Generates projectId in app.json
```

This updates `app.json` → `extra.eas.projectId` with the real project ID.

### 3. Install dependencies

```bash
npm install --legacy-peer-deps
```

## Build Profiles

| Profile | Distribution | Android | iOS | Use Case |
|---------|-------------|---------|-----|----------|
| development | internal | APK | device | Dev client with hot reload |
| preview | internal | APK | device | Testing builds |
| production | store | AAB | IPA | App Store / Play Store |

## Building

### Preview Build (Testing)

```bash
# Android APK
eas build --profile preview --platform android

# iOS (requires Apple Developer account)
eas build --profile preview --platform ios
```

### Production Build

```bash
# Android AAB (for Play Store)
eas build --profile production --platform android

# iOS IPA (for App Store)
eas build --profile production --platform ios
```

## Submitting to Stores

### iOS App Store

1. Create app in [App Store Connect](https://appstoreconnect.apple.com)
2. Configure `eas.json` → `submit.production.ios`:
   - `appleId`: your Apple ID email
   - `ascAppId`: App Store Connect app ID
   - `appleTeamId`: your team ID
3. Submit:

```bash
eas submit --profile production --platform ios
```

### Google Play Store

1. Create app in [Google Play Console](https://play.google.com/console)
2. Create service account (Google Cloud Console) and download JSON key
3. Save as `google-play-service-account.json` in project root
4. Submit:

```bash
eas submit --profile production --platform android
```

## OTA Updates

For JavaScript/asset-only changes (no native module changes):

```bash
eas update --branch production --message "Fix: dashboard event display"
```

## Environment Variables

All build profiles use production API:

| Variable | Value |
|----------|-------|
| EXPO_PUBLIC_API_URL | https://api.kintales.net |
| EXPO_PUBLIC_WS_URL | wss://api.kintales.net |

## Version Management

Before each release:

1. Update `version` in `app.json`: "0.1.0" -> "0.2.0"
2. iOS `buildNumber` and Android `versionCode` auto-increment via `appVersionSource: "remote"`

## Push Notifications Setup

1. Run `eas build:configure` to get real projectId
2. iOS: EAS manages APNs certificates automatically
3. Android: FCM is configured through Expo Push Service

## Checklist Before First Release

- [ ] @kintales/tree-view published to npm
- [ ] EAS projectId configured (real, not placeholder)
- [ ] Apple Developer account active
- [ ] Google Play Console account active
- [ ] App icons verified (1024x1024 for iOS, adaptive for Android)
- [ ] Splash screen verified
- [ ] Privacy Policy URL ready
- [ ] Preview build tested on physical devices
- [ ] All features verified on preview build
- [ ] Production build created
- [ ] Submitted to stores

## Known Notes

- `expo-av` is deprecated in SDK 54 — future migration to `expo-audio`/`expo-video` needed
- Push notifications require real EAS projectId for token generation
- `google-play-service-account.json` is gitignored — do not commit
