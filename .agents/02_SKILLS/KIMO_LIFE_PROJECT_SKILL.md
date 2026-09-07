# Kimo Life Project Rules Skill

## Purpose

This is the persistent project-level engineering skill for Kimo Life.

It governs:
- architecture decisions
- coding conventions
- default configuration
- environment behavior
- data safety
- privacy
- testing
- feature workflow
- consistency across long AI sessions

It complements the Kimo Life UI/UX Skill.

UI/UX rules remain authoritative for visual design.
This skill is authoritative for engineering/project behavior.

If a rule here conflicts with a user-requested product change:
- follow the explicit product change,
- update the appropriate documentation,
- do not silently create a permanent convention.

## Web language convention

The web application is Vietnamese-first.

- New visible UI copy must be written in Vietnamese unless it is a brand/product name, code identifier, or an explicit English requirement.
- When reusing starter-kit screens, translate user-facing copy instead of carrying English defaults into production UI.
- Keep backend route names, database identifiers and TypeScript identifiers in English when that follows the framework convention.
- Centralize locale defaults in configuration; the current web locale is `vi` with `en` as fallback.

---

## 1. Product Identity

App:
Kimo Life

Tagline:
Small moments. A better you.

Primary domains:
- memories
- photos
- calendar
- activities
- habits
- streaks
- friends
- shared memories
- duo/group streaks
- chat
- notifications
- reminders
- recap

Core principle:

Kimo Life is a memory-first product with habits and social features around the memory experience.

Do not accidentally evolve it into:
- a pure productivity app
- a generic social network
- a generic gallery
- a hardcore gamification product

---

## 2. Source-of-truth order

Before changing code, inspect in this order:

1. current working implementation
2. Kimo Life UI/UX Skill
3. project architecture docs
4. product specification
5. current phase prompt
6. user request

If an older document says "Daytle", treat that as the legacy project name and use "Kimo Life" for the active product identity.

Never invent a new product design to fill documentation gaps when existing patterns can be reused.

---

## 3. Engineering principles

Always prefer:

- simple architecture
- explicit business rules
- reusable components
- server-side authorization
- validated inputs
- testable domain logic
- incremental changes
- backward-compatible changes where practical
- clear naming
- predictable behavior

Avoid:

- premature abstraction
- giant classes
- global mutable state without reason
- duplicate business logic
- frontend-only authorization
- hidden side effects
- unnecessary packages
- replacing working architecture just for personal preference

---

## 4. Laravel conventions

Use Laravel conventions first.

Models:
PascalCase singular.

Examples:
Memory
MemoryPhoto
Activity
Streak
Friendship
SharedMemory
Conversation
Message
Reminder
Notification

Tables:
snake_case plural.

Examples:
memories
memory_photos
streak_logs
friendships
shared_memories

Foreign keys:
`{model}_id`

Methods:
verb/action-oriented.

Examples:
createMemory
markCompleted
sendReminder

Use Eloquent relationships.

Use Form Requests for non-trivial validation.

Use Policies for authorization.

Use Jobs for work that is:
- slow
- retryable
- asynchronous
- external
- image-processing-heavy

Use Notifications for user-facing notifications.

Use Events only when there is a meaningful event-driven boundary.

Use Actions/Services only when they simplify domain logic; do not create a service class for every CRUD method.

---

## 5. React conventions

Use TypeScript.

Prefer function components.

Prefer small reusable components.

Avoid one page component containing all UI/business logic.

Separate:
- presentation
- data fetching/navigation
- local UI state
- reusable business helpers

Prefer:
- typed props
- discriminated unions when appropriate
- reusable hooks
- shared UI components

Do not create duplicate components that differ only by a small style variation.

---

## 6. Inertia conventions

Prefer Inertia data flow for normal application pages.

Do not build a separate REST API for every page by default.

Use API endpoints only when justified, such as:
- external integrations
- realtime-specific operations
- mobile client later
- independent asynchronous endpoints
- third-party consumption

Keep page props intentional.

Do not send massive relational graphs to the client.

---

## 7. Database rules

The application runtime uses MySQL 8+ as the primary relational database. Keep connection details in environment configuration; do not hard-code credentials. Tests may use an isolated SQLite in-memory connection when the test harness explicitly overrides the runtime connection.

Every important relational field should have:
- foreign key
- index where appropriate
- sensible nullability
- uniqueness constraints where required

Examples:

users:
unique username/email as product rules require

memories:
index user_id + memory_date
index visibility where useful

streak_logs:
unique streak_id + date where business rule guarantees one completion record/day

notifications:
index user_id + read_at

messages:
index conversation_id + created_at

friendships:
appropriate unique relationship constraint

Never rely on frontend uniqueness.

For counters such as streak values:
ensure the source-of-truth and update strategy is clear.
Do not let multiple requests produce impossible values.

---

## 8. IDs

Use the project's established Laravel ID strategy.

Do not switch between integer IDs, UUIDs, ULIDs, or custom IDs casually.

If starting fresh:
choose one strategy once, document it, and use it consistently.

Never expose a database identifier as a security boundary.
Authorization must still be enforced.

---

## 9. Date and timezone

This project is highly date-sensitive.

Store timestamps consistently.

User-facing "day" must be based on the user's timezone.

Keep:
- system timezone
- user timezone
- database timestamp strategy

explicit.

Streaks, reminders, calendar filters and "On This Day" must not accidentally use server-local time.

Never calculate "today" differently in different modules.

Create centralized date helpers.

---

## 10. Privacy

Default visibility:
private.

Three common memory states:
private
friends
public

Server-side authorization is mandatory.

Do not leak private data through:
- search
- calendar counts
- notification payloads
- social activity
- shared previews
- profile highlights
- chat cards
- API/Inertia props

Blocked users should not be able to bypass restrictions through direct URLs or IDs.

---

## 11. Upload rules

Images are core product data.

Validate:
- MIME/type
- size
- dimensions when needed
- safe storage path
- ownership
- allowed extension

Never trust client filename.

Do not render original full-size files in thumbnail contexts.

Prefer:
original
large
medium
thumbnail

or another documented responsive strategy.

If processing asynchronously:
- upload original safely
- queue processing
- update processing state
- handle failure
- clean up files on permanent deletion

---

## 12. Default limits

Unless the product docs explicitly override them:

Memory caption:
5000 characters

Tags:
reasonable user-defined length; keep short by UI design

Pagination default:
20

Search debounce:
250–350ms

Friend reminder:
max 1 reminder/member/day

Notification retry:
must be idempotent

Image upload:
choose a safe production default in central config, not in arbitrary component/controller code.

Any exact numeric default should live in project config and be documented.

---

## 13. Configuration rules

Centralize defaults.

Never scatter values like:
- pagination counts
- max image size
- animation timings
- notification limits
- feature toggles
- upload disk
- date formats

across the codebase.

Use:
- config files
- environment variables
- design tokens
- constants only where appropriate

Environment variable names should be stable and documented in `.env.example`.

Never commit secrets.

---

## 14. Recommended config keys

Create as appropriate:

config/app.php
config/kimo.php
config/filesystems.php
config/queue.php
config/cache.php
config/broadcasting.php

Kimo-specific config can contain:

app_name
tagline
locale
fallback_locale
default_pagination
memory_max_caption
memory_max_photos
upload_max_size_mb
thumbnail_width
medium_width
large_width
reminder.max_friend_nudges_per_day
notifications.retention_days
features.duo_streak
features.shared_memory
features.chat
features.realtime

Do not enable a feature flag merely because its code exists.
Feature state should reflect rollout intent.

---

## 15. Feature flags

Use feature flags only for:
- incomplete features
- staged rollout
- expensive/infrastructure-dependent features

Do not turn every boolean into a feature flag.

Prefer semantic names:
features.chat
features.realtime
features.smart_reminders

Avoid:
features.feature_123

---

## 16. Notifications

Notifications must be:
- authorized
- relevant
- idempotent
- concise

Avoid notification spam.

For scheduled reminders:
- use Laravel scheduler
- use queued jobs where appropriate
- make jobs idempotent
- honor timezone
- honor user settings

No duplicate reminder on job retry.

---

## 17. Realtime

Use Laravel Reverb/Broadcasting only when realtime materially improves the feature.

Good candidates:
- chat messages
- read status
- selected social events

Do not use realtime for:
- static calendar
- ordinary CRUD
- content that can be fetched normally

Build core functionality first, realtime second.

---

## 18. Testing

Every important business rule must have backend tests.

Especially:
- privacy
- friendship
- streak calculations
- reminder idempotency
- shared membership
- chat membership
- authorization
- uploads

Do not accept:
- passing UI build with failing business tests
- "works in browser" as a replacement for backend tests

Before finalizing a phase:
- tests
- typecheck
- build
- lint where configured

---

## 19. Error handling

User-facing:
short, friendly, actionable.

Developer-facing:
meaningful logs with context.

Do not expose:
- stack traces
- secrets
- internal IDs unnecessarily
- SQL details

Do not silently swallow exceptions.

---

## 20. Logging

Log important state transitions when useful:
- failed image processing
- scheduled job failure
- notification failure
- realtime infrastructure errors
- unexpected permission failures

Never log:
- passwords
- auth tokens
- sensitive private message content unnecessarily
- raw private image URLs if avoidable

---

## 21. Performance

Prefer:
- pagination
- eager loading where justified
- indexes
- lazy images
- thumbnails
- route/code splitting
- debounce for search
- memoization only when needed

Avoid:
- N+1 queries
- loading all memories for a calendar
- loading originals into grids
- fetching huge relationship trees
- unnecessary client-side filtering of massive datasets

---

## 22. UI preservation

The Kimo Life UI/UX Skill governs visual identity.

Engineering changes must not casually alter:
- color tokens
- typography
- radius
- icon language
- PhotoStack
- motion language
- mobile navigation

When modifying UI:
1. reuse component
2. reuse token
3. reuse motion
4. make the smallest local change possible

If a global visual change is intentional:
- update design system
- update shared components
- audit core pages
- document the change

---

## 23. Design drift protection

Before creating any new page:

Ask:
- which existing page is most similar?
- which existing components can be reused?
- which motion pattern should be reused?
- what is the mobile layout?
- how will desktop adapt?
- what happens in empty/loading/error states?

If it feels like a different product, revise it.

"Feature new must look like it was always part of Kimo Life."

---

## 24. Git safety

Before large changes:
- inspect git status
- inspect diff
- avoid destructive commands

Never:
- reset user changes without permission
- delete unrelated files
- overwrite working implementation blindly

At the end of a phase:
report:
- modified files
- created files
- migrations
- tests
- unresolved issues

---

## 25. AI session protocol

At the start of every long session:
1. read this skill
2. read UI skill
3. inspect current project
4. inspect relevant docs
5. inspect git state

Before coding:
- summarize intended change internally
- identify affected modules
- identify reusable components
- identify tests

After coding:
- run relevant tests
- inspect diff
- run typecheck/build
- check for design drift

Do not assume previous AI output is correct merely because it exists.

---

## 26. New feature protocol

For every feature:

### Discovery
- read relevant product section
- inspect similar implementation

### Backend
- migration
- model
- relationships
- request
- policy
- action/service if needed
- controller
- tests

### Frontend
- type
- page/route
- reusable components
- loading
- empty
- error
- success
- motion
- accessibility
- responsive

### Verification
- tests
- typecheck
- build
- UI consistency

---

## 27. Definition of done

A feature is not done when:
- the page renders

It is done when:
- business rule works
- authorization works
- validation works
- loading state works
- empty state works
- error state works
- success state works
- mobile works
- desktop works
- reduced motion works
- tests pass
- no obvious console/type errors
- visual language matches Kimo Life

---

## 28. Do not overbuild

When uncertain:
choose the simplest solution that:
- meets the current requirement
- fits the architecture
- can be extended later

Avoid building:
- unused abstractions
- speculative APIs
- unused database tables
- complex social algorithms
- advanced analytics before core product stability
