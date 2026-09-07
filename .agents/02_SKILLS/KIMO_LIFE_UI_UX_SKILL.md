# Kimo Life UI/UX Design System Skill

## Purpose

This skill defines the persistent visual and interaction rules for the Kimo Life application.
Every UI implementation, modification, refactor, or new feature MUST preserve this design language.
Treat this file as the visual source of truth unless the user explicitly changes the design direction.

## Product identity

Kimo Life is a personal memory + habit/streak + lightweight social application.
Tagline: "Small moments. A better you."

Core feelings:
- friendly
- calm
- modern
- warm
- cute but unisex
- natural
- clean
- soft
- comfortable

Kimo Life is NOT:
- a pink/kawaii girls-only diary
- a corporate productivity dashboard
- a dense admin dashboard
- a Facebook-like social network
- an overly gamified app

The product should feel like a calm digital space where users want to save one small moment from their day.

## Web language and content

Kimo Life is Vietnamese-first on the web.

- Write navigation, labels, helper text, empty states, validation, loading, error and success copy in natural Vietnamese by default.
- Keep copy short, warm, clear and non-blaming; use a consistent Vietnamese vocabulary across screens.
- Use English only for the Kimo Life brand, approved product names such as PhotoStack, technical identifiers, or when the user explicitly requests English.
- If an older product prompt contains English UI examples, localize the visible web copy to Vietnamese while preserving the intended behavior and meaning.
- Do not mix Vietnamese and English casually in the same UI surface.


## Brand identity — Kimo Life

### Brand name

Primary brand:
**Kimo Life**

The name combines:
- "Kimo" as the personal/brand anchor
- "Life" to communicate memories, daily living, progress and connection

The brand should not feel like a generic diary, nor a hardcore productivity product.

### Tagline

Primary:
**Small moments. A better you.**

Optional supporting line:
**Lưu lại những khoảnh khắc, theo dõi phiên bản tốt hơn mỗi ngày.**

### Logo concept

The primary logo consists of:
- a distinctive stylized capital **K**
- a subtle leaf/nature motif integrated into or growing from the K
- a few small leaf/petal shapes used as secondary accents
- clean rounded geometry
- friendly but modern proportions
- no excessive mascot dependence

The K should remain recognizable as a standalone app icon.

The leaf should communicate:
- growth
- life
- calmness
- daily progress
- natural memories

The logo must work in:
- mobile app icon
- favicon
- web header
- sidebar
- splash/onboarding
- social sharing card
- monochrome contexts

### Logo variants

Maintain these variants:

1. App icon
   - square with generous rounded corners
   - green surface
   - white or very light K + leaf mark
   - strong silhouette at 16–64px

2. Primary horizontal logo
   - icon/mark + "Kimo Life"
   - Kimo in dark text
   - Life in primary green
   - optional tagline beneath at larger marketing sizes

3. Wordmark only
   - "Kimo Life"
   - for constrained horizontal spaces

4. Monochrome
   - one-color mark for print, browser, accessibility or constrained backgrounds

5. Light/dark variations
   - never redraw the logo
   - only swap approved colors/background treatment

### Logo visual rules

Preferred:
- rounded
- simple
- organic
- balanced
- readable
- modern
- slightly playful
- unisex

Avoid:
- aggressive gaming aesthetics
- childish bubble lettering
- overly feminine floral motifs
- pink-heavy logo systems
- complicated illustrations inside the mark
- gradients that destroy legibility
- thin details that disappear at small sizes

### Logo clear space

Always preserve breathing room around the logo.
Do not place text/icons directly against the mark.
The exact clear-space value should be implemented as a design token when the final logo asset is approved.

### Brand color application

Primary logo palette:
- primary green #74C69D
- primary dark #3F8F6B
- soft green #A7D7A7
- light green #E8F5E9
- dark neutral text #24312A
- white #FFFFFF

The logo should remain recognizable without depending on the background.

### Kimo Life logo generation prompt

Use the following prompt whenever generating or regenerating Kimo Life logo/brand assets with an image-generation model:

```text
Create a polished modern brand identity for a mobile-first personal memory, daily journal, habit/streak and lightweight social app named "Kimo Life".

Brand personality:
friendly, calm, modern, cozy, clean, natural, cute but unisex, suitable for both men and women, not childish, not feminine, not corporate.

Core visual idea:
a distinctive stylized capital letter "K" combined with a simple leaf/nature motif.
The K should be strong enough to work as a standalone app icon.
The leaf should communicate growth, life, calmness and everyday progress.
Use rounded organic geometry with clean negative space.

Color direction:
primary green #74C69D
dark green #3F8F6B
soft green #A7D7A7
very light green #E8F5E9
cream/white #F8FAF7 / #FFFFFF
dark text #24312A

Logo variants required:
1. square mobile app icon
2. horizontal "Kimo Life" web logo
3. wordmark only
4. monochrome mark
5. small favicon version

Wordmark:
"Kimo Life"
"Kimo" in dark neutral
"Life" in primary green
clean rounded modern sans-serif
friendly but mature

Tagline:
"Small moments. A better you."

Presentation:
clean white/cream background
soft natural light
subtle green atmosphere
professional product-brand presentation
minimal shadows
high legibility
no excessive gradients

Do not use:
pink-heavy palette
purple-heavy palette
sparkles everywhere
overly cute kawaii style
female-only styling
gaming aesthetics
complex mascots
3D chrome effects
neon green
busy decorative backgrounds

The result must feel like a real contemporary consumer app brand that can scale across web and mobile.
Provide consistent geometry across icon, wordmark and favicon.
```

### Logo asset implementation

When final logo assets are available:
- prefer SVG for web logo/mark
- prefer PNG/WebP only where raster output is specifically required
- generate favicon sizes
- generate app icon sizes
- generate Open Graph/social image when needed
- store assets in a centralized brand asset directory
- never redraw the logo separately in each page
- expose logo variants through one reusable Logo component

Recommended:
`<Logo variant="full" />`
`<Logo variant="mark" />`
`<Logo variant="wordmark" />`
`<Logo variant="monochrome" />`

All logo rendering must use the approved asset and must not use text-only approximations once final artwork is accepted.

## Visual source of truth

The supplied Kimo Life reference boards are the primary visual references.
They define the visual direction for:
- green-first palette
- mobile-first composition
- rounded cards
- soft shadows
- real-photo-first memories
- subtle illustrations
- friendly neutral iconography
- 3-photo layered stacks
- bottom navigation
- calm whitespace
- soft micro-interactions

Do not copy the reference images pixel-for-pixel. Recreate the same design language consistently.

If a new feature is not shown in the references:
1. reuse existing Kimo Life patterns;
2. reuse existing components;
3. reuse existing spacing, radius, typography, colors and motion;
4. only introduce a new pattern when necessary;
5. document any new reusable pattern in the design system.

## Non-negotiable design rules

1. Mobile-first is mandatory.
2. Green is the primary brand color.
3. Cute must remain neutral/unisex.
4. Real user photos are more important than decorative illustrations.
5. White/cream surfaces dominate the UI.
6. Cards have generous breathing room.
7. Rounded corners are a core visual language.
8. Shadows are soft and subtle.
9. Do not use loud gradients, neon colors, excessive pink, or heavy glassmorphism.
10. Avoid visual clutter.
11. Do not introduce new UI styles merely because a library provides them.
12. Reuse the existing component system before creating custom components.
13. Never break the visual hierarchy of existing pages to fit a new feature.
14. Animation should make the product feel smooth, not flashy.
15. Respect prefers-reduced-motion.

## Color tokens

Primary green:
- primary: #74C69D
- primary-dark: #3F8F6B
- soft-green: #A7D7A7
- pale-green: #E8F5E9

Neutral:
- background: #F8FAF7
- surface: #FFFFFF
- border: #DDE7E0
- text-primary: #24312A
- text-secondary: #6B7280
- text-muted: #94A3B8

Accents:
- orange: #FFD59A
- streak-orange: #FF8A65
- soft-blue: #8EC5FF
- soft-red: #FCA5A5

Do not hard-code arbitrary colors in individual components when a design token already exists.

If a new color is needed:
- prefer an existing token;
- otherwise create a semantic token;
- document it before broad usage.

## Typography

Primary font:
- Inter

Fallback:
- system-ui, sans-serif

Rules:
- headings: 650-750 weight
- body: 400-500
- captions: 400
- avoid decorative fonts in normal UI
- keep line-height comfortable
- never use typography to compensate for poor layout

## Spacing and shape

Base spacing should follow Tailwind's spacing scale.
Do not invent random margins/paddings for each screen.

Recommended radius:
- sm: 10px
- md: 14px
- lg: 18px
- xl: 24px
- 2xl: 28px

Typical:
- cards: 16-24px
- buttons: 12-16px
- chips: pill
- image cards: 18-24px
- mobile floating action button: 56px

Shadows:
- soft only
- prefer low opacity
- avoid large dark shadows

## Icon system

Use Lucide React or the existing icon system.

Icon style:
- line-based
- rounded
- simple
- readable
- consistent stroke weight

Do not mix multiple icon styles on the same page.
Do not replace existing icons with emoji unless the product intentionally uses emoji for content such as mood, tags or streaks.

## Illustration system

Illustrations are supportive, not dominant.

Preferred subjects:
- young person / neutral character
- small cat
- plants
- mountains
- laptop
- camera
- coffee
- book
- camping
- nature

Preferred style:
- flat
- soft
- green/cream palette
- friendly
- minimal
- neutral/unisex

Use illustrations mainly in:
- onboarding
- empty states
- achievements
- reminders
- recaps
- selected hero areas

Do not add a mascot to every card.

## Photography system

Photography is the main emotional content of Kimo Life.

### Single image
- object-fit: cover
- default aspect ratio: 4:3 or 1:1
- radius: 18-24px

### Photo grid
- use 2- or 3-column arrangements where appropriate
- preserve consistent gaps
- do not make every gallery tile identical if a featured image improves hierarchy

### Signature PhotoStack

When displaying three photos:
- center image is the primary image
- left image sits behind and rotates about -6deg
- right image sits behind and rotates about +6deg
- side images are smaller
- center image has the highest z-index
- side images should not obstruct important content
- on desktop hover: side images may move outward slightly
- on mobile tap/enter: subtle spring animation

This component must be reusable across:
- memory cards
- shared memories
- weekly recap
- monthly recap
- on-this-day
- profile highlights

Do not recreate PhotoStack with ad-hoc CSS in individual pages.

## Layout principles

### Mobile navigation

Primary bottom navigation:
- Today
- Calendar
- Add (+)
- Together
- Me

The center Add button is visually prominent.

### Desktop

Do not simply stretch the mobile layout.
Use a centered shell or light sidebar while preserving mobile visual language.
Avoid huge dashboard grids.

## Core screens

### Today

Purpose: daily entry point.

Typical order:
1. greeting
2. date card
3. quick actions
4. today's memories
5. activities / habits
6. current streaks

CTA:
- + Add memory

### Calendar

Purpose: view life history.

Must support:
- month view
- selected day
- photo thumbnails
- memory indicators
- activity/mood cues

Possible secondary view:
- timeline

### Day Detail

Purpose: reconstruct one day.

Contains:
- date
- short summary
- stats
- timeline of memories
- activities
- mood
- tags

Timeline should feel calm and readable.

### Streaks

Purpose: habit continuity.

Show:
- current streak
- best streak
- total completed
- lightweight daily grid

Do not make it look like a hardcore game dashboard.

### Together

Purpose: lightweight social connection.

Sections may include:
- shared streaks
- friends
- shared memories
- activity

Avoid a dense social feed.

### Chat

Simple, warm conversation UI.

Support:
- text
- optional image
- shared memory preview
- reactions

### Notifications

Categories:
- social
- streak
- reminder
- system

Keep notification cards compact.

### Profile

Personal space, not a public influencer profile.

Show:
- avatar
- name
- username
- basic stats
- memories
- streaks
- achievements
- settings

## Memory creation UX

Memory creation must be fast.

Preferred flow:
1. tap +
2. select camera/upload/note
3. preview
4. optional caption
5. optional activity
6. optional mood
7. optional tags
8. optional location
9. choose visibility
10. save

Do not force every field.

Primary visibility:
- private
- friends
- public

Default should be private.

After save:
- immediate visual confirmation
- subtle success animation
- friendly text such as "Đã lưu khoảnh khắc 🌱"

## Motion system

Animation is mandatory for polish but must remain restrained.

Use Motion for React or the project's existing motion system.

Guidelines:
- fast: 120-180ms
- normal: 200-280ms
- emphasized: 300-450ms

Preferred motion:
- easeOut
- easeInOut
- gentle spring

Avoid:
- large bounce
- long decorative transitions
- constant pulsing
- excessive parallax

### Standard transitions

Page:
- fade + y: 6-10px

Card entrance:
- opacity 0->1
- y 8->0

Modal:
- opacity + scale 0.96->1

Bottom sheet:
- y 100%->0

Toast:
- fade + y 8->0

PhotoStack:
- center image enters first
- side images rotate into position

Button press:
- scale about 0.98

Tab:
- subtle fade/slide

Reaction:
- tiny spring scale

Streak milestone:
- subtle flame pulse

Achievement:
- scale + gentle spring

Never animate every element simultaneously.

## Accessibility

Always support:
- keyboard navigation
- visible focus states
- semantic labels / ARIA where needed
- sufficient contrast
- touch-friendly targets
- prefers-reduced-motion

When reduced motion is requested:
- remove non-essential transforms and decorative animation
- keep only functional state changes

## Responsive rules

Primary breakpoints to test:
- 375px
- 390px
- 414px
- 768px
- 1024px
- 1280px+

At every breakpoint verify:
- no horizontal overflow
- cards do not become too dense
- typography remains readable
- photo compositions remain balanced
- bottom navigation remains usable
- touch targets remain large enough

## Component reuse rules

Before creating a new component, search the project for an existing component that can be reused.

Important reusable components:
- AppShell
- BottomNavigation
- Button
- Card
- Avatar
- Badge
- Tag
- Modal
- BottomSheet
- Toast
- Tooltip
- EmptyState
- Skeleton
- PhotoStack
- PhotoGrid
- MemoryCard
- MemoryDetail
- StreakCard
- ActivityChip
- MoodPicker
- CalendarDay
- CalendarMonth
- NotificationItem
- FriendCard
- MessageBubble
- ReminderCard
- ProgressBar

Do not create duplicate components with near-identical visual behavior.

## Page consistency rules

Every new page must answer these questions before implementation:

1. Which existing Kimo Life page is visually closest?
2. Which existing components can be reused?
3. Which design tokens will be used?
4. Which existing motion patterns should be reused?
5. Does the page preserve the same density and whitespace?
6. Does the page look like it belongs to the same application?

If the answer is unclear, stop and inspect existing UI before coding.

## Change control / anti-drift protocol

This is critical.

When modifying an existing UI:
- preserve existing layout unless change is explicitly requested
- do not restyle unrelated components
- do not rename or replace tokens casually
- do not introduce a second button system
- do not introduce a second card system
- do not change global font, spacing, radius or colors for a local feature
- avoid broad CSS selectors
- avoid global overrides that can affect unrelated pages

When the user asks for a local change, make the smallest change necessary.

When the user asks to change a global design decision, update the design tokens first, then update affected components systematically.

## New-feature design protocol

For every new feature:

1. Identify closest existing pattern.
2. Reuse design tokens.
3. Reuse components.
4. Reuse motion primitives.
5. Implement mobile-first.
6. Check desktop adaptation.
7. Check empty/loading/error/success states.
8. Check reduced motion.
9. Check accessibility.
10. Verify the feature does not visually drift from existing screens.

Before finalizing, compare the new page mentally against:
- Today
- Calendar
- Day Detail
- Streaks
- Together
- Profile

If it looks like a different product, revise it.

## Visual QA checklist

Before declaring UI complete:

- [ ] Green-first palette preserved
- [ ] Cute but unisex
- [ ] Mobile-first
- [ ] Same typography
- [ ] Same card language
- [ ] Same radius system
- [ ] Same icon style
- [ ] Same spacing rhythm
- [ ] Same shadow softness
- [ ] Photo-first where appropriate
- [ ] PhotoStack reused instead of duplicated
- [ ] Animations subtle and consistent
- [ ] Reduced-motion behavior present
- [ ] Empty/loading/error states designed
- [ ] No horizontal overflow
- [ ] No accidental global CSS changes
- [ ] Existing pages still visually consistent

## When modifying design tokens

Only modify global tokens when the user explicitly asks for a new global visual direction.

When tokens change:
1. record the new values in this design system;
2. update semantic variables;
3. update shared components;
4. inspect all core screens;
5. ensure contrast and consistency.

Never silently change the visual identity because a local component looks better with another color.

## Technical UI conventions

Preferred stack:
- Laravel
- PHP 8.3+
- Inertia
- React
- TypeScript
- Tailwind CSS
- shadcn/ui where useful
- Lucide React
- Motion for React

Use the project's existing versions if they differ; do not upgrade dependencies merely to implement a UI feature unless required.

Prefer:
- semantic component APIs
- typed props
- Tailwind utility classes or shared component styles
- CSS variables for design tokens
- data-driven components

Avoid:
- giant page components
- duplicated style literals
- arbitrary magic numbers everywhere
- unnecessary third-party UI kits

## Image and asset policy

When creating new illustrations or decorative images:
- preserve the Kimo Life green/cream visual style
- keep subjects neutral and friendly
- avoid visual style changes between pages
- prefer WebP/AVIF/SVG when appropriate
- use responsive image sizes
- never load a huge original image into thumbnail lists

## Final rule

The design system is more important than any individual screen.

A new feature is successful only when it feels like it was always part of Kimo Life.

When in doubt, prefer:
Green + cream + white
soft rounded cards
real photos
simple line icons
natural illustrations
calm spacing
subtle motion
friendly copy
mobile-first composition

Never trade consistency for novelty.
