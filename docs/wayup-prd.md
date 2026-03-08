# WayUp PRD

## Document Info
- Product: `WayUp` (working title)
- Status: `In progress`
- Updated: `2026-03-08`
- Repository: `https://github.com/suzy97/WayUp`

## 1. Executive Summary
WayUp is a mobile service that detects recurring commute contexts such as subway, bus, or school/work transit and redirects users from mindless short-form content consumption into small, intentional actions. The product hypothesis is that users do not fail because of low willpower, but because there is no product intervention at the moment when the commute starts.

The MVP should focus on four things:
- detect commute-like contexts
- suggest a lightweight session instead of forcing a block
- recommend short actions based on user goals and commute length
- show simple reflection/reporting so the value compounds over time

WayUp should not position itself as a guilt-driven productivity app. The product value is helping users spend commute time in a way they intentionally chose, including rest when appropriate.

## 2. Problem Definition

### 2-1. User Problem
Users often open YouTube Shorts, Reels, or similar content as soon as they get on public transit. Afterward, they feel they wasted time, but the same loop repeats during the next commute.

### 2-2. Pain Points
- commute time is highly repetitive but rarely intentional
- existing productivity apps require manual initiation
- app-blocking products feel too strict and create churn risk
- commute conditions make long, heavy tasks unrealistic
- users need different modes in the morning and evening

### 2-3. Product Opportunity
WayUp sits between productivity and digital wellbeing:
- more contextual than a generic productivity tool
- less punitive than a hard-blocking app
- more actionable than passive screen-time reports

### 2-4. Key Hypotheses
- if the product intervenes when a commute starts, users are more likely to shift behavior
- if the product offers alternatives instead of strong blocking, retention will be higher
- if commute goals are split into `morning preparation` and `evening recovery`, satisfaction will improve
- if the messaging focuses on `intentional use` rather than `productivity guilt`, broader audiences will accept it

## 3. Product Principles
- Do not shame the user.
- Do not force every commute to become productive.
- Treat intentional rest as a valid outcome.
- Optimize for low-friction redirection, not strict control.
- Keep actions short, concrete, and easy to start.

## 4. Target Users

### Primary
- office workers commuting by subway or bus
- users who want to improve how they use commute time
- users who dislike rigid productivity systems

### Secondary
- university students with long commutes
- job seekers using transit time for preparation
- side-project builders who need short planning windows
- users interested in digital wellbeing

## 5. MVP Scope

### In Scope
- onboarding
- goal selection
- morning/evening routine setup
- automatic commute session suggestion
- manual session start
- action recommendation
- session completion and lightweight reflection
- daily/weekly report
- settings for frequency and exceptions

### Out of Scope
- hard blocking of third-party apps
- advanced AI-generated coaching
- social/community features
- third-party content partnerships
- gamification beyond light progress feedback

## 6. Policy

### 6-1. Commute Session Start Policy
- the system detects high-probability commute situations using time, location pattern, and movement context
- the MVP uses `automatic suggestion`, not forced session start
- users must be able to choose `Start`, `Skip this time`, or `Reduce similar prompts`
- morning commute and evening commute are treated as separate contexts

### 6-2. Behavior Redirection Policy
- the service does not hard-block short-form apps in the MVP
- instead, it suggests alternatives before the user drifts into passive consumption
- recommended actions are limited to short durations such as 3, 7, or 15 minutes
- the system should present at most 3 suggested actions per session

### 6-3. Goal and Mode Policy
- the user can select 1 to 3 goals
- predefined goals are preferred for the MVP
- morning and evening routines must be configured separately
- a recovery mode must exist for users who do not want productivity-heavy suggestions

### 6-4. Reflection and Report Policy
- session reflection must be fast and optional-heavy
- reports should emphasize intentional use time rather than total tracked time
- copy should affirm user choice instead of evaluating their worth

### 6-5. Notification Policy
- default cap: maximum 2 prompts per day
- if the user skips 3 times in a row, prompt intensity should be reduced
- prompt copy should be invitational, not controlling

### 6-6. Data and Trust Policy
- location and commute-pattern data are used only for product functionality
- users can disable specific routes, time windows, or prompt categories
- data collection rationale must be explained before permission prompts

## 7. Functional Spec

| No. | Requirement | Screen | Priority | Expected Result |
|---|---|---|---|---|
| 1 | Detect likely commute situations and suggest a session. The user can start, skip, or reduce similar prompts. | Session prompt, push entry, home entry | P0 | Reduce initiation friction and increase intervention timing quality |
| 2 | Allow users to choose 1 to 3 goals and configure separate morning/evening routines. Recommend 3 short actions based on those inputs. | Onboarding, goal setup, routine setup, recommendation | P0 | Increase action acceptance and perceived relevance |
| 3 | Store session results and show daily/weekly reports for intentional use time, completed actions, and recovery selections. | Session end, report | P1 | Reinforce repeat usage and cumulative value |

## 8. Screen-Level Detailed Policy

### 8-1. Onboarding
Purpose:
- explain product value
- collect enough preference data for the first useful session

Rules:
- maximum 3 to 4 steps
- include goal selection and routine setup
- onboarding can complete even if permissions are denied

### 8-2. Permission Pre-Prompt
Purpose:
- explain why location, motion, and notification permissions matter

Rules:
- show a pre-permission explanation before OS dialogs
- clarify what still works without each permission
- support fallback to manual mode

### 8-3. Goal Selection
Rules:
- users must select at least 1 goal
- maximum 3 goals
- predefined categories for MVP:
  - English
  - reading
  - news/articles
  - job prep
  - reflection/journaling
  - intentional rest

### 8-4. Routine Setup
Rules:
- separate morning and evening configuration
- each period can have 1 primary mode and up to 2 secondary modes
- if missing, default recommendation sets apply

### 8-5. Home
Rules:
- show only high-signal information:
  - today's intentional commute time
  - completed actions
  - next likely routine
  - manual start CTA

### 8-6. Session Prompt
Rules:
- use lightweight card-style UI by default
- show estimated commute duration if available
- actions:
  - start
  - skip this time
  - reduce similar prompts
- no duplicate prompts inside the same detected session

### 8-7. Recommendation Screen
Rules:
- maximum 3 actions
- display estimated duration for each
- include at least one low-friction option
- include a recovery-friendly option when relevant

### 8-8. Session Progress
Rules:
- support simple timer-based or checklist-based action completion
- allow stop, switch action, or complete
- persist state locally if network fails

### 8-9. Session End Reflection
Rules:
- should be completable within 5 seconds
- capture:
  - what was done
  - whether it was useful
  - whether similar suggestions should reappear

### 8-10. Report
Rules:
- emphasize intentional use time
- support daily and weekly views
- early users with insufficient data should see explanatory empty states

### 8-11. Settings
Rules:
- support:
  - prompt on/off
  - morning-only or evening-only prompting
  - time exclusions
  - route exclusions
  - goal update
  - notification frequency controls

## 9. User Flow

### 9-1. First-Time User Flow
1. open app
2. read value proposition
3. select goals
4. set morning/evening routines
5. review permission explanations
6. accept or deny permissions
7. enter home
8. wait for detection or use manual start

### 9-2. Auto-Detected Session Flow
1. system detects likely commute
2. session prompt appears
3. user chooses start, skip, or reduce prompts
4. if started, recommendation screen appears
5. user selects one action
6. session progresses
7. session ends
8. reflection is saved
9. report updates

### 9-3. Manual Start Flow
1. user opens home
2. taps `Start commute now`
3. selects or confirms estimated session length
4. sees recommendations
5. starts one action
6. completes or exits session
7. result is saved

### 9-4. Skip Flow
1. prompt appears
2. user taps skip
3. optional reason:
  - want to rest
  - bad detection
  - not now
4. system stores skip signal
5. similar prompts are adjusted later

## 10. Edge Cases and Exception Policy

### 10-1. Detection Errors
- false positive commute:
  - allow user to mark as bad detection
  - lower weight for that route/time pattern
- missed commute:
  - allow manual start from home
  - store signal for later tuning

### 10-2. Permission Denial
- location denied:
  - disable auto-detection
  - keep manual start and reporting
- notification denied:
  - use in-app banners/home reminders only
- motion denied:
  - fall back to lower-confidence time/location logic

### 10-3. Session State Problems
- user backgrounds app:
  - keep session state alive
- commute ends early:
  - store partial completion
- no network during session:
  - use local fallback action state and sync later

### 10-4. Recommendation Problems
- no matching actions available:
  - provide fallback actions:
    - 3-minute breathing
    - quick memo
    - review today's top 3 tasks
- repeated use of a single action:
  - continue ranking it high, but periodically test one alternative

### 10-5. Reporting Problems
- partial data:
  - mark session as partial but keep it available
- false-positive sessions:
  - allow exclusion from reports

### 10-6. Prompt Intensity Problems
- repeated skipping:
  - reduce frequency automatically
- notifications disabled:
  - surface `quiet mode` state inside settings/home

## 11. Metrics

### Success Criteria
- weekly intentional commute time per active user
- session start rate
- action acceptance rate
- D7 retention
- routine setup completion rate

### Guardrail Metrics
- notification disable rate
- false positive detection rate
- immediate skip rate
- uninstall proxy rate
- qualitative dissatisfaction signals

## 12. Detailed Requirements for Development

### 12-1. Domain Model
Core entities:
- User
- Goal
- Routine
- CommuteDetectionRule
- CommuteSession
- ActionRecommendation
- SessionResult
- UserSettings

### 12-2. Functional Requirements

#### Onboarding
- create/update user profile
- save onboarding completion state
- save selected goals
- save morning/evening routine preferences

#### Commute Detection
- collect permission states
- detect likely commute moments
- avoid duplicate prompt creation for the same movement window
- accept false-positive feedback

#### Session Prompt
- generate prompt payload
- support start, skip, reduce frequency actions
- store response events

#### Recommendation Engine
- filter by goal
- filter by time of day
- filter by estimated commute duration
- support fallback actions

#### Session Progress and Completion
- create session record
- update in-progress state
- mark completed, partial, skipped, or false positive
- save reflection feedback

#### Report
- aggregate daily/weekly summaries
- calculate intentional time
- support exclusion rules

#### Settings
- enable/disable prompts
- manage route exclusions
- manage time exclusions
- manage notification frequency

### 12-3. Non-Functional Requirements
- session prompt should appear within 3 seconds of detection event
- home and report should load within 2 seconds under normal conditions
- session state must survive app backgrounding
- logs must support funnel analysis
- location-related data use must be explicit and limited

### 12-4. Analytics Events
- onboarding_started
- onboarding_completed
- permission_prompt_seen
- permission_granted
- permission_denied
- commute_detected
- session_prompt_shown
- session_started
- session_skipped
- prompt_frequency_reduced
- recommendation_seen
- recommendation_selected
- session_completed
- session_partial
- report_viewed

## 13. Development Scope Split

### Epic 0. Product and Technical Design
Deliverables:
- domain model
- API contract draft
- event taxonomy
- permission strategy

### Epic 1. Onboarding and Preference Setup
Includes:
- onboarding UI
- goal setup
- routine setup
- permission pre-prompt
- profile/preferences persistence

### Epic 2. Commute Detection Engine
Includes:
- location/motion/time signal handling
- detection rule engine
- detection event generation
- duplicate suppression

### Epic 3. Session Prompt and Recommendation
Includes:
- prompt UI
- recommendation retrieval
- skip/start/reduce actions
- fallback recommendation support

### Epic 4. Session Execution and Reflection
Includes:
- session state management
- progress/completion UI
- reflection capture
- local persistence and retry sync

### Epic 5. Reporting
Includes:
- daily summary
- weekly summary
- intentional time calculation
- empty state and excluded-session handling

### Epic 6. Settings and Exceptions
Includes:
- prompt frequency settings
- route exclusions
- time exclusions
- goal/routine editing

### Epic 7. Analytics and Operations
Includes:
- event instrumentation
- funnel dashboard requirements
- retention monitoring
- crash/error logging

## 14. Recommended Delivery Phases

### Phase 1: Core Loop Validation
- onboarding
- goal/routine setup
- manual start
- recommendation
- reflection
- analytics

Goal:
- validate whether users accept short intentional actions during commute-like moments

### Phase 2: MVP Completion
- automatic commute detection
- prompt frequency control
- reporting
- exception handling

Goal:
- validate contextual intervention and repeat usage

### Phase 3: Optimization
- personalization improvements
- experimentation framework
- recovery mode refinement

## 15. Open Questions
- how accurate does commute detection need to be before auto-prompting is acceptable
- should estimated commute duration come from user input first or passive inference first
- what percentage of evening sessions should default to recovery-oriented suggestions
- how much user trust is lost after one false-positive prompt
- which metrics best represent `intentional use` without being easy to game

## 16. Immediate Next Work Items
- finalize MVP IA and screen list
- create wireframes for onboarding, prompt, recommendation, reflection, report
- define backend data schema and APIs
- define event schema for analytics
- decide first-release platform constraints for iOS and Android
- choose whether Phase 1 starts with manual-start only or lightweight auto-detection
