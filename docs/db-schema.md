# WayUp DB Schema

## Document Info
- Product: `WayUp`
- Version: `v0.1`
- Last Updated: `2026-03-08`
- Database: `PostgreSQL 16+`

## 1. Schema Design Goals
- Support commute-aware prompting and session tracking
- Minimize storage of raw high-sensitivity location data
- Support user-specific settings, route exclusions, and report aggregation
- Make MVP implementation simple enough for fast iteration

## 2. Recommended Extensions
- `pgcrypto` for UUID generation
- `citext` for case-insensitive email, if email auth is used
- `pg_trgm` optional for text search
- `postgis` optional if exact route geometry is stored

For MVP, `postgis` is optional because route-level logic can be implemented using hashed route signatures instead of full route geometry.

## 3. Core Enums

### 3-1. `period_type`
- `morning`
- `evening`
- `other`

### 3-2. `session_trigger_type`
- `auto_detected`
- `manual`
- `scheduled`

### 3-3. `session_status`
- `suggested`
- `active`
- `completed`
- `partial`
- `abandoned`
- `skipped`
- `false_positive`

### 3-4. `permission_scope`
- `unknown`
- `denied`
- `foreground_only`
- `background_allowed`

### 3-5. `energy_level`
- `low`
- `medium`
- `high`

### 3-6. `skip_reason`
- `want_to_rest`
- `bad_detection`
- `not_now`
- `already_busy`
- `other`

## 4. Tables

### 4-1. `users`
Represents an app user.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| auth_provider | text | not null | `apple`, `google`, `email`, `guest` |
| auth_subject | text | not null | provider user id |
| timezone | text | not null default `'Asia/Seoul'` | |
| locale | text | not null default `'ko-KR'` | |
| onboarding_completed_at | timestamptz | null | |
| created_at | timestamptz | not null default now() | |
| updated_at | timestamptz | not null default now() | |

Indexes:
- unique `(auth_provider, auth_subject)`

### 4-2. `user_settings`
Stores prompt and permission-related settings.

| Column | Type | Constraints |
|---|---|---|
| user_id | uuid | PK, FK -> users.id |
| prompt_enabled | boolean | not null default true |
| prompt_max_per_day | smallint | not null default 2 |
| morning_prompt_enabled | boolean | not null default true |
| evening_prompt_enabled | boolean | not null default true |
| quiet_mode_enabled | boolean | not null default false |
| location_permission_scope | permission_scope | not null default 'unknown' |
| notification_permission | text | not null default 'unknown' |
| motion_permission | text | not null default 'unknown' |
| created_at | timestamptz | not null default now() |
| updated_at | timestamptz | not null default now() |

### 4-3. `devices`
One user can have multiple devices.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK -> users.id, not null |
| platform | text | not null |
| platform_device_id | text | not null |
| push_token | text | null |
| app_version | text | null |
| os_version | text | null |
| is_active | boolean | not null default true |
| last_seen_at | timestamptz | null |
| created_at | timestamptz | not null default now() |
| updated_at | timestamptz | not null default now() |

Indexes:
- unique `(platform, platform_device_id)`
- index `(user_id, is_active)`

### 4-4. `goal_catalog`
Master table for selectable goals.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| slug | text | unique, not null |
| name | text | not null |
| description | text | null |
| is_active | boolean | not null default true |
| sort_order | integer | not null default 100 |
| created_at | timestamptz | not null default now() |

Seed examples:
- `english`
- `reading`
- `news`
- `job-prep`
- `journaling`
- `intentional-rest`

### 4-5. `user_goals`
Selected goals for a user.

| Column | Type | Constraints |
|---|---|---|
| user_id | uuid | FK -> users.id, not null |
| goal_id | uuid | FK -> goal_catalog.id, not null |
| priority_order | smallint | not null |
| created_at | timestamptz | not null default now() |

Primary key:
- `(user_id, goal_id)`

Check:
- `priority_order between 1 and 3`

### 4-6. `routines`
Morning/evening routine preferences.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK -> users.id, not null |
| period_type | period_type | not null |
| primary_mode | text | not null |
| secondary_modes | jsonb | not null default '[]'::jsonb |
| is_enabled | boolean | not null default true |
| created_at | timestamptz | not null default now() |
| updated_at | timestamptz | not null default now() |

Indexes:
- unique `(user_id, period_type)`

### 4-7. `action_catalog`
Action templates used for recommendation.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| slug | text | unique, not null |
| title | text | not null |
| description | text | null |
| category_slug | text | not null |
| default_duration_seconds | integer | not null |
| energy_level | energy_level | not null |
| supported_period_types | jsonb | not null default '["morning","evening","other"]'::jsonb |
| is_fallback | boolean | not null default false |
| is_active | boolean | not null default true |
| created_at | timestamptz | not null default now() |

Seed examples:
- `todo-3`
- `english-10`
- `journal-3`
- `breathe-3`
- `read-saved-7`

### 4-8. `action_goal_map`
Many-to-many map between actions and goals.

| Column | Type | Constraints |
|---|---|---|
| action_id | uuid | FK -> action_catalog.id, not null |
| goal_id | uuid | FK -> goal_catalog.id, not null |

Primary key:
- `(action_id, goal_id)`

### 4-9. `commute_detections`
Normalized detection events uploaded from the client.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK -> users.id, not null |
| device_id | uuid | FK -> devices.id, null |
| detected_at | timestamptz | not null |
| source | text | not null |
| confidence_score | numeric(4,3) | not null |
| period_type | period_type | not null |
| route_hash | text | null |
| estimated_duration_seconds | integer | null |
| distance_meters | integer | null |
| app_state | text | null |
| should_prompt | boolean | not null default false |
| suppression_reason | text | null |
| created_at | timestamptz | not null default now() |

Indexes:
- index `(user_id, detected_at desc)`
- index `(user_id, route_hash)`
- index `(user_id, should_prompt, detected_at desc)`

### 4-10. `sessions`
Main session entity from suggestion to completion.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK -> users.id, not null |
| device_id | uuid | FK -> devices.id, null |
| detection_id | uuid | FK -> commute_detections.id, null |
| trigger_type | session_trigger_type | not null |
| period_type | period_type | not null |
| status | session_status | not null |
| route_hash | text | null |
| estimated_duration_seconds | integer | null |
| started_at | timestamptz | null |
| ended_at | timestamptz | null |
| intentional_time_seconds | integer | not null default 0 |
| selected_action_id | uuid | FK -> action_catalog.id, null |
| completed_action_id | uuid | FK -> action_catalog.id, null |
| created_at | timestamptz | not null default now() |
| updated_at | timestamptz | not null default now() |

Indexes:
- index `(user_id, created_at desc)`
- index `(user_id, status, created_at desc)`
- index `(detection_id)`

### 4-11. `session_recommendations`
Actions recommended for a session suggestion.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| session_id | uuid | FK -> sessions.id, not null |
| action_id | uuid | FK -> action_catalog.id, not null |
| rank_order | smallint | not null |
| reason_codes | jsonb | not null default '[]'::jsonb |
| was_selected | boolean | not null default false |
| created_at | timestamptz | not null default now() |

Indexes:
- unique `(session_id, rank_order)`
- unique `(session_id, action_id)`

### 4-12. `session_events`
Time-series events for progress and analytics.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| session_id | uuid | FK -> sessions.id, not null |
| event_type | text | not null |
| occurred_at | timestamptz | not null |
| payload | jsonb | not null default '{}'::jsonb |
| created_at | timestamptz | not null default now() |

Indexes:
- index `(session_id, occurred_at asc)`

### 4-13. `session_reflections`
User feedback collected at the end of a session.

| Column | Type | Constraints |
|---|---|---|
| session_id | uuid | PK, FK -> sessions.id |
| satisfaction_score | smallint | null |
| would_repeat | boolean | null |
| mode_tag | text | null |
| skip_reason | skip_reason | null |
| marked_false_positive | boolean | not null default false |
| created_at | timestamptz | not null default now() |
| updated_at | timestamptz | not null default now() |

Check:
- `satisfaction_score between 1 and 5`

### 4-14. `route_exclusions`
Suppress prompts for known routes.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK -> users.id, not null |
| route_hash | text | not null |
| label | text | null |
| is_active | boolean | not null default true |
| created_at | timestamptz | not null default now() |

Indexes:
- unique `(user_id, route_hash)`

### 4-15. `time_exclusions`
Suppress prompts during recurring time windows.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK -> users.id, not null |
| days_of_week | smallint[] | not null |
| start_minute | integer | not null |
| end_minute | integer | not null |
| label | text | null |
| is_active | boolean | not null default true |
| created_at | timestamptz | not null default now() |

Checks:
- `start_minute between 0 and 1439`
- `end_minute between 0 and 1439`

Indexes:
- index `(user_id, is_active)`

### 4-16. `analytics_events`
Raw product analytics events.

| Column | Type | Constraints |
|---|---|---|
| id | bigserial | PK |
| user_id | uuid | null |
| device_id | uuid | null |
| session_id | uuid | null |
| event_name | text | not null |
| occurred_at | timestamptz | not null |
| payload | jsonb | not null default '{}'::jsonb |
| created_at | timestamptz | not null default now() |

Indexes:
- index `(event_name, occurred_at desc)`
- index `(user_id, occurred_at desc)`
- index `(session_id, occurred_at desc)`

## 5. Reporting Layer

### 5-1. `daily_user_metrics`
Recommended as a materialized view or aggregate table.

Suggested fields:
- `user_id`
- `metric_date`
- `session_count`
- `completed_session_count`
- `skip_session_count`
- `false_positive_count`
- `intentional_time_seconds`
- `recovery_session_count`
- `completed_action_count`

Primary key:
- `(user_id, metric_date)`

### 5-2. Weekly reports
Can be computed from `daily_user_metrics` instead of from raw sessions.

## 6. Example DDL Skeleton
```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  auth_provider text not null,
  auth_subject text not null,
  timezone text not null default 'Asia/Seoul',
  locale text not null default 'ko-KR',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auth_provider, auth_subject)
);

create table user_settings (
  user_id uuid primary key references users(id) on delete cascade,
  prompt_enabled boolean not null default true,
  prompt_max_per_day smallint not null default 2,
  morning_prompt_enabled boolean not null default true,
  evening_prompt_enabled boolean not null default true,
  quiet_mode_enabled boolean not null default false,
  location_permission_scope text not null default 'unknown',
  notification_permission text not null default 'unknown',
  motion_permission text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 7. Privacy and Retention Guidance
- Avoid storing raw location traces for MVP unless needed for debugging.
- Prefer `route_hash`, period type, and estimated duration over full coordinate histories.
- If raw coordinates must be stored temporarily, place them in a short-retention table such as `raw_location_events` with automatic deletion within 7 to 30 days.
- User-facing reports should be derived from sessions, not from raw GPS data.

## 8. Migration Order
1. users
2. user_settings
3. devices
4. goal_catalog
5. user_goals
6. routines
7. action_catalog
8. action_goal_map
9. commute_detections
10. sessions
11. session_recommendations
12. session_events
13. session_reflections
14. route_exclusions
15. time_exclusions
16. analytics_events
17. daily_user_metrics

## 9. Open Schema Questions
- Should route exclusions be based only on route hash or also on a start/end cluster pair?
- Do we need a separate `manual_sessions` table, or is `sessions.trigger_type` enough?
- Is `analytics_events` kept inside the main database or shipped to a dedicated analytics pipeline?
- Should recommendation reasons be persisted for model tuning from day 1?
