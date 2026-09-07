# Kimo Life — Technical Stack & Feature Architecture Skill

## Purpose

Persistent technical source of truth for Kimo Life feature implementation.

Complements:
- Kimo Life UI/UX Skill → visual and interaction rules
- Kimo Life Project Skill → engineering/project rules
- Kimo Life AI Workflow → execution workflow
- Master implementation prompts → product scope and phase order

Do not replace an approved technology with another technology merely because it is familiar or convenient.

## Current project state

The project is already beyond initial Foundation and into Memory Core / Phase 3 work.

Therefore:
- do not recreate the project
- do not reinstall the stack unnecessarily
- inspect current implementation first
- use installed dependency versions unless a change is required
- do not reset working code to match an old prompt

## Approved core stack

Backend:
- Laravel
- PHP 8.3+
- Eloquent ORM
- Form Requests
- Policies / Gates
- Laravel Notifications
- Laravel Jobs / Queue
- Laravel Scheduler
- Laravel Filesystem
- Laravel Broadcasting

Frontend:
- React
- TypeScript
- Inertia

UI:
- Tailwind CSS
- shadcn/ui where useful
- Lucide React

Animation:
- Motion for React

Date/time:
- Carbon backend
- date-fns frontend

Database:
- keep the existing project database
- MySQL or PostgreSQL
- do not switch casually

Realtime:
- WebSocket
- Laravel Broadcasting
- Laravel Reverb

Image processing:
- Laravel Filesystem
- Intervention Image or the image-processing solution already adopted by the project

## Feature → technology mapping

| Feature | Approved technology / mechanism |
|---|---|
| Authentication | Laravel authentication + Inertia + React |
| Memory CRUD | Laravel + Eloquent + Form Request + Policy + Inertia |
| Photo upload | Filesystem + validation + image processor |
| Image processing | Queue + image processor |
| PhotoStack | React + Motion |
| Calendar | React + date-fns + Laravel date-range queries |
| Activity | Eloquent + Inertia |
| Personal streak | Laravel + Carbon + Eloquent + server-side domain logic |
| Friends | Eloquent + Policies |
| Shared Memory | Eloquent + Inertia + existing photo components |
| Duo/Group Streak | Laravel + Carbon + DB + Queue/Notifications where needed |
| Reactions | Laravel/Eloquent + safe optimistic UI |
| Comments | Laravel + Eloquent + Policies + Inertia |
| Chat | WebSocket + Laravel Reverb + Broadcasting + DB |
| Persistent notification | Laravel Notifications + database |
| Realtime notification | Broadcasting + Reverb |
| Reminder | Scheduler + Queue + Notifications |
| Weekly/monthly recap | Scheduler/Queue + Laravel |
| On This Day | Laravel + Eloquent + centralized date strategy |
| Search | DB/Eloquent initially |
| Advanced search later | Laravel Scout + search engine only when justified |
| Animation | Motion for React |
| Icons | Lucide React |
| Styling | Tailwind CSS + shadcn/ui |
| Cache | Laravel Cache / Redis when useful |
| Queue | Laravel Queue |
| Storage | Laravel Filesystem |

## Authentication

Use the authentication system already installed.

Do not create a second auth system.

## Memory CRUD

Backend:
- controller/action as appropriate
- Eloquent
- Form Request
- Policy

Frontend:
- React
- Inertia
- shared Memory components

Do not create REST APIs for ordinary page flows unless there is a justified requirement.

## Photo upload

Flow:

React
→ multipart upload
→ Laravel validation
→ Filesystem
→ database metadata
→ optional Queue processing
→ thumbnail/medium/large

Rules:
- validate MIME/type and size
- never trust client filename
- generated/safe storage path
- ownership checks
- image processing should not unnecessarily block the request

## Image derivatives

Recommended contexts:
- calendar → thumbnail
- lists/grid → thumbnail/medium
- detail → large
- original only when genuinely necessary

Never load original full-resolution images into every card.

## Calendar

Frontend:
- React
- date-fns

Backend:
- Laravel
- Eloquent
- date-range queries

Rules:
- query the displayed date range
- do not load the entire memory history
- use thumbnails
- selected-day and month navigation follow existing app routing

## Streak

The backend is authoritative.

Flow:

React check-in
→ Laravel validation
→ centralized date/timezone logic
→ streak domain calculation
→ streak log
→ updated streak state
→ response / notification / milestone

Do not let React calculate the authoritative streak.

Critical tests:
- first completion
- consecutive day
- break
- weekly goal
- skipped day
- timezone boundary
- current streak
- best streak

## Friends

Use Laravel/Eloquent/Policies.

Statuses:
- pending
- accepted
- declined
- blocked

Server must decide whether a user may see/interact with another user's data.

## Shared Memory

Use:
- Laravel
- Eloquent relationships
- Policies
- Inertia
- existing PhotoStack / AvatarGroup / Memory components

Do not create a second image architecture.

## Duo / Group Streak

Backend controls:
- membership
- eligibility
- daily completion
- current/best streak

Use:
- Laravel
- Carbon
- Eloquent
- DB transaction when multiple writes need atomicity
- Queue/Notifications for reminders

Do not let browsers independently calculate shared streaks.

## Reactions / Comments

Use normal Laravel/Eloquent operations.

Optimistic UI is acceptable for low-risk interactions:
- reaction
- favorite
- read/unread

Rollback on failure.

Do not use optimistic UI as the authority for:
- permissions
- streak calculation
- privacy
- friendship acceptance

# Chat architecture

Chat is a realtime feature.

REQUIRED DEFAULT:

WebSocket
+ Laravel Reverb
+ Laravel Broadcasting
+ React/Inertia
+ persistent database

Do not substitute:
- Firebase
- Pusher
- Socket.IO
- Supabase realtime
- polling

unless the user explicitly changes the architecture.

### Chat send flow

React Chat UI
→ Laravel request/action
→ authorization + validation
→ save Message in DB
→ broadcast MessageCreated event
→ Laravel Broadcasting
→ Reverb WebSocket
→ recipient client receives event
→ update UI

Database is the durable source of truth.
WebSocket is only the realtime transport.

### Chat entities

Initial:
- conversations
- conversation_members
- messages

Optional later:
- message_attachments
- message_reads

Do not add typing/presence/read receipts unless product scope needs them.

### Reconnect

Clients must not assume every WebSocket event arrived.

On reconnect:
- request/reconcile recent server messages
- avoid duplicate rendering
- preserve server ordering

# Notifications

Persistent:
- Laravel Notifications
- database channel

Realtime:
- Broadcasting
- Reverb

Email:
- Laravel Mail/Notifications

Push:
- future PWA/Web Push layer

Notification creation belongs to backend.

# Reminders

Do NOT implement product reminders using:
- React setInterval
- React setTimeout
- browser-only timers

Use:

Laravel Scheduler
→ due reminder job
→ Queue
→ Notification
→ database / realtime / email / push

Reminder jobs must be idempotent.

Timezone is user-specific for the scheduled local time.

# Smart reminders

Future only.

Start deterministic:
- typical memory time
- typical habit time
- missed streak

Do not introduce ML infrastructure without an explicit product requirement.

# Recaps

Use:
- Laravel
- Eloquent/date ranges
- Carbon
- Queue for heavy generation
- Scheduler when scheduled generation is required
- cache/precompute when justified

Do not perform expensive full-history aggregation on every page request.

# Search

Start with:
- DB/Eloquent/Query Builder
- indexed fields
- server-side filtering
- pagination

Frontend:
- debounced input
- Inertia request

Recommended debounce:
~300ms

Only introduce Laravel Scout + a search engine when dataset/ranking requirements justify it.

# Realtime boundaries

Use realtime for:
- chat
- realtime notifications
- live shared/duo streak updates where useful
- presence/read state only if later required

Do not use WebSockets for:
- normal CRUD
- calendar navigation
- settings
- ordinary search
- static profile pages

# Queue boundaries

Use Queue for:
- image processing
- thumbnail generation
- recap generation
- reminder jobs
- bulk notifications
- expensive asynchronous tasks

Jobs should be:
- small
- retryable
- idempotent
- observable

# Storage

Use Laravel Filesystem abstraction.

React must not know provider-specific storage details.

Store:
- logical path
- metadata
- ownership

Never construct storage paths directly from unsafe input.

# Frontend state

Local React state:
- form input
- modal state
- selected tab
- temporary UI state

Server/Inertia data:
- memories
- streaks
- friends
- messages
- notifications

Do not add Redux/Zustand/Jotai/MobX unless a real cross-page requirement appears and the choice is documented.

# Date/time

Backend:
- Carbon

Frontend:
- date-fns

Centralize:
- today
- month boundaries
- week boundaries
- timezone conversion
- streak dates

Avoid scattered Date logic for product-critical behavior.

# Rate limiting

Use Laravel RateLimiter for:
- login/auth sensitive flows
- friend requests
- comments
- messages
- uploads
- reminder nudges
- sensitive account actions

# Dependency policy

Before adding a package:
1. check Laravel/React/Tailwind existing capabilities
2. inspect current dependencies
3. verify compatibility
4. justify the package
5. avoid overlapping libraries
6. update documentation if it becomes a project dependency

Do not add a new UI kit, date library, animation library, realtime provider or state manager without a documented reason.

# Technology change protocol

A technology can be replaced only when:
- user explicitly requests it
- existing technology cannot satisfy a real requirement
- security/performance/maintenance requires it
- infrastructure constraints require it

Then:
1. document the reason
2. identify affected modules
3. update this skill
4. update project defaults/ADR
5. update tests
6. migrate incrementally

# Architecture drift guardrail

When asked to add a feature, first answer internally:

"What is the approved Kimo Life technology for this feature?"

Examples:
- Chat → WebSocket + Reverb + Broadcasting
- Reminder → Scheduler + Queue + Notifications
- Upload → Filesystem + image processor + Queue
- Streak → Laravel + Carbon + server-side logic
- Calendar → React + date-fns + server date-range query
- Animation → Motion
- UI → Tailwind + shadcn/ui + Lucide

Do not select technologies randomly per feature.

# Phase-aware rule

The project is already in/around Phase 3.

Do not rerun:
- project setup
- authentication foundation
- initial app shell

Continue from the existing working codebase.

For the next phases, use this skill to determine technology choices.

# Final rule

Kimo Life must have one coherent technical architecture.

A feature is not complete just because it renders.
It must follow:
- approved technology
- server authorization
- validation
- tests
- responsive behavior
- existing design system
- existing motion system
- current project architecture.
