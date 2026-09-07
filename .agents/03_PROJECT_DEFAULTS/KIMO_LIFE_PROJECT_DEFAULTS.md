# Kimo Life — Project Defaults

This file documents defaults that should be centralized in `config/kimo.php` and related configuration files.

Values are defaults, not immutable business rules.

## Identity

app_name: Kimo Life
tagline: Small moments. A better you.
locale: vi
fallback_locale: en
web_language: vi
web_language_fallback: en

## Date / Time

Primary rule:
- database/system timestamps use one consistent strategy
- user-facing "day" uses authenticated user's timezone

Recommended:
date_format: d/m/Y
time_format: H:i
month_format: F Y

Do not hard-code locale/timezone behavior in individual components.

## Database

Primary runtime database:
MySQL 8+

Local default:
- host: 127.0.0.1
- port: 3306
- database: kimo_life
- username: root

Automated tests may override the runtime connection with SQLite in-memory for isolation and speed. Application development and migrations must use MySQL.

## Pagination

default: 20
small: 10
large: 50

Use the smallest useful dataset for each page.

## Memories

max_caption_length: 5000
max_photos_per_memory: 10

Default visibility:
private

Visibility:
private
friends
public

## Photos

Use centralized image settings.

Suggested starting defaults:
thumbnail_width: 320px
medium_width: 960px
large_width: 1600px

Default max upload size:
10 MB per image

These numbers may be changed according to actual infrastructure.

Generate responsive derivatives where useful.
Do not use original files in thumbnail-heavy views.

## Search

debounce_ms: 300

Default page size:
20

Search server-side for large datasets.

## Streaks

A user's "today" is evaluated in their timezone.

Never calculate streaks solely from server-local date.

Duo reminder:
max 1 reminder/member/day

## Notifications

Keep notification copy short.

Prevent duplicate sends on retries.

Retention should be configurable rather than hard-coded in domain logic.

## Reminders

Reminder schedule stores:
- local user time
- timezone
- enabled state
- selected days

Reminder job must be idempotent.

## Motion

fast_ms: 160
normal_ms: 240
emphasized_ms: 360

Page y offset:
8px

Button press scale:
0.98

Modal initial scale:
0.96

Animation must honor reduced-motion preferences.

## Responsive targets

Primary:
375px
390px
414px

Secondary:
768px
1024px
1280px+

## Navigation

Mobile:
Today
Calendar
Add
Together
Me

The Add action is visually primary.

## Feature rollout defaults

Phase 1:
memory/calendar/streak core

Later:
shared memory
friends
duo streak
chat
realtime
smart reminders

Do not enable incomplete features merely because implementation files exist.

## Storage

Use Laravel Filesystem abstraction.

Default disk should be configurable through environment.

Suggested variable:
KIMO_STORAGE_DISK

## Queue

Use environment-driven queue connection.

Suggested:
KIMO_QUEUE_CONNECTION=database

Can be switched to Redis in production.

## Cache

Use environment-driven cache store.

## Realtime

Disabled until explicitly enabled.

Suggested:
KIMO_REALTIME_ENABLED=false

## Environment variables

Document project-specific variables in `.env.example`.

Never store:
- passwords
- API keys
- tokens
- production credentials
in source code.

## Social defaults

Profile:
private/restricted

Memory:
private

Friend-only content:
accepted friendship required

Follow:
only enable if product phase supports it

Chat:
direct chat first

## API / data loading

Prefer Inertia page props for normal page loads.

Avoid returning:
- unnecessary relationship trees
- original images
- all historical memories
from one page request.

## Error copy

Default tone:
friendly
short
non-blaming

Examples:
"Không thể lưu khoảnh khắc."
"Vui lòng thử lại."
"Có lỗi xảy ra. Thử lại sau nhé."

## Accessibility

Always:
- visible focus
- keyboard navigation
- ARIA where necessary
- reduced motion
- adequate touch targets
- useful labels

## Important

Whenever a default changes:
1. update this file
2. update config
3. update any affected tests
4. audit impacted modules

Do not create an undocumented local default.
