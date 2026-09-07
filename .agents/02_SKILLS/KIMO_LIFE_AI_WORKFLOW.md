# Kimo Life — AI Workflow Rules

Use this workflow whenever modifying the project.

## Start

- Read project skill.
- Read UI/UX skill.
- Read relevant phase/product docs.
- Inspect existing implementation.
- Inspect git status.

## Plan

State:
- goal
- affected modules
- existing components to reuse
- data/model changes
- tests needed

Do not write code before understanding where the change belongs.

## Implement

Backend first when business logic changes.

Order:
migration
→ model
→ relationship
→ request
→ policy
→ action/service if useful
→ controller
→ tests

Frontend:
types
→ data flow
→ shared components
→ page
→ loading/empty/error/success
→ motion
→ responsive
→ accessibility

## Verify

Run the narrowest useful tests first.

Then:
- full relevant tests
- typecheck
- build

For UI work:
- inspect mobile
- inspect desktop
- inspect reduced motion
- check design drift

## Finish

Report:
- what changed
- files changed
- migration status
- tests
- build
- known issues
- next recommended phase

Never claim complete if there are known blocking errors.
