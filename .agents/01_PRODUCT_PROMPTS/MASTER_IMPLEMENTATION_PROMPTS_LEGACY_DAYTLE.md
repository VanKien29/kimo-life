# DAYTLE — MASTER IMPLEMENTATION PROMPTS
## Bộ prompt triển khai toàn bộ dự án Laravel + React từ số 0 đến hoàn thiện

> Mục đích của tài liệu này: đưa cho AI coding agent (Cursor, Claude Code, Gemini CLI, Codex hoặc công cụ tương tự) để triển khai Daytle theo từng phase.
>
> **Quy tắc quan trọng:** Không dùng tài liệu này như một prompt duy nhất để code toàn bộ ứng dụng trong một lần. Hãy chạy từng prompt/phase theo thứ tự. Sau mỗi phase phải build, test, kiểm tra UI và sửa regression trước khi sang phase tiếp theo.

---

# 0. PRODUCT VISION — NGUỒN SỰ THẬT CỦA SẢN PHẨM

Tên tạm thời: **Daytle**

Tagline:

> **Small moments. A better you.**

Daytle là một ứng dụng web/mobile-first kết hợp:

- Daily Memory / Life Journal
- Photo Moments
- Calendar
- Timeline
- Habit Tracking
- Personal Streak
- Shared/Duo Streak
- Friends
- Shared Memories
- Chat
- Notifications
- Reminders
- Weekly / Monthly Recap

## Tinh thần sản phẩm

Daytle không phải:

- productivity dashboard khô khan
- todo app
- mạng xã hội kiểu Facebook
- habit tracker thuần túy
- photo gallery thuần túy

Daytle phải tạo cảm giác:

- friendly
- modern
- cozy
- clean
- cute nhưng trung tính
- unisex
- nhẹ nhàng
- thân thiện
- có cảm giác “êm”
- ảnh là nội dung quan trọng nhất
- habit/streak là một phần của cuộc sống, không phải mục tiêu duy nhất

Ý tưởng cốt lõi:

> Người dùng lưu lại những khoảnh khắc nhỏ trong ngày; từ những khoảnh khắc đó hình thành lịch sử cuộc sống, các hoạt động, thói quen và chuỗi tiến bộ.

## Product principle

Flow cơ bản:

Open app
→ xem hôm nay
→ thêm một khoảnh khắc
→ check-in hoạt động/habit
→ nhìn progress
→ kết nối với bạn bè nếu muốn
→ rời app.

Các tính năng phải hỗ trợ flow này, không được làm UI trở nên nặng nề.

---

# 1. MASTER AGENT PROMPT — DÙNG TRƯỚC TẤT CẢ CÁC PHASE

```text
Bạn là Senior Full-Stack Engineer + Product Engineer + UI/UX Engineer.

Bạn đang xây dựng ứng dụng Daytle.

Đọc toàn bộ tài liệu / rules sau trước khi sửa code:

1. docs/DAYTLE_MASTER_IMPLEMENTATION_PROMPTS.md nếu file này đã được copy vào project.
2. .claude/skills/daytle-ui/SKILL.md nếu có.
3. docs/DESIGN_SYSTEM.md nếu có.
4. docs/PRODUCT_SPEC.md nếu có.
5. docs/ARCHITECTURE.md nếu có.

Nếu các file trên tồn tại, chúng là source of truth.
Không tự ý tạo design language mới.
Không tự ý đổi màu, typography, spacing, radius hoặc animation system.

Nếu có mâu thuẫn:
1. project architecture hiện tại
2. design system
3. product rules
4. phase prompt hiện tại
5. implementation preference của agent

Mục tiêu là giữ UI/UX đồng nhất qua toàn bộ vòng đời dự án.

TECH STACK MỤC TIÊU:

Backend:
- Laravel
- PHP
- MySQL hoặc PostgreSQL

Frontend:
- React
- TypeScript
- Inertia

UI:
- Tailwind CSS
- shadcn/ui khi phù hợp
- lucide-react

Animation:
- Motion for React

Utilities:
- Carbon backend
- date-fns frontend

Realtime khi cần:
- Laravel Reverb / Broadcasting

Queue:
- Laravel Queue

Scheduler:
- Laravel Scheduler

Storage:
- Laravel Filesystem

Image processing:
- Intervention Image hoặc giải pháp tương đương phù hợp

PRINCIPLE:

Không build fake prototype.
Không để business logic quan trọng chỉ tồn tại ở frontend.
Không hard-code dữ liệu production.
Không duplicate component.
Không tạo component khổng lồ.
Không tạo CSS riêng rải rác khi design token/reusable component đã có.
Không phá design system để hoàn thành một feature nhanh.

MOBILE-FIRST:

Primary:
375px
390px
414px

Then:
768px
1024px
1280px+

Mobile là primary experience.
Desktop phải là responsive adaptation có chủ đích, không chỉ scale một layout mobile.

DESIGN:

Primary green:
#74C69D

Primary dark:
#3F8F6B

Soft green:
#A7D7A7

Very light green:
#E8F5E9

Background:
#F8FAF7

Surface:
#FFFFFF

Border:
#DDE7E0

Text:
#24312A

Secondary text:
#6B7280

Muted:
#94A3B8

Accent:
#FFD59A

Streak:
#FF8A65

Soft blue:
#8EC5FF

Soft red:
#FCA5A5

STYLE:

- modern
- clean
- cute but unisex
- soft
- natural
- friendly
- rounded
- photo-first
- green-led
- cream/white surfaces
- light illustrations
- no excessive pink
- no neon green
- no huge dark blocks
- no excessive gradients
- no dramatic shadows
- no admin-dashboard appearance

TYPOGRAPHY:

Inter or a close modern system-safe equivalent.

ICON:

Use lucide-react or one coherent line-icon family.

ILLUSTRATION:

Soft flat illustration.
Green/cream/natural palette.
Young character + cat can appear as a recurring visual motif.
Mascot is supporting decoration, not the primary content.

IMAGE SYSTEM:

Photos are critical.

Use:
- single hero image
- 2-column grid
- 3-column grid
- carousel
- layered PhotoStack

PHOTO STACK:

When exactly 3 images:
- center image is largest
- left image slightly rotated counter-clockwise
- right image slightly rotated clockwise
- center image highest z-index
- side images lower z-index
- side images move outward slightly on hover
- small spring animation on interaction
- must remain readable and not overlap text

Create a reusable <PhotoStack /> component.

MOTION:

Animations should feel calm and premium.

Typical duration:
120–180ms fast
200–280ms normal
300–450ms emphasized

Use:
- opacity
- small translateY
- subtle scale
- gentle spring

Avoid:
- aggressive bounce
- long animations
- unnecessary page animation
- animating every element

Support prefers-reduced-motion.

WHEN ADDING A FEATURE:

1. inspect existing design system
2. inspect existing reusable components
3. inspect current route/page architecture
4. inspect existing data model
5. reuse components
6. extend tokens if needed instead of bypassing them
7. implement backend
8. implement frontend
9. implement states
10. test responsive behavior
11. test reduced motion
12. run tests
13. check visual consistency
14. report files changed and any architectural decisions

If a feature can be implemented more simply without harming UX, choose the simpler solution.
```

---

# 2. PROMPT — PHASE 0: KHỞI TẠO PROJECT + FOUNDATION

```text
Bắt đầu Phase 0 của Daytle.

Mục tiêu:
Tạo foundation sạch, ổn định, có thể mở rộng.

Tasks:

1. Inspect môi trường hiện tại.
2. Nếu project chưa tồn tại:
   - tạo Laravel project mới
   - dùng official Laravel React Starter Kit nếu phù hợp với môi trường hiện tại
   - xác nhận package versions tương thích trước khi cài
3. Setup:
   - React
   - TypeScript
   - Inertia
   - Tailwind
   - shadcn/ui khi cần
   - lucide-react
   - Motion
4. Setup authentication foundation.
5. Setup database.
6. Setup environment example.
7. Setup Vite.
8. Setup aliases.
9. Setup code formatting/linting nếu phù hợp.
10. Setup testing foundation.
11. Setup folder structure.

Frontend structure mục tiêu:

resources/js/
  components/
    ui/
    memory/
    calendar/
    streak/
    social/
    chat/
    notification/
    profile/
    shared/
  pages/
    Today/
    Calendar/
    Memory/
    Streak/
    Together/
    Chat/
    Profile/
  layouts/
  hooks/
  lib/
  types/

Backend structure:

app/
  Models/
  Http/
    Controllers/
    Requests/
  Policies/
  Jobs/
  Notifications/
  Services/ hoặc Actions/ nếu thực sự cần

12. Tạo AppLayout mobile-first.
13. Tạo bottom navigation placeholder:
   Home
   Calendar
   +
   Together
   Me
14. Tạo design token foundation.
15. Tạo global styles.
16. Tạo base Button/Card/Input/Badge/Avatar/Modal/Sheet components.
17. Tạo empty state và loading skeleton foundation.

Không triển khai business feature thực sự ở phase này.

Kết quả cần có:
- project chạy được
- auth chạy được
- React render ổn
- Tailwind hoạt động
- design tokens hoạt động
- app shell hoạt động
- responsive cơ bản hoạt động
- tests chạy được

Sau khi hoàn thành:
- chạy test
- chạy build
- báo cáo các package/version thực tế đã dùng
- không chuyển sang phase tiếp theo tự động
```

---

# 3. PROMPT — PHASE 1: DESIGN SYSTEM + VISUAL FOUNDATION

```text
Triển khai Phase 1: Daytle Design System.

Mục tiêu:
Khóa visual language để các phase sau không làm UI bị lệch.

Tạo hoặc cập nhật:
docs/DESIGN_SYSTEM.md

Trong code:
- định nghĩa color tokens
- typography scale
- radius
- spacing
- shadows
- border
- z-index conventions
- component states
- motion tokens

Màu:

Primary:
#74C69D

Primary Dark:
#3F8F6B

Soft Green:
#A7D7A7

Background:
#F8FAF7

Surface:
#FFFFFF

Border:
#DDE7E0

Text:
#24312A

Secondary:
#6B7280

Muted:
#94A3B8

Accent:
#FFD59A

Streak:
#FF8A65

Blue:
#8EC5FF

Danger:
#FCA5A5

Tạo semantic token:
--color-primary
--color-primary-hover
--color-surface
--color-background
--color-text
--color-muted
--color-border
--color-success
--color-warning
--color-danger
...

Không hard-code hex rải rác trong components.

COMPONENTS:

Button
Card
Input
Textarea
Select
Badge
Tag
Avatar
AvatarGroup
IconButton
Tabs
Toast
Modal
Sheet
Dropdown
Tooltip
Skeleton
EmptyState
Progress
Divider

Định nghĩa states:
default
hover
active
focus
disabled
loading
selected
error
success

PHOTO COMPONENTS:

SinglePhoto
PhotoGrid
PhotoStack
PhotoCarousel

PhotoStack phải trở thành visual signature của Daytle.

MOTION SYSTEM:

Tạo animation constants/helpers hoặc variants dùng chung.

Page enter:
fade + y 8

Card enter:
opacity + y 8

Modal:
opacity + scale .96

Sheet:
translateY

Button press:
scale .98

Selected state:
small scale / ring

Reaction:
small spring

PhotoStack:
side images rotate into place

Achievement:
small spring + subtle celebration

Reduced motion:
disable non-essential motion

Tạo Storybook-like preview page hoặc internal UI showcase page để xem toàn bộ components.

Acceptance:

Không component nào tự định nghĩa màu trái với system.

Không tạo border-radius ngẫu nhiên.

Không tạo shadow ngẫu nhiên.

Không tạo animation ad hoc nếu đã có motion token.

Cuối phase:
- build
- test
- kiểm tra mobile
- kiểm tra desktop
- kiểm tra reduced motion
```

---

# 4. PROMPT — PHASE 2: AUTH + ONBOARDING

```text
Triển khai authentication và onboarding.

AUTH:

- Login
- Register
- Forgot password
- Reset password
- Email verification nếu phù hợp
- Logout
- Profile basics

ONBOARDING:

3–4 bước.

Screen 1:
"Những khoảnh khắc nhỏ tạo nên một ngày lớn."

Screen 2:
"Lưu lại những điều đáng nhớ."

Screen 3:
"Theo dõi những điều bạn muốn duy trì."

Screen 4:
"Cùng bạn bè giữ chuỗi."

Visual:
- green/cream
- natural illustration
- character + cat nhẹ
- không pink-heavy
- modern
- mobile-first

Controls:
Skip
Next
Get Started

Onboarding không được quá dài.

Sau onboarding:
→ Today

Profile initial fields:
- name
- username
- avatar
- bio optional
- timezone
- locale

Username:
- unique
- validated
- safe characters
- case-insensitive uniqueness nếu kiến trúc yêu cầu

Avatar:
- validate image
- generate appropriate display size

Add route protection.

Acceptance:
User có thể hoàn thành auth → onboarding → vào app.
```

---

# 5. PROMPT — PHASE 3: MEMORY CORE

```text
Triển khai module Memory.

Đây là core feature quan trọng nhất.

DATABASE:

memories
- id
- user_id
- title nullable
- content nullable
- memory_date
- mood nullable
- visibility
- location nullable
- created_at
- updated_at
- deleted_at

memory_photos
- id
- memory_id
- path
- thumbnail_path hoặc equivalent
- width
- height
- position
- created_at

activities
- id
- user_id
- name
- icon
- color
- created_at
- updated_at

memory_activity
- memory_id
- activity_id

tags
- id
- user_id
- name

memory_tag
- memory_id
- tag_id

favorites
- id
- user_id
- memory_id

FEATURES:

Create Memory
Edit Memory
Delete Memory
View Memory
Favorite
Set visibility:
- private
- friends
- public

Upload:
- multiple images
- preview
- progress
- validation
- compression
- thumbnail
- lazy loading
- retry on failed upload if feasible

Quick add flow:

Click +
→ Bottom Sheet
→ Add photo / Write note
→ preview
→ caption
→ activity
→ mood
→ tags
→ location optional
→ visibility
→ Save

Không ép user nhập tất cả field.

UI:

Today page có CTA:
"+ Thêm khoảnh khắc"

Memory card:
- photo-first
- caption nhỏ
- time
- activity tags

Nếu 3 ảnh:
bắt buộc ưu tiên PhotoStack.

Nếu 1 ảnh:
hero/card.

Tạo reusable components:
MemoryCard
MemoryList
MemoryGrid
MemoryComposer
PhotoUploader
PhotoStack
PhotoCarousel
MoodPicker
ActivityChip
TagInput
VisibilityPicker

Security:
- ownership
- authorization
- validation
- safe upload
- no arbitrary file names
- policy checks

Tests:
- create
- edit
- delete
- upload
- privacy
- favorite
- activity association
```

---

# 6. PROMPT — PHASE 4: TODAY DASHBOARD

```text
Triển khai Today Dashboard.

Mục tiêu:
Đây là màn hình người dùng mở mỗi ngày.

Header:

"Chào buổi sáng, {name}! 🌱"

Subtext:
"Mỗi ngày đều có một điều nhỏ đáng nhớ."

Date card:
Thứ Sáu
05 Tháng 09, 2026

Có thể có thời tiết nếu có reliable source.
Nếu chưa có weather service:
để UI optional, không hard-code fake data production.

Stats:
- số moments hôm nay
- số activities/habits
- mood

Quick actions:
- Thêm ảnh
- Viết nhật ký
- Check-in
- Tâm trạng

Section:
"Khoảnh khắc hôm nay"

Section:
"Hôm nay bạn đã làm gì?"

Section:
"Chuỗi của bạn"

Today phải:
- không quá dài
- photo-first
- quick interactions
- có empty state đẹp
- có skeleton
- có error state
- có subtle animation

PhotoStack được dùng khi memory có nhiều ảnh.

Không tạo dashboard với quá nhiều biểu đồ.

Responsive:
Mobile:
bottom nav fixed.

Desktop:
centered shell/sidebar nhẹ.

Acceptance:
Mở Today lên có thể hiểu app trong 3–5 giây.
```

---

# 7. PROMPT — PHASE 5: CALENDAR + DAY DETAIL

```text
Triển khai Calendar và Day Detail.

CALENDAR:

Month view.
Header:
< September 2026 >

Grid:
Mon Tue Wed Thu Fri Sat Sun

Mỗi ngày:
- thumbnail nếu có memory
- count
- mood indicator
- streak indicator nếu có

Selected day:
- soft green outline
- subtle selected motion

Không dùng màu mạnh.

Click day:
→ Day Detail

Tạo:
CalendarMonth
CalendarDay
CalendarHeader
CalendarLegend

DAY DETAIL:

Header:
05 Tháng 09, 2026

Subtitle:
"Một ngày bình yên với nhiều điều đáng nhớ."

Summary:
- 5 memories
- 2 activities
- mood

Timeline:
08:20
Photo + caption

12:30
Photo + caption

18:42
Photo + caption

21:10
Photo + caption

Timeline:
- soft green line
- gentle timeline entrance
- readable on mobile

Add Memory CTA ở cuối hoặc floating action tùy UX.

Ngoài Month View:
Timeline view optional.

Performance:
- không load toàn bộ lịch sử nếu không cần
- query theo month
- chỉ load thumbnails ở calendar
- original images chỉ ở detail

Tests:
- month navigation
- day selection
- empty day
- memory day
- privacy
```

---

# 8. PROMPT — PHASE 6: ACTIVITY + HABIT + PERSONAL STREAK

```text
Triển khai Activity và Habit/Streak system.

ACTIVITY:

Ví dụ:
Coding
Reading
Workout
Walking
Travel
Gaming
Coffee

User có thể:
- create
- edit
- archive
- choose icon
- choose color

STREAK:

streaks
- id
- user_id
- name
- icon
- color
- goal_type
- frequency
- start_date
- active
- current_streak
- best_streak
- created_at
- updated_at

streak_logs
- id
- streak_id
- date
- completed
- created_at

Goal types:
- every_day
- weekdays
- x_days_per_week

UI:

"Learn Laravel"

🔥 12 ngày liên tiếp

Current
Best
Total

Calendar heatmap nhẹ.

Không biến toàn bộ app thành game.

Flow:

User check-in activity
→ validate rule
→ update streak
→ store streak log
→ update related UI
→ trigger notification/celebration nếu đạt milestone

Có thể tự động kết nối:
Memory activity = Coding
→ nếu streak Coding tồn tại
→ suggest/check-in streak

Không tự động ghi thành completed nếu business rule chưa rõ.
Phải có logic rõ ràng.

Tests:
- first day
- consecutive days
- broken streak
- timezone
- weekly goal
- skipped day
- best streak
- current streak
```

---

# 9. PROMPT — PHASE 7: MOOD + TAGS + FAVORITES + SEARCH

```text
Triển khai các tính năng phụ hỗ trợ memory.

MOOD:

Mức cơ bản:
Terrible
Bad
Normal
Good
Great

Có thể map:
😫
😕
😐
🙂
😍

UI không quá emoji-heavy.

TAGS:
#coding
#daily
#travel
#food
#friends
#work

Favorites:
favorite/unfavorite

SEARCH:

Search memories by:
- content
- title
- tag
- activity

Filter:
- date range
- activity
- mood
- tag
- location optional

Results:
photo-first.

Search phải dùng pagination/infinite loading.

Tạo:
SearchInput
SearchFilters
FilterChip
SearchResultCard

Không load toàn bộ memories vào browser rồi filter.
Filter chính phải được xử lý tốt ở backend/database.
```

---

# 10. PROMPT — PHASE 8: TOGETHER + FRIEND SYSTEM

```text
Triển khai Together và Friend System.

Mục tiêu:
Social nhẹ nhàng.
Không biến thành Facebook.

FRIENDSHIP:

friendships
- id
- user_id
- friend_id
- status
- created_at
- updated_at

Status:
pending
accepted
declined
blocked

Features:
- search user
- send friend request
- accept
- decline
- remove friend
- block

Privacy:
Private by default.

PROFILE:
- avatar
- name
- username
- bio
- memory count
- streak count
- friends count

TOGETHER SCREEN:

Tabs:
- Hoạt động
- Bạn bè
- Thử thách

Sections:
Shared Streaks
Friends
Recent Activity
Shared Memories

ACTIVITY FEED:

Ví dụ:
"Minh đã đạt chuỗi 7 ngày học code."

"Kien đã thêm một khoảnh khắc."

"Long đã tham gia một challenge."

Không biến thành infinite content feed nặng.

Friend card:
avatar
name
username
relationship state
CTA

Add:
Block/report flows khi cần.

Authorization:
friend-only data chỉ được xem khi friendship accepted.
```

---

# 11. PROMPT — PHASE 9: SHARED MEMORY

```text
Triển khai Shared Memory.

Mục tiêu:
Nhiều người cùng lưu một khoảnh khắc.

shared_memories
- id
- title
- description
- date
- owner_id
- created_at
- updated_at

shared_memory_users
- shared_memory_id
- user_id
- role
- joined_at

Mỗi participant có thể:
- thêm photo
- thêm note
- xem memory
- reaction

UI:

"Our Memory"

PhotoStack/Carousel.

Participants:
avatar group

Title:
"Our Trip"

Date.

Memory:
photos
caption
participants
reactions

Shared memory phải dùng cùng:
- Card
- PhotoStack
- AvatarGroup
- Green theme
- Motion

Flow:

Create shared memory
→ select friends
→ invite
→ accepted
→ participants add content

Privacy:
shared memory không tự động public.

Permissions:
owner
participant
viewer nếu cần.

Không duplicate image system.
```

---

# 12. PROMPT — PHASE 10: DUO STREAK + GROUP CHALLENGE

```text
Triển khai Social Streak.

DUO STREAK:

duo_streaks
- id
- name
- activity_id
- created_by
- frequency
- start_date
- current_streak
- best_streak
- status

duo_streak_members
- duo_streak_id
- user_id
- role

duo_streak_logs
- id
- duo_streak_id
- date
- user_id
- completed

Ví dụ:

Coding Together

Kien × Minh

🔥 15 ngày

Daily state:
Kien ✅
Minh ✅

Nếu Minh chưa check-in:
"Minh hasn't checked in yet."

CTA:
"Nhắc bạn"

Reminder limit:
1 reminder/member/day.

GROUP CHALLENGE:

name
goal
members
duration
progress

Ví dụ:
30 Days Coding

Kien 12/30
Minh 10/30
Nam 8/30

Không tạo leaderboard quá căng thẳng.

STREAK RESCUE:
optional.
Không phạt người dùng quá mạnh.

Có thể:
"Bạn đã bỏ lỡ hôm nay."
"Check in now."

Không ép.
```

---

# 13. PROMPT — PHASE 11: REACTIONS + COMMENTS + NOTIFICATIONS

```text
Triển khai interactions.

REACTIONS:

❤️
🔥
👏
✨
😂
🥹

Reaction phải nhẹ.

COMMENTS:
- text
- author
- timestamp
- delete own
- authorization

Không cần reply chain ở phase này.

NOTIFICATIONS:

notifications
- id
- user_id
- type
- actor_id nullable
- data
- read_at
- created_at

Types:
friend_request
friend_accepted
reaction
comment
memory_share
streak
duo_streak
challenge
reminder

UI:
Notification Center

Tabs:
All
Friends
Streaks
System

Unread count.

Notification style:
- avatar
- icon
- short text
- relative time

Animation:
fade + small slide.

Không spam notification.
```

---

# 14. PROMPT — PHASE 12: CHAT + SHARED MEMORY IN CHAT

```text
Triển khai Chat.

CONVERSATIONS:

conversations
conversation_members
messages

Conversation:
- direct chat trước
- group chat có thể thêm sau

Message:
- text
- sender
- timestamp
- optional image
- optional shared_memory_id

UI:

Conversation List:
avatar
name
last message
timestamp
unread badge

Chat:
header
messages
composer

Composer:
text
emoji
image
send

Message bubble:
- clean
- soft
- rounded
- readable

Shared Memory preview trong chat:

[PhotoStack/Preview]
"Weekend Trip"
Sep 05

Realtime:
nếu triển khai:
Laravel Reverb + Broadcasting.

Events:
newMessage
messageRead
typing optional

Không triển khai typing indicator nếu chưa thực sự cần.

Security:
- user chỉ đọc conversation mình thuộc về
- validate attachment
- message authorization
```

---

# 15. PROMPT — PHASE 13: REMINDER SYSTEM + DUOLINGO-LIKE RETENTION

```text
Triển khai Reminder System.

Triết lý:
lấy cảm hứng từ Duolingo về retention, nhưng không copy giọng điệu gây áp lực.

Reminder types:

daily_memory
habit
streak
duo_streak
weekly_recap
monthly_recap

reminders
- id
- user_id
- type
- title
- time
- days_of_week
- enabled
- timezone
- payload
- created_at
- updated_at

UI:
Reminder settings.

Ví dụ:

📷 Daily Memory
Every day
21:30

💻 Coding
Weekdays
20:00

🔥 Duo Streak
Every day
21:00

Copy thân thiện:

"Một khoảnh khắc nhỏ trước khi ngày kết thúc?"

"🔥 Chuỗi của bạn vẫn đang chờ."

"Còn một bước nữa để giữ chuỗi hôm nay."

KHÔNG dùng:
"Bạn chưa học!!!"
"Chuỗi sắp mất!!!"
các copy mang tính gây căng thẳng.

Implement:
- Laravel Scheduler
- Queue jobs
- Laravel Notifications
- timezone-aware logic

Friend reminder:
1 reminder/person/day.

Reminder should be idempotent.

Do not send duplicate notifications if job retry occurs.

Smart reminder để phase sau.
```

---

# 16. PROMPT — PHASE 14: DAILY QUEST + ACHIEVEMENTS

```text
Triển khai lightweight gamification.

DAILY QUESTS:

Examples:
- Save a memory
- Complete a habit
- Write a note
- Check in with a friend

Progress:
2 / 4 completed

Không gọi là task manager.

ACHIEVEMENTS:

First Memory
10 Memories
100 Memories
7 Day Streak
30 Day Streak
100 Coding Days
First Shared Memory
First Duo Streak

user_achievements

UI:
Badge
Milestone card
Celebration

Motion:
small spring
subtle confetti

Không tạo animation quá lớn.

Logic achievements phải được xử lý ở backend hoặc domain logic đáng tin cậy.

Nếu nhiều event có thể unlock cùng achievement:
đảm bảo idempotent.

Không tạo duplicate achievement.
```

---

# 17. PROMPT — PHASE 15: WEEKLY / MONTHLY RECAP

```text
Triển khai recap.

WEEKLY RECAP:

"Tuần này của bạn 🌿"

Stats:
8 memories
5 coding days
2 walks
1 shared memory

Favorite memory:
PhotoStack

Copy:
"Bạn đã tiến bộ một chút mỗi ngày."

MONTHLY RECAP:

"September in memories"

Hiển thị:
- highlight photos
- memory count
- activity count
- longest streak
- best day
- favorite activity
- shared moments

PHOTO COLLAGE:

Ưu tiên:
- PhotoStack
- asymmetric collage nhẹ
- không làm masonry quá rối

RECAP phải:
- visually beautiful
- shareable về sau
- responsive
- photo-first

Generation:
dùng queued jobs nếu recap cần tính toán nặng.

Cache kết quả khi hợp lý.

Không query hàng nghìn record cho mỗi page load nếu có thể precompute.
```

---

# 18. PROMPT — PHASE 16: ON THIS DAY

```text
Triển khai "On This Day".

Ví dụ:

05 Sep 2025
Bạn đã bắt đầu học Laravel.

05 Sep 2024
Weekend trip.

Logic:
date month/day match previous years.

Privacy:
chỉ hiển thị memories mà current user có quyền xem.

UI:
Memory card / PhotoStack

Tone:
nhẹ nhàng
nostalgic
không dramatic

Nếu không có memory:
không hiển thị section hoặc hiển thị empty state rất nhẹ.

Có CTA:
"Xem lại khoảnh khắc"
```

---

# 19. PROMPT — PHASE 17: PROFILE + PRIVACY + SETTINGS

```text
Triển khai Profile và Settings.

PROFILE:

Avatar
Name
Username
Bio

Stats:
342 memories
12 streaks
28 friends

Tabs:
Memories
Streaks
Badges

Profile có thể có highlights bằng PhotoStack.

PRIVACY:

Visibility defaults:
private

Controls:
- profile visibility
- memory default visibility
- allow friend requests
- allow follows nếu follow đã được triển khai
- discoverability

ACCOUNT:
- name
- username
- email
- password
- avatar

NOTIFICATIONS:
- reminder toggles
- social notifications
- streak notifications
- recap notifications

APPEARANCE:
- system/light/dark nếu muốn
- nhưng visual Daytle phải giữ identity

SECURITY:
- password
- active sessions nếu phù hợp
- delete account

DATA:
- export data
- delete account

DELETE ACCOUNT:
phải có confirmation flow
không xóa nhầm.
```

---

# 20. PROMPT — PHASE 18: PHOTO STORAGE + PERFORMANCE HARDENING

```text
Audit toàn bộ photo pipeline.

Mục tiêu:
Daytle là photo-heavy.

Implement/check:

- original image
- thumbnail
- medium
- large/responsive equivalent
- WebP/AVIF khi phù hợp
- lazy loading
- responsive image sizes
- object-fit
- EXIF handling nếu cần
- upload size limits
- validation
- safe storage
- duplicate handling
- deletion cleanup

Không hiển thị original image trong mọi card.

Calendar:
thumbnail.

Memory list:
thumbnail/medium.

Detail:
large.

Cache thumbnails nếu architecture phù hợp.

Performance:
- code splitting
- avoid unnecessary rerender
- memoize expensive components
- pagination
- infinite loading only when appropriate
- debounce search
- virtualize long feeds if necessary
```

---

# 21. PROMPT — PHASE 19: MICRO-INTERACTIONS + “SMOOTH EXPERIENCE”

```text
Audit toàn bộ UX về animation và transition.

Mục tiêu:
Ứng dụng cảm giác êm, nhẹ, tự nhiên.

Dùng Motion for React nhất quán.

PAGE:
fade + translateY 4–8px

CARD:
fade + translateY 6–10px

MODAL:
fade + scale .96 → 1

BOTTOM SHEET:
translateY

TAB:
subtle fade/slide

BUTTON:
scale .98 on press

SUCCESS:
fade/scale nhẹ

PHOTO STACK:
main image stays stable
side images gently rotate / move

REACTION:
small spring

STREAK:
small pulse only when updated

ACHIEVEMENT:
spring + subtle celebration

TOAST:
fade + y 6–8px

LOADING:
prefer skeleton over full-screen spinner

Motion rules:
- 120–180 fast
- 200–280 normal
- 300–450 emphasized
- gentle spring
- low bounce

Không animation:
- form field typing
- every text line
- every scroll event
- every list item excessively
- on every render

Implement:
useReducedMotion
prefers-reduced-motion

Check:
- no layout shift
- no jank
- no animation that blocks interaction
- tap should respond immediately
```

---

# 22. PROMPT — PHASE 20: ACCESSIBILITY + RESPONSIVE QA

```text
Perform accessibility and responsive audit.

Check:

- keyboard navigation
- focus visible
- semantic headings
- button labels
- icon aria-labels
- dialogs
- forms
- errors
- contrast
- touch target size
- screen reader semantics
- reduced motion

Responsive test:

375
390
414
768
1024
1280+

Check:

- bottom nav safe area
- notch/safe-area padding
- mobile keyboard
- long titles
- long captions
- empty states
- image overflow
- PhotoStack collision
- modal/sheet behavior
- landscape mobile

Do not simply enlarge mobile layout on desktop.

Desktop should:
- retain visual language
- use more horizontal space
- optionally use sidebar
- avoid giant dashboard cards

Create no new design language during QA.
```

---

# 23. PROMPT — PHASE 21: PRIVACY + SECURITY AUDIT

```text
Audit security toàn hệ thống.

Check:

Authentication
Authorization
Policies
Validation
CSRF
XSS-safe rendering
Mass assignment
Rate limiting
Uploads
File access
Privacy
Friend permissions
Shared memory permissions
Chat authorization
Notification authorization
Reminder ownership
Streak ownership

IMPORTANT:

Không tin:
user_id
owner_id
visibility
friendship
role
membership

từ frontend.

Server phải xác minh.

Check IDOR:
Không được xem/edit/delete resource của user khác chỉ bằng đổi ID.

Upload:
- MIME validation
- extension validation
- size
- safe storage
- no executable upload

Privacy:
private memory không được leak qua search/feed/calendar/public route.

Friend-only:
chỉ accepted friend được xem.

Blocked:
không được access restricted interaction.

Write regression tests cho các case nhạy cảm.
```

---

# 24. PROMPT — PHASE 22: TESTING TOÀN HỆ THỐNG

```text
Viết/hoàn thiện test suite.

BACKEND:

Auth
Memory
Photo upload
Calendar
Activities
Streak
Friendship
Shared Memory
Duo Streak
Reactions
Comments
Chat
Notifications
Reminders
Achievements
Privacy

Critical tests:

1. user cannot read private memory of another user
2. user cannot edit another user's memory
3. friend-only memory only visible to accepted friend
4. blocked users cannot interact
5. streak current value correct
6. broken streak correct
7. timezone-safe streak behavior
8. reminder does not duplicate
9. duplicate achievement not created
10. notification only sent to authorized recipient
11. conversation authorization correct
12. shared memory membership enforced

FRONTEND:

Critical component behavior:
- MemoryCard
- PhotoStack
- CalendarDay
- StreakCard
- FriendCard
- MessageBubble
- ReminderCard

Run:
lint
typecheck
tests
build

Không chấp nhận:
- broken type
- console errors
- failing tests
- hydration issues
- inaccessible dialog
```

---

# 25. PROMPT — PHASE 23: SEEDER / DEMO DATA / DEVELOPMENT EXPERIENCE

```text
Tạo realistic development data.

Users:
Kien
Minh
Nam
Long
Tuan

Activities:
Coding
Reading
Workout
Walking
Travel
Gaming
Coffee

Memory examples:
"Cà phê buổi sáng"
"Học Laravel"
"Đi dạo"
"Hoàng hôn hôm nay"
"Cuối tuần với bạn bè"
"Đọc sách"

Streak:
Learn Laravel
Read Books
Workout

Relationships:
friends
pending requests
duo streak
shared memory

Chat:
realistic Vietnamese messages

Notifications:
realistic

Reminders:
realistic

Photos:
nếu không có ảnh thật, dùng safe local placeholder assets phù hợp visual system.

Không dùng Lorem ipsum.

Seed data phải giúp tất cả các state UI có thể được kiểm tra:

- empty
- one item
- many items
- unread
- long content
- broken streak
- active streak
- friend request
- shared memory
- notification
```

---

# 26. PROMPT — PHASE 24: FINAL DESIGN CONSISTENCY AUDIT

```text
Đây là bước visual QA bắt buộc.

Không thêm feature mới.

Audit toàn bộ application để tìm design drift.

Kiểm tra từng page:

Onboarding
Today
Calendar
Day Detail
Memory Detail
Streak
Together
Shared Memory
Chat
Notifications
Profile
Settings
Search
Recap

Với mỗi page kiểm tra:

1. color tokens
2. typography
3. spacing
4. border radius
5. shadows
6. icon family
7. button behavior
8. input behavior
9. card behavior
10. empty state
11. loading state
12. error state
13. responsive behavior
14. motion
15. photo treatment
16. navigation
17. privacy indicators

ĐẶC BIỆT:

PhotoStack phải đồng nhất.

Primary green phải đồng nhất.

Bottom navigation phải đồng nhất.

CTA "+" phải đồng nhất.

Card radius phải đồng nhất.

Illustration style phải đồng nhất.

Animation phải đồng nhất.

Không sửa từng page một cách độc lập nếu có root cause ở shared component/token.

Ưu tiên sửa ở:
- design token
- shared component
- layout
trước khi sửa page-specific CSS.
```

---

# 27. PROMPT — PHASE 25: PRODUCT POLISH

```text
Perform final UX polish.

Tập trung vào:

- loading feel
- empty states
- success states
- error states
- offline state nếu có
- optimistic UI nơi an toàn
- skeleton
- toast
- confirmation
- undo where appropriate
- accessibility
- reduced motion

Microcopy phải:

Vietnamese-first
ngắn
tự nhiên
thân thiện
không childish
không corporate

Examples:

"Đã lưu khoảnh khắc 🌱"

"Một khoảnh khắc nhỏ trước khi ngày kết thúc?"

"Chuỗi của bạn vẫn đang chờ."

"Ngày này vẫn còn trống."

"Hãy lưu lại một điều nhỏ."

Không sử dụng các câu gây áp lực quá mức.
```

---

# 28. PROMPT — PHASE 26: PERFORMANCE + PRODUCTION READINESS

```text
Chuẩn bị production.

Audit:

Backend:
- N+1
- missing indexes
- heavy queries
- queue usage
- cache
- eager loading
- pagination

Frontend:
- unnecessary rerender
- bundle size
- image loading
- route chunking
- expensive calculations
- search debounce
- list rendering

Database:
indexes cho:
user_id
memory_date
visibility
friendship status
streak/date
notifications/read_at
messages/conversation_id
reminders/user_id

Queues:
image processing
notifications
recaps
heavy jobs

Scheduler:
reminders
recaps

Logging:
meaningful
no sensitive data

Error handling:
user-friendly
developer-useful logs

Environment:
document all required env vars.

Create:
.env.example

Do not commit:
secrets
private uploads
real credentials
```

---

# 29. PROMPT — PHASE 27: PWA / MOBILE WEB POLISH

```text
Nếu product roadmap yêu cầu PWA:

Implement:
- manifest
- icons
- theme colors
- installable experience
- service worker strategy phù hợp
- offline fallback nếu đáng giá
- safe-area support

Mobile UX:
- bottom navigation
- touch gestures khi phù hợp
- pull interaction chỉ nếu thật sự hữu ích
- upload từ mobile
- camera/file picker
- keyboard handling

Không tạo PWA behavior làm ảnh hưởng desktop.

Photo capture:
ưu tiên native mobile input/camera capability khi trình duyệt hỗ trợ.
```

---

# 30. PROMPT — PHASE 28: DEPLOYMENT / README / HANDOFF

```text
Hoàn thiện handoff.

Tạo/hoàn thiện README.

README phải có:

1. Project overview
2. Requirements
3. Installation
4. Environment setup
5. Database setup
6. Storage setup
7. Queue setup
8. Scheduler setup
9. Realtime setup nếu có
10. Build
11. Test
12. Production deployment
13. Common troubleshooting
14. Architecture overview
15. Design system overview

Tạo docs:

docs/DESIGN_SYSTEM.md
docs/PRODUCT_SPEC.md
docs/ARCHITECTURE.md

README phải nói rõ:
- Laravel version thực tế
- PHP version thực tế
- Node version yêu cầu
- React version thực tế
- package manager
- database

Không ghi version đoán.
Dùng version thực tế của project.

Final check:
- test passes
- typecheck passes
- build passes
- migrations fresh pass
- seeders pass
- no console error
- no obvious privacy issue
- no visual regression
```

---

# 31. PROMPT — FEATURE ADDITION TEMPLATE

Dùng prompt này mỗi khi muốn thêm chức năng mới sau khi core hoàn thành.

```text
Thêm feature: [TÊN FEATURE]

Trước khi code:

1. Đọc:
   - .claude/skills/daytle-ui/SKILL.md
   - docs/DESIGN_SYSTEM.md
   - docs/PRODUCT_SPEC.md
   - docs/ARCHITECTURE.md

2. Inspect:
   - routes
   - existing pages
   - existing shared components
   - models
   - policies
   - migrations
   - hooks
   - motion utilities

3. Xác định:
   - feature thuộc domain nào
   - entity nào liên quan
   - permissions
   - mobile flow
   - desktop adaptation
   - loading/error/empty states

4. Không tạo component mới nếu component hiện có có thể mở rộng.

5. Không tạo màu mới nếu semantic token hiện có phù hợp.

6. Không tạo radius/shadow mới nếu system hiện có phù hợp.

7. Không tạo animation mới nếu motion preset hiện có phù hợp.

8. Nếu feature cần thay đổi design system:
   - cập nhật docs/DESIGN_SYSTEM.md
   - giải thích lý do
   - cập nhật shared token/component
   - kiểm tra regression

Sau đó mới implement:

Backend
→ Migration
→ Model
→ Relationship
→ Request
→ Policy
→ Action/Service nếu cần
→ Controller
→ Test

Frontend
→ Type
→ Hook/data flow
→ Components
→ Page
→ Loading
→ Empty
→ Error
→ Motion
→ Responsive

Cuối cùng:
- run tests
- typecheck
- build
- visual consistency audit

Acceptance:
Feature mới phải trông như thể đã thuộc Daytle ngay từ đầu.
```

---

# 32. PROMPT — DESIGN CHANGE TEMPLATE

Dùng khi muốn đổi giao diện.

```text
Tôi muốn thay đổi design của: [KHU VỰC]

Thay đổi:
[DESIGN CHANGE]

Không được tự ý thay đổi:
- Daytle identity
- primary green
- typography system
- icon family
- radius system
- motion philosophy
- photo treatment

Trước khi sửa:
1. tìm shared component/token đang tạo UI hiện tại
2. xác định thay đổi global hay local
3. ưu tiên thay ở shared layer
4. kiểm tra các page khác đang dùng component đó

Sau khi sửa:
1. kiểm tra Today
2. Calendar
3. Day Detail
4. Streak
5. Together
6. Chat
7. Profile
8. mobile
9. desktop
10. reduced motion

Nếu thay đổi gây regression:
rollback cách sửa page-level và tìm root cause ở design system.
```

---

# 33. PROMPT — “DO NOT DRIFT” GUARDRAIL

Đặt prompt này trong hệ thống agent hoặc dùng đầu mỗi session.

```text
DAYTLE DESIGN DRIFT GUARDRAIL

Bạn không được sáng tạo lại UI của Daytle trong mỗi session.

Trước mọi UI change:
- đọc design system
- đọc skill
- tìm component hiện tại
- reuse trước, create sau

Không đổi:
- primary green
- typography
- radius
- shadows
- icon language
- illustration language
- photo treatment
- motion language

trừ khi user yêu cầu rõ ràng.

Nếu user yêu cầu một feature có UI chưa được mô tả:
hãy suy luận từ existing design system.

Không tạo feature theo style của một app khác nếu điều đó làm Daytle mất identity.

Nếu có 2 lựa chọn:
chọn lựa chọn gần design system hiện tại hơn.

Nếu một component có thể dùng lại:
bắt buộc ưu tiên reuse.

Nếu phát hiện design inconsistency:
sửa shared component/token trước.

Không thêm:
- random gradients
- random colors
- random border radius
- random animations
- unrelated illustrations
- excessive glassmorphism
- excessive shadows

Rule cuối:

"Feature mới phải trông như thể nó đã tồn tại trong Daytle từ ngày đầu tiên."
```

---

# 34. DESIGN QA CHECKLIST — CHẤM TRƯỚC KHI COI LÀ HOÀN THÀNH

```text
[ ] Mobile 375px ổn
[ ] Mobile 390px ổn
[ ] Mobile 414px ổn
[ ] Tablet ổn
[ ] Desktop ổn

[ ] Primary green đúng system
[ ] Background đúng system
[ ] Typography đúng system
[ ] Radius đúng system
[ ] Shadow đúng system
[ ] Icons đồng nhất
[ ] Buttons đồng nhất
[ ] Cards đồng nhất
[ ] Inputs đồng nhất

[ ] PhotoStack đúng
[ ] Photo grid đúng
[ ] Image lazy loading
[ ] Image aspect ratio ổn

[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Success state

[ ] Page transition
[ ] Modal animation
[ ] Sheet animation
[ ] Button interaction
[ ] Reaction animation
[ ] Reduced motion

[ ] No console errors
[ ] No TypeScript errors
[ ] Tests pass
[ ] Build pass

[ ] Private content không leak
[ ] Friend-only content đúng
[ ] Chat authorization đúng
[ ] Upload validation đúng
```

---

# 35. RECOMMENDED EXECUTION ORDER

## Phase A — Foundation

1. Master Agent Prompt
2. Phase 0 — Project Foundation
3. Phase 1 — Design System
4. Phase 2 — Auth + Onboarding

## Phase B — Core Product

5. Phase 3 — Memory
6. Phase 4 — Today
7. Phase 5 — Calendar + Day Detail
8. Phase 6 — Activity + Streak
9. Phase 7 — Mood + Tag + Favorite + Search

## Phase C — Social

10. Phase 8 — Together + Friends
11. Phase 9 — Shared Memory
12. Phase 10 — Duo Streak
13. Phase 11 — Reactions + Comments + Notifications
14. Phase 12 — Chat

## Phase D — Retention

15. Phase 13 — Reminders
16. Phase 14 — Daily Quest + Achievements
17. Phase 15 — Weekly/Monthly Recap
18. Phase 16 — On This Day

## Phase E — Account / Polish

19. Phase 17 — Profile + Privacy
20. Phase 18 — Photo performance
21. Phase 19 — Motion polish
22. Phase 20 — Accessibility
23. Phase 21 — Security
24. Phase 22 — Testing
25. Phase 23 — Seeders
26. Phase 24 — Design QA
27. Phase 25 — UX Polish
28. Phase 26 — Performance
29. Phase 27 — PWA
30. Phase 28 — Deployment

---

# 36. RULE FOR AI CODING AGENT DURING LONG PROJECTS

Nếu agent đã thực hiện nhiều phase và context dài:

```text
STOP AND RE-SYNC.

1. Đọc lại:
   .claude/skills/daytle-ui/SKILL.md
   docs/DESIGN_SYSTEM.md
   docs/PRODUCT_SPEC.md
   docs/ARCHITECTURE.md

2. Inspect current implementation.
3. Không giả định architecture hiện tại giống architecture ban đầu.
4. Không overwrite working code bằng prototype mới.
5. Reuse existing abstractions.
6. Check tests trước.
7. Check git diff trước khi chỉnh sửa lớn.

Nếu phát hiện code hiện tại đã khác design spec:
- không tự động rewrite toàn bộ project
- xác định root cause
- sửa incrementally
- giữ backward compatibility nếu có thể
```

---

# 37. FINAL PRODUCT DEFINITION

Daytle hoàn chỉnh phải có thể được mô tả bằng:

> Một không gian cá nhân nhẹ nhàng nơi người dùng lưu lại những khoảnh khắc mỗi ngày, nhìn lại hành trình qua lịch và timeline, duy trì những thói quen mình quan tâm, và cùng bạn bè tạo ra những chuỗi hoặc kỷ niệm chung.

Core experience:

```text
Today
  ↓
Memory
  ↓
Calendar
  ↓
Streak
  ↓
Together
  ↓
Shared Memory
  ↓
Chat
  ↓
Reminder
  ↓
Recap
```

Visual identity:

```text
Green-first
Cream/white
Soft
Rounded
Clean
Photo-first
Cute but unisex
Natural illustrations
Subtle motion
Mobile-first
```

Signature UI:

```text
3-photo PhotoStack
+
Green CTA
+
Rounded memory cards
+
Soft timeline
+
Gentle Motion
```

Signature emotional feeling:

```text
Calm
Warm
Friendly
Motivating
Comfortable
```

The user should open Daytle and feel:

> "Mình muốn lưu lại một chút gì đó của hôm nay."

---

# 38. OFFICIAL TECH REFERENCES

Khi triển khai thực tế, hãy kiểm tra version/package theo tài liệu chính thức tại thời điểm cài đặt:

- Laravel Starter Kits / React Starter Kit:
  https://laravel.com/starter-kits
- Laravel documentation:
  https://laravel.com/docs
- React:
  https://react.dev
- Tailwind CSS:
  https://tailwindcss.com/docs
- Motion for React:
  https://motion.dev/docs/react
- Inertia:
  https://inertiajs.com
- shadcn/ui:
  https://ui.shadcn.com
- Lucide:
  https://lucide.dev

Không hard-code version trong prompt nếu project đã có version cụ thể.
Khi khởi tạo project mới, kiểm tra version stable/tương thích thực tế rồi mới cài.
