# WayUp Technical Review

## Document Info
- Product: `WayUp`
- Version: `v0.1`
- Last Updated: `2026-03-08`

## 1. Executive Summary
WayUp should be built as a cross-platform mobile app with a backend that supports auth, session state, reporting, and lightweight recommendation logic. The most pragmatic MVP path is:

- mobile: `React Native + Expo + TypeScript`
- backend: `Postgres + Auth + server-side API functions`
- detection strategy: `soft commute detection + manual fallback`
- intervention strategy: `suggestion and redirection`, not hard app blocking

The core technical risk is not UI. It is OS policy and background execution behavior:
- background location permissions are sensitive on both iOS and Android
- push notifications and background tasks require development builds and native config
- exact blocking of YouTube/Instagram for a self-control app is not a reliable cross-platform MVP path

Because of that, the first release should avoid app-blocking and instead focus on:
- commute detection
- notification or in-app prompt
- one-tap action recommendation
- session tracking and reporting

## 2. What Is Technically Feasible vs Risky

### Feasible for MVP
- manual commute start
- morning/evening routine setup
- background-friendly location-based commute detection
- geofencing-based repeated route assistance
- push or local notifications
- session recommendation and reporting

### Risky but feasible with iteration
- reliable auto-detection across devices and vendors
- exact commute duration prediction
- battery-friendly route learning
- prompt timing quality in dense urban commuting

### Not recommended for MVP
- cross-platform hard blocking of social/video apps
- detecting that the user opened YouTube Shorts or Instagram Reels in a general consumer app
- real-time interception of third-party app launches on iOS

## 3. Key Platform Constraints

### 3-1. React Native / Expo reality
React Native’s official site recommends using a framework like Expo to build a new app, and Expo provides access to routing and native modules while still allowing native changes when needed. For WayUp, this matters because background location, notifications, and permission handling are not trivial UI-only concerns. Source: [React Native](https://reactnative.dev/) and [Expo TaskManager](https://docs.expo.dev/versions/latest/sdk/task-manager/).

### 3-2. Background location constraints
Expo’s location docs note:
- background location stops if the user terminates the app
- Android will not automatically restart a terminated app on location/geofencing events
- iOS background location requires the `location` background mode
- background location on iOS is not supported in Expo Go and requires a development build
- iOS geofencing is limited to 20 monitored regions

Implication:
- WayUp cannot depend on perfect always-on tracking
- manual start and routine shortcuts must exist as fallback
- route-based prompting should be conservative

Source: [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/), [Expo TaskManager](https://docs.expo.dev/versions/latest/sdk/task-manager/).

### 3-3. Android background permission constraints
Android’s official docs state that on Android 11+ the system dialog no longer includes `Allow all the time`; users must enable background location on a settings page. Android also limits background location updates to only a few times each hour on Android 8.0+.

Implication:
- WayUp must request location incrementally
- background permission should not be requested on first launch
- the product must still be useful with only foreground permission

Source: [Android background permission](https://developer.android.com/develop/sensors-and-location/location/permissions/background), [Android background location access](https://developer.android.com/develop/sensors-and-location/location/background).

### 3-4. iOS location authorization constraints
Apple’s docs say apps should prefer `When In Use` authorization whenever possible, and `Always` must be justified when background delivery is needed. Expo also notes that iOS `Allow Once` cannot be distinguished from `Allow While Using the App`, and a same-session background request can silently fail after `Allow Once`.

Implication:
- ask for foreground permission first
- delay `Always` permission until the user has seen clear value
- build a settings recovery path for permission upgrade

Source: [Apple location authorization](https://developer.apple.com/documentation/bundleresources/choosing-the-location-services-authorization-to-request), [Apple usage description key](https://developer.apple.com/documentation/bundleresources/information-property-list/nslocationalwaysandwheninuseusagedescription), [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/).

### 3-5. Why app blocking is the wrong MVP
Apple’s Family Controls capability is designed for parental controls and requires entitlements. Apple’s glossary says Family Controls requires Family Sharing for user enrollment, and Apple’s configuration docs require the Family Controls entitlement for distribution.

Inference:
- this is not a clean fit for a mainstream self-control product where a single adult user wants to regulate their own usage
- even if technically possible in a subset of cases, it should not define the core MVP

Source: [Apple Family Controls glossary](https://developer.apple.com/help/glossary/family-controls/), [Configuring Family Controls](https://developer.apple.com/documentation/xcode/configuring-family-controls).

## 4. Recommended Architecture

## 4-1. Mobile App
Recommended:
- `React Native`
- `Expo`
- `TypeScript`
- `Expo Router`
- `expo-location`
- `expo-task-manager`
- `expo-notifications`

Why:
- fastest path to a polished iOS/Android app
- strong support for location and notification workflows
- native escape hatches still available
- Expo is directly recommended by React Native for new apps

Important:
- do not rely on Expo Go for core feature verification
- use development builds from the start because background location and push notification workflows need them

## 4-2. Backend
Recommended MVP backend:
- `Postgres`
- `Auth provider`
- `server-side functions/API`

Pragmatic choice:
- `Supabase` is a good MVP backend because its docs bundle Postgres, Auth, Realtime, Storage, and Edge Functions, and it offers client libraries for JavaScript, Swift, and Kotlin.

Inference:
- for a solo or small founding team, Supabase reduces infrastructure setup cost
- if the product later needs a more custom event ingestion or recommendation service, the API layer can be separated without rewriting the mobile app

Source: [Supabase Docs](https://supabase.com/docs)

## 4-3. Detection Strategy
MVP detection should not be pure background GPS polling.

Recommended detection stack:
- user-selected morning/evening routine windows
- coarse location and movement signals
- route hash learning from repeated commute sessions
- manual start button on home
- optional geofencing for known origin/destination clusters

This gives:
- lower battery cost
- less permission friction
- fewer false positives than a naive always-on tracker

## 4-4. Notification Strategy
Use notifications as a suggestion layer, not as a guaranteed trigger.

Recommended:
- local notification for predicted commute start
- push notification for scheduled reminders or remote tuning experiments
- in-app home card fallback when notification permission is denied

Expo notes that remote push notifications on Android are not available in Expo Go from SDK 53 and require a development build.

Source: [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)

## 5. How To Build The App

### Phase 1: Prove the product loop without hard background dependence
Build:
- onboarding
- goal selection
- morning/evening routine setup
- manual session start
- action recommendation
- session completion
- daily report

Why:
- validates core value before the hardest OS-level features

### Phase 2: Add commute-aware prompting
Build:
- foreground location permission flow
- route learning
- lightweight commute detection
- local notification prompt
- skip feedback and suppression logic

Why:
- moves from manual utility to contextual product

### Phase 3: Add background-aware behavior
Build:
- background location permission upgrade flow
- Expo TaskManager background tasks
- geofence-based wake-ups for repeat routes
- push token registration

Why:
- only after user value is proven and permission education is ready

### Phase 4: Optimize
Build:
- recommendation ranking improvements
- better false-positive suppression
- battery instrumentation
- A/B test framework

## 6. Suggested App Folder Shape
```text
app/
  _layout.tsx
  index.tsx
  onboarding/
  home/
  session/
  report/
  settings/

src/
  components/
  features/
    auth/
    onboarding/
    routines/
    commute/
    session/
    reports/
    settings/
  lib/
    api/
    storage/
    permissions/
    notifications/
    location/
    analytics/
  types/
```

## 7. Suggested Delivery Plan for a Small Team

### 1 PM/Founder
- PRD
- hypothesis tracking
- KPI definition
- UX copy

### 1 Mobile Engineer
- Expo app setup
- screens
- session flow
- permission flows
- notification integration

### 1 Backend Engineer or strong full-stack engineer
- auth
- database
- API
- report aggregation
- analytics ingestion

### Optional product designer
- onboarding
- prompt card
- report UI

## 8. Recommended MVP Stack Decision

### Final recommendation
- Mobile: `React Native + Expo + TypeScript`
- Backend: `Supabase (Postgres + Auth + Edge Functions)` or equivalent Postgres-backed REST API
- Notifications: `expo-notifications`
- Background tasks: `expo-task-manager`
- Location: `expo-location`

### Why this is the best current fit
- matches the product’s need for cross-platform speed
- supports native capabilities needed for commute detection
- avoids overcommitting to a heavy native-only codebase too early
- still leaves room to add native modules later if needed

## 9. What I Would Explicitly Avoid
- building iOS and Android as separate native apps for MVP
- defining the MVP around social-app blocking
- asking for background permission on first launch
- storing full raw GPS history by default
- overbuilding AI recommendation logic before session demand exists

## 10. Technical Decision Summary

### Decision
Build WayUp as a cross-platform mobile app with React Native + Expo, backed by Postgres and a lightweight API layer.

### Reason
The product’s hardest problem is OS-constrained background behavior, not custom rendering performance. Expo/React Native is fast enough for the UI and gives the needed native capabilities with less overhead than separate native apps.

### Constraint
Commute detection will be probabilistic, not perfect. Hard app-blocking is not a reliable consumer MVP path.

### Consequence
The first versions should optimize for:
- high-value prompts
- low false positives
- graceful fallback to manual start
- strong permission education
