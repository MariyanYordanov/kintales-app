# E2E Testing Guide — KinTales App

## Framework: Maestro

[Maestro](https://maestro.mobile.dev/) is a YAML-based mobile UI testing framework that works with Expo managed workflow.

## Prerequisites

```bash
# Install Maestro CLI
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify installation
maestro --version
```

### Running on iOS Simulator
- Requires macOS with Xcode installed
- Start an iOS simulator before running tests

### Running on Android Emulator
- Requires Android Studio with an emulator configured
- Start an Android emulator before running tests

## Environment Variables

Create a `.env.test` file (not committed to git):

```bash
TEST_EMAIL=your-test-account@example.com
TEST_PASSWORD=your-test-password
```

## Running Tests

### All flows
```bash
npm run test:e2e
```

### Platform-specific
```bash
npm run test:e2e:ios
npm run test:e2e:android
```

### Single flow
```bash
maestro test .maestro/flows/01-auth-login.yaml
```

### With environment variables
```bash
TEST_EMAIL=test@example.com TEST_PASSWORD=pass123 maestro test .maestro/flows
```

### By tag
```bash
maestro test --include-tags smoke .maestro/flows
maestro test --include-tags auth .maestro/flows
```

## Test Structure

```
.maestro/
├── config.yaml              # Global configuration
├── helpers/
│   └── login.yaml           # Reusable login flow
└── flows/
    ├── 01-auth-login.yaml        # Login flow
    ├── 02-auth-register.yaml     # Registration flow
    ├── 03-auth-forgot-password.yaml  # Password reset
    ├── 04-tree-add-relative.yaml     # Add family member
    ├── 05-tree-view-person.yaml      # View tree/list toggle
    ├── 06-story-create.yaml          # Create story
    ├── 07-story-comment.yaml         # Add comment
    ├── 08-profile-edit.yaml          # Edit profile
    ├── 09-settings-export.yaml       # Export data screen
    └── 10-settings-delete.yaml       # Delete account screen
```

## Tags

| Tag | Description |
|-----|-------------|
| `smoke` | Critical user flows (login, add relative, create story, profile) |
| `auth` | Authentication flows |
| `tree` | Family tree operations |
| `stories` | Story/feed operations |
| `comments` | Comment operations |
| `profile` | Profile management |
| `settings` | Settings screens |
| `destructive` | Flows that modify/delete data (use with caution) |

## testID Conventions

All interactive elements use `testID` props following this pattern:

```
{screen}-{element}-{type}
```

Examples:
- `login-email-input`
- `login-submit-button`
- `tree-add-fab`
- `profile-save-button`

## Writing New Flows

1. Add `testID` props to target components
2. Create a new YAML file in `.maestro/flows/`
3. Use `runFlow: ../helpers/login.yaml` to reuse login
4. Use `optional: true` for elements that may not appear
5. Use `takeScreenshot` for visual verification

## Troubleshooting

### App not detected
Make sure the app is running on the simulator/emulator:
```bash
npx expo start --ios   # or --android
```

### Element not found
- Check `testID` prop is set correctly
- Use `maestro studio` to inspect the view hierarchy
- Increase timeout: `timeout: 10000`

### Flaky tests
- Add `optional: true` to non-critical assertions
- Use `extendedWaitUntil` instead of `assertVisible` for async content
- Avoid relying on text that changes with i18n
