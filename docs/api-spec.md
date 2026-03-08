# WayUp API Specification

## Document Info
- Product: `WayUp`
- Version: `v0.1`
- Last Updated: `2026-03-08`
- Scope: `MVP`

## 1. API Principles
- Mobile clients talk to the backend over JSON/HTTPS.
- All timestamps use ISO 8601 UTC strings.
- All IDs use UUID.
- The API is designed for `automatic commute suggestion`, `manual start`, `session execution`, `reflection`, and `reporting`.
- Authentication is required for all user-specific endpoints except auth bootstrap.

## 2. Recommended Backend Shape

### Option A: Supabase-first MVP
- Auth: Supabase Auth
- Database: Postgres
- API layer:
  - direct table access for simple profile/settings/reference reads
  - Edge Functions or a small API layer for session suggestion, report aggregation, and detection ingestion

### Option B: Custom API server
- Auth: JWT-based auth
- App API: REST
- Database: Postgres

This spec assumes a REST API regardless of whether the implementation uses Supabase Edge Functions, NestJS, FastAPI, or another backend.

## 3. Authentication

### 3-1. Auth Model
- `Authorization: Bearer <access_token>`
- Access token represents one app user
- Refresh token handling is client-side and delegated to the auth provider

### 3-2. Minimal User Auth Options
- Apple Sign In
- Google Sign In
- Email magic link
- Anonymous guest session for internal alpha only

## 4. Common Conventions

### 4-1. Headers
```http
Authorization: Bearer <token>
Content-Type: application/json
X-Client-Version: 1.0.0
X-Platform: ios | android
```

### 4-2. Success Envelope
```json
{
  "data": {},
  "meta": {
    "request_id": "4b4e5c7f-6d84-4d0a-99b9-4d8d39d43ec1"
  }
}
```

### 4-3. Error Envelope
```json
{
  "error": {
    "code": "BACKGROUND_PERMISSION_REQUIRED",
    "message": "Background location permission is required for this action.",
    "details": {}
  },
  "meta": {
    "request_id": "4b4e5c7f-6d84-4d0a-99b9-4d8d39d43ec1"
  }
}
```

### 4-4. Standard Error Codes
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `CONFLICT`
- `RATE_LIMITED`
- `BACKGROUND_PERMISSION_REQUIRED`
- `SESSION_ALREADY_COMPLETED`
- `INVALID_SESSION_STATE`

## 5. Reference Data

### 5-1. GET `/v1/reference/goals`
Returns goal categories used in onboarding and settings.

Response:
```json
{
  "data": [
    {
      "goal_id": "f69d0c1e-4b13-40d4-8b30-6d4ea68f7cb8",
      "slug": "english",
      "name": "English",
      "description": "Short language learning actions",
      "is_active": true
    }
  ]
}
```

### 5-2. GET `/v1/reference/actions`
Returns fallback/default action templates used by recommendation logic.

Query params:
- `period_type`: `morning | evening | any`
- `goal_slug`: optional

## 6. Profile and Settings

### 6-1. GET `/v1/me`
Returns current user profile and app settings.

Response:
```json
{
  "data": {
    "user_id": "c76f54c2-f2c5-472b-8f54-60e4f3bca4d6",
    "timezone": "Asia/Seoul",
    "onboarding_completed_at": "2026-03-08T13:00:00Z",
    "goals": [
      {
        "goal_id": "f69d0c1e-4b13-40d4-8b30-6d4ea68f7cb8",
        "slug": "english"
      }
    ],
    "settings": {
      "prompt_enabled": true,
      "prompt_max_per_day": 2,
      "morning_prompt_enabled": true,
      "evening_prompt_enabled": true
    }
  }
}
```

### 6-2. PATCH `/v1/me`
Updates basic user profile data.

Request:
```json
{
  "timezone": "Asia/Seoul"
}
```

### 6-3. PUT `/v1/me/onboarding`
Persists onboarding choices in one request.

Request:
```json
{
  "timezone": "Asia/Seoul",
  "goals": ["english", "journaling"],
  "routines": [
    {
      "period_type": "morning",
      "primary_mode": "prepare",
      "secondary_modes": ["english", "news"]
    },
    {
      "period_type": "evening",
      "primary_mode": "recovery",
      "secondary_modes": ["reading", "journaling"]
    }
  ],
  "settings": {
    "prompt_enabled": true,
    "prompt_max_per_day": 2
  }
}
```

### 6-4. PATCH `/v1/me/settings`
Updates settings and notification preferences.

Request:
```json
{
  "prompt_enabled": true,
  "prompt_max_per_day": 2,
  "morning_prompt_enabled": true,
  "evening_prompt_enabled": false
}
```

## 7. Device Registration

### 7-1. PUT `/v1/devices/current`
Registers the current mobile device and push token.

Request:
```json
{
  "device_id": "f6a7477f-b516-4d3f-bc6e-27f7dcde3701",
  "platform": "ios",
  "app_version": "1.0.0",
  "push_token": "ExponentPushToken[xxxxx]",
  "notification_permission": "granted",
  "location_permission_scope": "when_in_use",
  "background_location_permission": "denied"
}
```

## 8. Goal and Routine Management

### 8-1. PUT `/v1/me/goals`
Replaces selected user goals.

Request:
```json
{
  "goal_slugs": ["english", "intentional-rest"]
}
```

Business rules:
- minimum 1 goal
- maximum 3 goals

### 8-2. GET `/v1/me/routines`
Returns morning/evening routines.

### 8-3. PUT `/v1/me/routines`
Replaces user routine config.

Request:
```json
{
  "routines": [
    {
      "period_type": "morning",
      "primary_mode": "prepare",
      "secondary_modes": ["english", "news"]
    },
    {
      "period_type": "evening",
      "primary_mode": "recovery",
      "secondary_modes": ["reading", "journaling"]
    }
  ]
}
```

## 9. Prompt Exceptions

### 9-1. GET `/v1/me/route-exclusions`

### 9-2. POST `/v1/me/route-exclusions`
Stores a route pattern to suppress prompts.

Request:
```json
{
  "route_hash": "fa1efcc05f10f8f7d763a5f28f7d7fc4",
  "label": "Office to home route"
}
```

### 9-3. DELETE `/v1/me/route-exclusions/{route_exclusion_id}`

### 9-4. GET `/v1/me/time-exclusions`

### 9-5. POST `/v1/me/time-exclusions`
Request:
```json
{
  "days_of_week": [1, 2, 3, 4, 5],
  "start_minute": 1320,
  "end_minute": 1439,
  "label": "Late night"
}
```

### 9-6. DELETE `/v1/me/time-exclusions/{time_exclusion_id}`

## 10. Commute Detection and Session Suggestion

### 10-1. POST `/v1/commute-detections`
Ingests a commute-like detection event from the device.

Request:
```json
{
  "detected_at": "2026-03-08T08:11:20Z",
  "source": "background-location",
  "confidence_score": 0.82,
  "period_type": "morning",
  "route_hash": "fa1efcc05f10f8f7d763a5f28f7d7fc4",
  "distance_meters": 6800,
  "estimated_duration_seconds": 1800,
  "app_state": "background"
}
```

Response:
```json
{
  "data": {
    "detection_id": "2d64cf0f-3c20-412f-9af9-16cf002fb7df",
    "should_prompt": true,
    "suppression_reason": null
  }
}
```

### 10-2. POST `/v1/session-suggestions`
Creates or returns the current suggestion for a detection/manual start.

Request:
```json
{
  "trigger_type": "auto-detected",
  "detection_id": "2d64cf0f-3c20-412f-9af9-16cf002fb7df"
}
```

Manual-start example:
```json
{
  "trigger_type": "manual",
  "period_type": "evening",
  "estimated_duration_seconds": 1200
}
```

Response:
```json
{
  "data": {
    "suggestion_id": "7fa7fd69-4d58-491f-9015-022b23c75d65",
    "period_type": "evening",
    "estimated_duration_seconds": 1200,
    "prompt_copy": {
      "title": "You are in commute mode",
      "body": "Want to do one short action before you drift?"
    },
    "actions": [
      {
        "action_id": "3e93f6b5-0446-4f20-9271-cdd3f28327bb",
        "title": "Reflect for 3 minutes",
        "duration_seconds": 180,
        "category": "journaling",
        "energy_level": "low"
      }
    ]
  }
}
```

## 11. Commute Sessions

### 11-1. POST `/v1/sessions`
Creates a session after the user accepts a suggestion.

Request:
```json
{
  "suggestion_id": "7fa7fd69-4d58-491f-9015-022b23c75d65",
  "selected_action_id": "3e93f6b5-0446-4f20-9271-cdd3f28327bb"
}
```

Response:
```json
{
  "data": {
    "session_id": "76b7d6f6-1f97-4fe2-993b-f0a79fc9a9fb",
    "status": "active",
    "started_at": "2026-03-08T09:12:30Z"
  }
}
```

### 11-2. POST `/v1/sessions/{session_id}/events`
Appends progress events during the session.

Event types:
- `started`
- `paused`
- `resumed`
- `action_switched`
- `user_backgrounded_app`
- `manual_stop`

Request:
```json
{
  "event_type": "paused",
  "occurred_at": "2026-03-08T09:15:30Z",
  "payload": {
    "reason": "subway_transfer"
  }
}
```

### 11-3. POST `/v1/sessions/{session_id}/skip`
Records that the user dismissed the suggestion instead of starting.

Request:
```json
{
  "skip_reason": "want-to-rest"
}
```

### 11-4. POST `/v1/sessions/{session_id}/complete`
Completes a session.

Request:
```json
{
  "completed_action_id": "3e93f6b5-0446-4f20-9271-cdd3f28327bb",
  "completion_state": "completed",
  "ended_at": "2026-03-08T09:28:00Z",
  "intentional_time_seconds": 540,
  "reflection": {
    "satisfaction_score": 4,
    "would_repeat": true,
    "mode_tag": "recovery"
  }
}
```

Completion states:
- `completed`
- `partial`
- `abandoned`
- `false-positive`

### 11-5. GET `/v1/sessions/{session_id}`
Returns session details for debugging or session resume.

## 12. Reporting

### 12-1. GET `/v1/reports/daily?date=2026-03-08`
Response:
```json
{
  "data": {
    "date": "2026-03-08",
    "total_sessions": 2,
    "intentional_time_seconds": 1140,
    "completed_actions": 2,
    "recovery_sessions": 1,
    "skip_sessions": 1
  }
}
```

### 12-2. GET `/v1/reports/weekly?start_date=2026-03-02`
Response:
```json
{
  "data": {
    "start_date": "2026-03-02",
    "end_date": "2026-03-08",
    "intentional_time_seconds": 5040,
    "completed_actions": 8,
    "days_with_sessions": 5,
    "top_goals": [
      {
        "goal_slug": "english",
        "count": 4
      }
    ]
  }
}
```

## 13. Analytics/Event Ingestion

### 13-1. POST `/v1/client-events/batch`
Batched fire-and-forget event ingestion for product analytics.

Request:
```json
{
  "events": [
    {
      "event_name": "session_prompt_shown",
      "occurred_at": "2026-03-08T09:10:01Z",
      "session_id": null,
      "payload": {
        "period_type": "morning",
        "confidence_score": 0.82
      }
    }
  ]
}
```

## 14. Push and Notification APIs

### 14-1. POST `/v1/notifications/test`
Optional internal endpoint for QA.

### 14-2. POST `/v1/notifications/session-reminder`
Server-triggered reminder for a planned or missed session.

## 15. Internal Recommendation Contract
This can be implemented behind `/v1/session-suggestions`.

Inputs:
- selected goals
- period type
- estimated commute duration
- prior session outcomes
- recent skips
- energy bias:
  - morning: medium/high
  - evening: low/medium

Output constraints:
- exactly 3 actions if possible
- at least 1 low-friction action
- evening sessions should include a recovery-safe choice

## 16. Security and Privacy Notes
- Never send raw GPS history in high volume if route hash is sufficient.
- Store coarse commute summaries server-side; keep detailed location traces short-lived or avoid persisting them.
- Route suppression should be based on hashed route signatures, not user-readable raw coordinates whenever possible.
- Session analytics should be separate from high-sensitivity location records.

## 17. Open API Questions
- Do we need server-generated prompt copy in MVP, or can the client own all strings?
- Should commute detection be entirely on-device with only summary upload?
- Will session suggestions be generated synchronously, or precomputed after repeated routes stabilize?
- Are reports generated live from session tables or from daily aggregate tables/materialized views?
