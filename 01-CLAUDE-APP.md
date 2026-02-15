# CLAUDE.md — KinTales App (Mobile)

> This is the main KinTales mobile application built with Expo (React Native).
> Related projects: kintales-server, @kintales/tree-view, @kintales/name-days, kintales-infra

---

## WHO YOU ARE

You are a **senior full-stack architect and mentor** working with a developer who is advanced in JavaScript/React but has no experience working in a professional software team or with React Native. Your job is to:

1. Guide them through building a production-quality mobile application step by step.
2. **Explain WHY** before doing anything — teach the reasoning, not just the code.
3. Enforce professional engineering practices (SOLID, DRY, KISS, YAGNI, Separation of Concerns, Single Source of Truth, Fail Fast, Defensive Programming, Meaningful Names).
4. Never skip steps. Never cut corners. Never write "quick and dirty" code.
5. When the developer asks you to do something, first confirm it aligns with the current phase. If not — say so and suggest the right order.
6. When introducing React Native concepts that differ from React web, explain the difference briefly.

---

## SETUP (Run once)

```bash
/plugin marketplace add affaan-m/everything-claude-code
/plugin install everything-claude-code@everything-claude-code
```

```bash
git clone https://github.com/affaan-m/everything-claude-code.git /tmp/ecc
mkdir -p ~/.claude/rules
cp -r /tmp/ecc/rules/common ~/.claude/rules/common
cp -r /tmp/ecc/rules/typescript ~/.claude/rules/typescript
rm -rf /tmp/ecc
```

---

## PROJECT: KinTales

**KinTales** is a **mobile-first** family heritage application — a social network + interactive family tree. Families preserve their stories, memories, and genealogy across generations. Available on **iOS, Android, and Web** from a single codebase.

**Core vision**: Grandchildren visiting grandparents. They open KinTales on a tablet, tap a great-grandmother's photo in the tree, hear her voice telling a story, see old photos, read memories. The app feels **warm, intimate, sentimental** — like a family photo album by the fireplace.

**Target users**: Bulgarian families, initially. Primary language: Bulgarian. Secondary: English. Primary use case: grandparents sharing heritage with grandchildren — UI must be usable by elderly people AND navigable by children.

---

## SENSITIVE FAMILY DATA POLICY

Families are complex. KinTales handles ALL situations **without discrimination, judgment, visual differentiation, or special treatment**:

### Relationship & Family Structure
- Multiple marriages/divorces, step-siblings, half-siblings, step-parents, adoptive parents, adoption, children born out of wedlock, unknown parents ("Unknown" is valid), same-sex couples, polygamy, large age gaps, interracial/interfaith marriages, underage/early marriages (historical), incest/consanguinity — ALL recorded neutrally, ALL rendered identically in UI.

### Cause of Death & Difficult Events
- Suicide, murder, war death, miscarriage/stillbirth, infant mortality, addiction/overdose, execution — ALL recorded as neutral facts. No special icons, colors, or warnings.

### Life Circumstances
- Mental illness, disability, imprisonment, substance abuse, domestic violence, abandonment, estrangement, poverty, homelessness, missing persons, infidelity — ALL can be mentioned in bio/stories without filtering.

### Rules
1. No content filtering on stories.
2. No visual differentiation between "traditional" and "non-traditional" structures.
3. No "Are you sure?" dialogs for sensitive data.
4. No AI moderation on family stories.
5. Relationship types are neutral labels: Parent, Child, Spouse, Sibling, Adopted, Step-parent, Step-child, Step-sibling, Guardian — ALL rendered identically.
6. Cause of death = optional free-text field. No dropdown, no categories.
7. Tree visualization: ALL relationship types have equal visual weight.

---

## EMOTIONAL DESIGN

### Audio & Voice (First-class feature)
- Upload voice recordings (stories, songs, messages).
- Record audio directly in-app with device microphone.
- Big play button, prominent on person's profile.
- Elderly users can record stories as voice — no transcription needed. The voice IS the story.
- Support: MP3, WAV, M4A, OGG. Compress to AAC before upload.

### Visual Warmth
- Warm color palette: earth tones, amber, soft cream. No cold corporate blues.
- Photos: large, rounded corners, subtle shadows — like printed photographs.
- Family tree: organic feel, not corporate org chart.
- Deceased relatives: respectful, warm memorial tone.
- Sepia/vintage tones for older timeline events.
- Person without photo: warm placeholder with initials on vintage-textured background. NOT a gray square.

### Accessibility
- Default body text: 16px minimum.
- Large Text Mode in settings: increases all fonts by 30%.
- High contrast mode for poor vision.
- Touch targets: minimum 48x48px.
- No hidden gestures, no swipe-to-delete without confirmation.
- Icons always accompanied by text labels.
- Screen reader support (VoiceOver/TalkBack): accessibility labels on all interactive elements from Day 1.

### Date Handling
- Date picker must support range 1700-2100 (not just 1900+).
- Allow partial dates: year only ("~1890"), year+month, or full date.
- birth_date stored as: { year: INT (required), month: INT (nullable), day: INT (nullable) }

### Content Types per Person
- Photos (multiple, with captions and dates)
- Voice recordings (multiple, with titles and dates)
- Stories (written memories by any family member)
- Key dates (birth, death, marriage, milestones)
- Bio (short description)

---

## TECH STACK

| Layer | Technology | Why |
|-------|-----------|-----|
| Mobile | Expo SDK 54+ (React Native) | iOS + Android + Web, one codebase |
| Routing | Expo Router | File-based, like Next.js |
| Language | JavaScript (JSX) | Developer's primary language |
| Styling | NativeWind (Tailwind for RN) | Same Tailwind classes, native rendering |
| i18n | i18next + react-i18next | Bulgarian (default) + English |
| Auth | JWT (stored in expo-secure-store) | Encrypted on-device token storage |
| API Client | Axios | Auto-attach JWT, auto-refresh |
| Tree Viz | @kintales/tree-view | Own library, react-native-svg |
| Audio | expo-av | Record + playback |
| Camera | expo-image-picker | Photo from camera/gallery |
| Image Compress | expo-image-manipulator | HEIC→JPEG, compress to ~1MB before upload |
| QR Code | react-native-qrcode-svg | Legacy key QR generation |
| Testing | Vitest + Detox | Unit + E2E |
| Build | EAS Build | Cloud builds for iOS/Android |

---

## PROJECT STRUCTURE

```
kintales-app/
├── app/                        # Expo Router
│   ├── (auth)/
│   │   ├── login.jsx
│   │   ├── register.jsx
│   │   ├── forgot-password.jsx
│   │   └── legacy.jsx          # Legacy key redemption
│   ├── (tabs)/
│   │   ├── _layout.jsx         # Tab config
│   │   ├── index.jsx           # Dashboard (events, birthdays, name days)
│   │   ├── tree.jsx            # Family tree
│   │   ├── feed.jsx            # Stories feed
│   │   └── profile.jsx         # User profile & settings
│   ├── person/[id].jsx         # Person profile (storytelling experience)
│   ├── person/[id]/edit.jsx
│   ├── person/[id]/photos.jsx
│   ├── person/[id]/audio.jsx
│   ├── timeline.jsx
│   ├── onboarding.jsx          # First-time user flow (3-4 warm screens)
│   ├── settings/
│   │   ├── index.jsx
│   │   ├── guardians.jsx
│   │   ├── legacy-key.jsx
│   │   ├── export-data.jsx     # "Download everything" ZIP export
│   │   ├── delete-account.jsx  # GDPR right to erasure
│   │   └── accessibility.jsx   # Large text, high contrast
│   ├── _layout.jsx             # Root layout (auth check, i18n, error boundary)
│   └── index.jsx               # Splash → onboarding or dashboard
├── components/
│   ├── ui/                     # Button, Modal, Card, Input, AudioPlayer, AudioRecorder, Toast
│   ├── auth/                   # LoginForm, RegisterForm, OAuthButtons, ForgotPasswordForm
│   ├── tree/                   # TreeView wrapper, PersonNode
│   ├── feed/                   # Story, Comment, CreateStory
│   ├── person/                 # PersonProfile, PhotoGallery, VoiceRecordings, BulkPhotoUpload
│   ├── dashboard/              # BirthdayCard, NameDayCard, CommemorationCard, OnThisDayCard, DailyStoryPrompt
│   ├── death/                  # DeathRecordForm, DeathConfirmationBanner
│   ├── legacy/                 # LegacyKeyCard, QRCodePrintable
│   ├── sharing/                # ShareStoryImage (generates shareable card)
│   └── layout/                 # Header, TabBar
├── hooks/
│   ├── useAuth.js
│   ├── useFamilyTree.js
│   ├── useRelatives.js
│   ├── useStories.js
│   ├── useAudio.js
│   ├── useEvents.js
│   ├── useDeathRecord.js
│   ├── useNotifications.js     # In-app + push (FCM)
│   └── useApi.js
├── services/
│   ├── api.js                  # Axios wrapper: JWT attach, refresh, error handling
│   ├── auth.service.js
│   ├── tree.service.js
│   ├── relatives.service.js
│   ├── stories.service.js
│   ├── events.service.js
│   ├── death.service.js
│   ├── guardian.service.js
│   ├── legacy.service.js
│   ├── export.service.js       # ZIP download
│   └── storage.service.js
├── lib/
│   ├── auth/
│   │   ├── tokenStorage.js     # expo-secure-store
│   │   └── authContext.js
│   ├── i18n/
│   │   ├── index.js
│   │   ├── bg.json
│   │   └── en.json
│   ├── validators/             # Zod schemas
│   └── utils.js
├── constants/
│   ├── relationships.js
│   ├── routes.js
│   └── colors.js               # Warm palette
├── assets/
│   ├── fonts/
│   └── images/
├── app.json
├── eas.json
├── CLAUDE.md
└── README.md
```

---

## DEVELOPMENT PHASES

### PHASE 1: Foundation

#### 1.1: Expo Project Setup

```
/plan "Initialize KinTales Expo project with Expo Router. Set up: 1) File-based routing with (auth) and (tabs) groups, 2) NativeWind with warm color palette (earth tones, amber, cream in tailwind.config.js), 3) i18next with bg.json (default) and en.json, 4) Root layout with auth state check, 5) API client (Axios) with JWT from expo-secure-store and auto-refresh on 401, 6) Error boundary component, 7) Onboarding screen (3-4 warm screens for first-time users with large text and big buttons). Configure app.json: name 'KinTales', warm splash screen."
```
```
/code-review
```
```bash
git commit -m "chore: Expo project with router, NativeWind, i18n, onboarding"
```

#### 1.2: Authentication

```
/plan "Add auth screens for KinTales. 1) Register: email, password (min 8 chars), confirm password, full name, language selector (bg/en). Validate all fields with Zod. 2) Login: email/password + 'Sign in with Google' button. 3) Forgot Password: enter email → API sends reset link → new password screen. 4) Store tokens in expo-secure-store. 5) AuthContext provider: user state, auto-refresh, logout. 6) Auto-redirect to login on 401. All screens: warm design, large touch targets (48px+), friendly error messages in selected language. Support multiple simultaneous sessions (phone + tablet)."
```
```
/code-review
```
```bash
git commit -m "feat: auth screens with email, Google OAuth, password reset"
```

#### 1.3: User Profile

```
/plan "Profile screen: view/edit full name, bio, avatar, language (bg/en). Avatar: expo-image-picker (camera or gallery) → expo-image-manipulator (resize to 400x400, HEIC→JPEG, compress to <500KB) → upload to API. Reusable Avatar component: shows initials on warm gradient when no photo. Warm, inviting design. Not a settings form."
```
```
/code-review
```
```bash
git commit -m "feat: user profile with avatar upload and image compression"
```

---

### PHASE 2: Family Tree

#### 2.1: Add Relatives

```
/plan "Create relatives in KinTales tree. Form: full name (required, 'Unknown' valid), birth date (custom picker supporting 1700-2100, year-only or full date), death date (for HISTORICAL entries only — recent deaths use the confirmation system), cause of death (free text, no categories, no filtering), avatar (image picker + compress), bio, relationship type selector (parent, child, spouse, sibling, step_parent, step_child, step_sibling, adopted, guardian — all identical in UI). Multiple spouses allowed. For spouse: optional marriage_date, divorce_date. Validate: death after birth. API: POST /api/relatives, GET /api/trees/:id/relatives. TDD for validation."
```
```
/tdd
/code-review
```
```bash
git commit -m "feat: add relatives with extended date support and validation"
```

#### 2.2: Tree Visualization

```
/plan "Integrate @kintales/tree-view (or build simplified version with react-native-svg + react-native-gesture-handler). Nodes: circular photo (or initials), name, birth-death years. ALL relationship types: SAME visual style. Gestures: pan, zoom, pinch, tap→navigate to person/[id]. Layout: parents above, children below, spouses beside. Multiple marriages handled. 50+ nodes. Warm organic style. Handle: single person, no connections, edge cases."
```
```
/code-review
```
```bash
git commit -m "feat: interactive family tree visualization"
```

#### 2.3: Person Profile (Storytelling Experience)

```
/plan "Person profile screen (person/[id].jsx) — the EMOTIONAL HEART of the app. Warm book-like layout: 1) Hero photo (or warm initials placeholder with vintage texture), 2) Name + dates (formatted: '1923 — 2001'), 3) Bio in warm typography, 4) Photo gallery (horizontal scroll, tap for lightbox with swipe), 5) Voice recordings: title, date, duration, BIG play button, waveform visualization during playback, 6) Stories by family members (reverse chronological, author name + date), 7) 'Interview mode' button: opens audio recorder with prompts like 'Разкажете спомен за [Име]' — records voice, saves as audio recording for this person. No transcription. The voice IS the story. 8) Edit/delete with confirmation. Layout flows like a MEMORIAL PAGE. Bulk photo upload: select multiple photos at once for one person."
```
```
/code-review
```
```bash
git commit -m "feat: person profile with photos, audio, interview mode"
```

#### 2.4: Photo & Audio Upload

```
/plan "Photo upload: multiple per person, expo-image-picker → expo-image-manipulator (compress HEIC→JPEG, max 1MB) → upload to API. Caption + date_taken. Audio upload: two modes — 1) Record in-app (expo-av, AAC format, show timer + waveform), 2) Upload from device. Max 20MB. Title + date. Reusable AudioPlayer (play/pause, progress bar with seek, time display). PhotoGallery (grid + swipeable lightbox). AudioRecorder (record button, timer, stop, preview, upload). BulkPhotoUpload (select many, add captions, upload all)."
```
```
/code-review
```
```bash
git commit -m "feat: photo gallery, audio player, recorder, bulk upload"
```

#### 2.5: Death Recording with Confirmation

```
/plan "Death confirmation system. On a living person's profile, respectful menu option: 'Запиши смъртта на [Име]'. Form: death date (required), time (optional), cause (free text, optional). Creates death_record with PENDING status. Confirmations needed: 3+ members→2, 2 members→1, 1 member→auto-confirm after 48h with warning. Other members see respectful banner: '[Мария] записа, че [Дядо Петър] е починал(а) на [дата]. Потвърждавате ли?' [Потвърждавам / Не потвърждавам]. On confirmed: update relative, generate commemorations (40 days, 6 months, 1 year, annual). On disputed: need 2 from OTHERS. Tone: extremely respectful, warm. TDD for confirmation logic."
```
```
/tdd
/code-review
```
```bash
git commit -m "feat: death recording with family confirmation"
```

E2E at Phase 2 boundary:
```
/e2e "User logs in, adds parent+child, uploads photo+voice recording, views person profile, plays audio, edits name, records death of parent, second user confirms, commemorations generated."
```

---

### PHASE 3: Social Feed, Events & Heritage Preservation

#### 3.1: Dashboard (Home Screen)

```
/plan "Dashboard (tabs/index.jsx) — first screen on app open. Shows today's and upcoming events in warm card-based layout. API: GET /api/trees/:id/events?from=DATE&to=DATE computes: 1) BIRTHDAYS — living: 'Днес е рожденият ден на [Име] — навършва [X] години'. Deceased: '[Име] щеше да навърши [X] години'. 2) NAME DAYS — match first name against @kintales/name-days. 3) COMMEMORATIONS — 40 days, 6 months, 1 year, annual. 4) MARRIAGE ANNIVERSARIES. 5) ON THIS DAY — stories/events from same date in previous years: 'Преди 3 години [Мария] написа тази история...'. 6) DAILY STORY PROMPT — soft banner: 'Имате ли спомен за [random relative], който искате да запазите?' Sections: Today, This Week, This Month. Empty state: warm message. Each card: person avatar, tappable → person profile."
```
```
/code-review
```
```bash
git commit -m "feat: dashboard with events, name days, commemorations, on-this-day"
```

#### 3.2: Stories Feed

```
/plan "Stories feed (tabs/feed.jsx). Create: text + photos (up to 5, image picker) + audio (record or upload). Optional link to relative ('Тази история е за...'). Display: reverse chronological, author avatar+name, relative timestamp ('преди 2 часа'), content, photos (scrollable), audio player. Infinite scroll (20/page). Share button on each story: generates shareable image card (story text + photo + KinTales branding) or copies text. CreateStory: warm design, placeholder 'Разкажете история от семейството...', big photo+audio buttons. Feels like a family scrapbook."
```
```
/code-review
```
```bash
git commit -m "feat: stories feed with photos, audio, sharing"
```

#### 3.3: Comments (Real-time)

```
/plan "Comments on stories. Author avatar, name, text, relative timestamp. Collapsed if >3 ('Виж всички X коментара'). Add/delete own comments. Real-time via WebSocket (Socket.io): new comments appear instantly. Each user can ONLY delete their OWN content. Tree owner can remove a member from the tree but CANNOT delete other people's stories or comments. Keyboard-aware comment input."
```
```
/code-review
```
```bash
git commit -m "feat: comments with real-time WebSocket"
```

#### 3.4: Timeline

```
/plan "Timeline screen merging stories + events (births, deaths, marriages) chronologically. Each entry: date, subtle type icon (book/candle/rings — all same size, no hierarchy), title, preview. Filter: year range slider, specific relative. Sort: newest/oldest. Older events get sepia-toned backgrounds (gradual). Read-only. Feels like flipping a family history book."
```
```
/code-review
```
```bash
git commit -m "feat: family timeline"
```

#### 3.5: Guardian & Legacy Key

```
/plan "Heritage preservation. GUARDIAN: settings/guardians.jsx — add a guardian by email or KinTales user. They inherit tree access when all family members are deceased/inactive. LEGACY KEY: settings/legacy-key.jsx — generate unique code (FORMAT-YEAR-HEX, e.g. PETR-2026-A3F7). Options: a) email with beautiful template explaining KinTales, b) printable QR code page (warm design with family name, code, QR, instructions in BG+EN — designed to be kept in a Bible, drawer, with documents). Use react-native-qrcode-svg. Redemption: (auth)/legacy.jsx — enter code → register/login → get Editor access. TRIGGER: when only 1 living member remains, warm banner on dashboard: 'Вашето семейство има прекрасна история. Искате ли да я поверите на някого?' Buttons: Guardian, Legacy Key, 'Напомни ми по-късно' (30 days). ARCHIVE: all deceased + no guardian + no legacy key → DORMANT after 1 year, ARCHIVED after 3 years. Data NEVER deleted."
```
```
/tdd
/code-review
```
```bash
git commit -m "feat: guardian system, legacy keys, tree archiving"
```

#### 3.6: Data Export & GDPR

```
/plan "Data management. 1) EXPORT: settings/export-data.jsx — 'Изтегли всичко' button. API generates ZIP containing: all photos (original quality), all audio recordings, all stories as text files, family tree as JSON, person bios. Download via presigned URL. 2) DELETE ACCOUNT: settings/delete-account.jsx — GDPR right to erasure. Requires password confirmation. Deletes: profile, all stories authored by user, all comments by user, all uploaded files by user. Does NOT delete relatives from tree (they are family history, not personal data) — but removes the user's authorship. 'Анонимизирай' option for living relatives who request removal: replace name with 'Роднина', remove photo, keep relationships. 3) PRIVACY POLICY: link to kintales.net/privacy (required for App Store). 4) TERMS OF SERVICE: link to kintales.net/terms."
```
```
/code-review
```
```bash
git commit -m "feat: data export, GDPR delete account, anonymization"
```

#### 3.7: Push Notifications (Firebase Cloud Messaging)

```
/plan "Push notifications via FCM + expo-notifications. OPT-IN: user enables in settings. Morning notification (8:00 AM) with today's events: 'Днес е рожденият ден на [Име]!'. Death confirmation requests sent as push. Register device token on login, remove on logout. Server: node-cron job at 7:00 AM generates notifications, sends via FCM. Respect user's notification preferences."
```
```
/code-review
```
```bash
git commit -m "feat: push notifications with FCM"
```

Comprehensive E2E:
```
/e2e "Full journey: register with Google, onboarding, profile in Bulgarian, add 3 relatives with photos and voice recording, view tree, person profile, play audio, interview mode, create story, comment, dashboard with birthday, timeline, record death, confirm, commemorations on dashboard, generate legacy key, print QR, export data as ZIP."
```

---

### PHASE 4: Sharing & Collaboration — DEFERRED TO v2

> Phase 4 will NOT be implemented in MVP. Documented for future planning only.

- v2.1: Invite family members by email (owner/editor/viewer roles, RLS)
- v2.2: Tree merging (match common relatives between trees, approval flow, transactions)
- v2.3: Connecting archived trees (suggest matches to distant relatives)
- v2.4: Offline mode (cache tree + recent stories locally)
- v2.5: Video clips (up to 2 min per person, expo-av)
- v2.6: GEDCOM import (standard genealogy format from Ancestry/MyHeritage)
- v2.7: PDF/image export of full tree
- v2.8: Search within tree (name search for large trees)
- v2.9: Relationship calculator ("How am I related to...?")
- v2.10: Dark mode (warm dark tones, not pure black)
- v2.11: Photo scanning (use camera to scan old physical photographs with auto-crop)
- v2.12: Multiple trees per user (mother's side, father's side)
- v2.13: Story privacy levels (some stories visible only to 18+)
- v2.14: Family heirlooms (objects with ownership history — grandma's necklace, family Bible)
- v2.15: Annual "Family Report" (Spotify Wrapped style — stories written, photos added, milestones)
- v2.16: Origin map (birthplaces + residences on a map showing family migration)

---

## COMMAND REFERENCE

| Situation | Command |
|-----------|---------|
| Starting a new feature | `/plan "description"` |
| Complex business logic | `/tdd` |
| Before committing | `/code-review` |
| Build errors | `/build-fix` |
| User journeys complete | `/e2e "description"` |
| Understand code | `/learn` |
| Refactor | `/refactor` |
| Security | `/security-review` |

Rules:
1. Every feature starts with `/plan`.
2. Every feature ends with `/code-review`.
3. `/tdd` for validation, permissions, death confirmation.
4. `/e2e` at phase boundaries.
5. `/security-review` after auth (1.2) and death/legacy (2.5, 3.5).
6. Commit after every feature.

---

## GIT WORKFLOW

```bash
git commit -m "type: short description"
# feat, fix, chore, refactor, test, docs, style
```
```bash
git checkout -b feature/1.1-expo-setup
```

---

## ENVIRONMENT

```env
# .env
EXPO_PUBLIC_API_URL=https://api.kintales.net
EXPO_PUBLIC_WS_URL=wss://api.kintales.net
```

---

## QUALITY GATES

- [ ] Works on iOS simulator AND Android emulator
- [ ] Works in Bulgarian language
- [ ] `/code-review` passes, no critical issues
- [ ] No console errors/warnings
- [ ] No hardcoded secrets
- [ ] Follows project structure
- [ ] Clean git history
- [ ] Sensitive data tested: multiple spouses, step-children, unknown parent, sensitive cause of death, same-sex couple
- [ ] Death confirmation tested: 3+ members, 2 members, 1 member (48h), disputed
- [ ] API error cases tested (401, 403, 404, 422, 500)
- [ ] File uploads tested with invalid types/sizes
- [ ] Touch targets ≥ 48x48px
- [ ] Text readable (16px+ body)
- [ ] Screen reader labels on all interactive elements
- [ ] Dates from 1700+ work correctly
- [ ] Year-only dates display correctly

---

## CONTENT OWNERSHIP RULES

- Each user can ONLY delete their OWN stories, comments, and uploads.
- Tree owner can remove a member from the tree but CANNOT delete others' content.
- No user can moderate/censor another user's stories.
- GDPR delete: removes user's content, anonymizes authorship, does NOT delete relatives.

---

## TEACHING MODE

When developer asks "why?":
1. What the concept is (1-2 sentences)
2. Real analogy from everyday life
3. How it applies to KinTales
