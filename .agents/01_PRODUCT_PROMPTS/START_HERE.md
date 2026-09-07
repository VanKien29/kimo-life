# KIMO LIFE — START IMPLEMENTATION PROMPT

Bạn là AI coding agent chịu trách nhiệm bắt đầu và phát triển dự án **Kimo Life**.

## 1. MỤC TIÊU CỦA SESSION NÀY

Bắt đầu triển khai project một cách có kiểm soát.

Đầu tiên phải:
1. Đọc toàn bộ file đặc tả implementation đã có.
2. Đọc toàn bộ Kimo Life UI/UX Skill.
3. Inspect project hiện tại.
4. Xác định trạng thái project: chưa tạo / foundation một phần / đã có code.
5. Không tự ý xóa hoặc rewrite code đang hoạt động.
6. Sau đó thực hiện **Phase 0 — Foundation**.
7. Chỉ sau khi Phase 0 hoàn thành, test và build pass mới dừng lại để chờ phase tiếp theo; nếu người dùng yêu cầu “thực hiện tiếp”, triển khai đúng phase kế tiếp và vẫn dừng sau một phase.

KHÔNG tự động triển khai toàn bộ các phase trong một lần.

---

# 2. SOURCE OF TRUTH

Trong folder hiện tại có thể có:

- `DAYTLE_MASTER_IMPLEMENTATION_PROMPTS(1).md`
- `SKILL.md`

Hai file này là tài liệu cũ/mới được cung cấp làm nền tảng.

### IMPORTANT BRAND OVERRIDE

Tên sản phẩm hiện tại và được chốt là:

**Kimo Life**

Không dùng Daytle làm tên sản phẩm mới.

Nếu master prompt hoặc file cũ còn chữ "Daytle":
- xem đó là tên cũ/legacy
- giữ nghiệp vụ và cấu trúc được mô tả
- chuyển branding sang **Kimo Life**
- không tự ý thay đổi product concept đã chốt.

UI/UX Skill Kimo Life là nguồn sự thật cho visual identity. Các rules về màu xanh lá, mobile-first, PhotoStack, motion, logo và chống design drift phải được tuân thủ xuyên suốt.

---

# 3. ĐỌC TÀI LIỆU TRƯỚC KHI CODE

Đọc hết:

1. `DAYTLE_MASTER_IMPLEMENTATION_PROMPTS(1).md`
2. `SKILL.md`
3. nếu project đã có:
   - `docs/DESIGN_SYSTEM.md`
   - `docs/PRODUCT_SPEC.md`
   - `docs/ARCHITECTURE.md`
   - `AGENTS.md`
   - `CLAUDE.md`
   - `.cursor/rules/*`
   - `.claude/*`

Nếu có nhiều tài liệu có vẻ mâu thuẫn:
- không tự giải quyết bằng cách invent design mới
- xác định nguồn mới hơn / rõ hơn
- ưu tiên Kimo Life branding hiện tại
- giữ nguyên product behavior đã chốt
- ghi lại conflict trước khi có thay đổi lớn.

---

# 4. PRODUCT IDENTITY

Brand:

**Kimo Life**

Tagline:

**Small moments. A better you.**

Tinh thần:

- friendly
- calm
- modern
- warm
- cute but unisex
- natural
- clean
- soft
- comfortable

Không được trở thành:
- pink/kawaii girls-only diary
- corporate productivity dashboard
- dense admin dashboard
- Facebook clone
- overly gamified app

## 4.1. WEB LANGUAGE OVERRIDE

Web UI của Kimo Life ưu tiên tiếng Việt.

- Mặc định dùng tiếng Việt tự nhiên cho navigation, label, form, empty/loading/error/success state và nội dung hướng dẫn.
- Chỉ giữ tiếng Anh cho brand/product name đã được chốt (ví dụ Kimo Life, PhotoStack), technical identifier hoặc khi user yêu cầu English.
- Nếu prompt cũ có ví dụ UI bằng tiếng Anh, phải Việt hóa phần hiển thị nhưng giữ nguyên behavior và ý nghĩa sản phẩm.

Core idea:

> Một không gian cá nhân nhẹ nhàng nơi người dùng lưu lại những khoảnh khắc mỗi ngày, nhìn lại lịch sử cuộc sống, theo dõi habit/streak và kết nối với bạn bè.

---

# 5. VISUAL SOURCE OF TRUTH

Phải giữ:

- green-first
- cream/white surface
- real-photo-first
- rounded cards
- subtle shadow
- natural illustrations
- friendly neutral line icons
- mobile-first
- calm whitespace
- subtle motion
- 3-photo PhotoStack

Primary colors:

#74C69D
#3F8F6B
#A7D7A7
#E8F5E9
#F8FAF7
#FFFFFF
#DDE7E0
#24312A
#6B7280
#94A3B8
#FFD59A
#FF8A65
#8EC5FF
#FCA5A5

Font:
Inter

Icon:
lucide-react

Animation:
Motion for React

---

# 6. TARGET STACK

Backend:
- Laravel
- PHP 8.3+
- MySQL hoặc PostgreSQL

Frontend:
- React
- TypeScript
- Inertia

UI:
- Tailwind CSS
- shadcn/ui khi phù hợp
- lucide-react

Motion:
- Motion for React

Utilities:
- Carbon
- date-fns

Storage:
- Laravel Filesystem

Images:
- Intervention Image hoặc giải pháp phù hợp

Queue:
- Laravel Queue

Scheduler:
- Laravel Scheduler

Realtime khi cần:
- Laravel Reverb / Broadcasting

Do not upgrade packages chỉ vì thích version mới.
Ưu tiên version tương thích với project hiện tại.
Nếu tạo project mới, xác định stable versions thực tế trước khi cài.

---

# 7. FIRST ACTION — PROJECT AUDIT

Trước tiên hãy inspect:

- current working directory
- `composer.json`
- `package.json`
- `vite.config.*`
- `tsconfig.json`
- `tailwind.config.*` hoặc Tailwind v4 config
- `resources/js`
- `routes`
- `app`
- `database`
- auth setup
- `.env.example`
- test setup
- git status nếu có git

Xác định:

- Laravel version
- PHP version
- Node version
- package manager
- React version
- Inertia version
- Tailwind version
- database driver

KHÔNG giả định version từ prompt.

---

# 8. PHASE 0 — FOUNDATION

Nếu project chưa tồn tại:

- tạo Laravel project phù hợp
- dùng official React/Inertia starter kit nếu phù hợp
- xác nhận compatibility trước khi cài

Nếu project đã tồn tại:

- không recreate
- chỉ bổ sung phần còn thiếu.

Thiết lập foundation:

### Backend

- authentication foundation
- database connection
- migrations foundation
- policies foundation
- Form Request foundation
- testing foundation
- queue foundation
- scheduler foundation
- filesystem foundation

### Frontend

Tạo structure:

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
  Actions/ hoặc Services/ khi cần

---

# 9. APP SHELL

Tạo AppLayout mobile-first.

Bottom navigation:

Today
Calendar
+
Together
Me

Quy tắc:

- center "+" nổi bật
- fixed bottom trên mobile
- safe-area support
- accessible
- keyboard/focus support
- desktop chuyển thành sidebar/centered shell phù hợp
- không stretch mobile layout thành dashboard khổng lồ.

---

# 10. DESIGN FOUNDATION

Tạo semantic design tokens.

Không rải hex color trong component.

Tạo base components:

- Button
- Card
- Input
- Textarea
- Badge
- Tag
- Avatar
- AvatarGroup
- IconButton
- Modal
- BottomSheet
- Toast
- Tabs
- Dropdown
- Tooltip
- Skeleton
- EmptyState
- Progress
- Divider

Tạo:

- theme variables
- typography
- spacing convention
- radius
- shadow
- z-index
- motion tokens

---

# 11. PHOTO FOUNDATION

Tạo reusable:

- SinglePhoto
- PhotoGrid
- PhotoStack
- PhotoCarousel

`PhotoStack` là visual signature.

Khi có 3 ảnh:

- center lớn nhất
- left rotate khoảng -6deg
- right rotate khoảng +6deg
- side images thấp z-index
- center cao nhất
- mobile tap có gentle spring
- desktop hover có thể mở nhẹ hai bên
- không che text
- không copy ad-hoc CSS ở từng page.

---

# 12. LOGO FOUNDATION

Brand:

**Kimo Life**

Logo concept:

- stylized K
- leaf integrated with K
- rounded organic geometry
- modern
- clean
- unisex

Variants:

- full
- mark
- wordmark
- monochrome

Tạo reusable:

`<Logo variant="full" />`
`<Logo variant="mark" />`
`<Logo variant="wordmark" />`
`<Logo variant="monochrome" />`

Nếu asset logo final chưa có:
- tạo placeholder có cấu trúc rõ ràng
- không vẽ một logo khác nhau ở từng page
- không thay thế logo bằng text ở mỗi nơi.

---

# 13. MOTION FOUNDATION

Dùng Motion for React.

Default:

Fast:
120–180ms

Normal:
200–280ms

Emphasized:
300–450ms

Preferred:
- fade
- y 6–10px
- scale nhỏ
- gentle spring

Không:
- aggressive bounce
- long transition
- animate everything
- excessive pulse
- layout shift.

Luôn support:
`prefers-reduced-motion`

---

# 14. CONFIGURATION FOUNDATION

Tạo một nơi duy nhất để giữ default configuration.

Không hard-code logic cấu hình ở nhiều module.

Cấu hình nên gồm tối thiểu:

- app name
- app tagline
- locale
- timezone strategy
- date/time formatting
- pagination defaults
- upload limits
- image sizes
- reminder defaults
- rate limit defaults
- feature flags nếu cần
- storage disk
- queue connection
- cache connection
- mail defaults

Environment-specific values phải nằm trong `.env`.

Không commit secret.

---

# 15. CODE QUALITY RULES

Không:

- fake frontend-only prototype
- hard-coded production data
- giant React component
- giant controller
- duplicated UI
- duplicated business logic
- arbitrary magic numbers
- broad CSS overrides
- hidden authorization only in frontend
- silently break existing feature

Ưu tiên:

- typed props
- typed backend data where practical
- reusable components
- Form Requests
- Policies
- Eloquent relationships
- Actions/Services only when useful
- tests for business rules
- semantic naming
- small functions
- explicit validation.

---

# 16. DATE/TIME RULE

Memory, streak, reminder đều có liên quan đến ngày.

Không dùng client time một cách mù quáng.

Thiết kế timezone-aware.

Backend:
- Carbon
- database timestamps in a consistent strategy
- user timezone where needed

Frontend:
- date-fns

Streak/reminder logic phải xác định rõ "today" theo timezone của user.

Không được để streak thay đổi chỉ vì server timezone khác user timezone.

---

# 17. PRIVACY-FIRST

Default:

Memory:
private

Profile:
private/restricted

Friends-only data:
chỉ accepted friend được xem.

Server phải kiểm tra:
- owner
- friendship
- visibility
- membership

Không tin ID gửi từ frontend.

---

# 18. CURRENT SESSION LIMIT

Mỗi session chỉ hoàn thành một phase.

Phase 0 — Foundation và Phase 1 — Design System + Visual Foundation đã hoàn thành.

Khi user yêu cầu “tiếp tục”, triển khai phase chưa hoàn thành kế tiếp trong master prompt. Hiện tại phase kế tiếp là **Phase 2 — Auth + Onboarding**.

Sau đó:

1. run tests
2. run typecheck nếu có
3. run build
4. inspect output
5. fix obvious errors
6. report exact versions
7. report files changed
8. report assumptions
9. STOP.

Không tự nhảy qua phase đang triển khai sang Memory, Calendar, Streak, Social hoặc Chat.

---

# 19. ACCEPTANCE CRITERIA

Phase 0 chỉ được coi là hoàn thành khi:

[ ] Project runs
[ ] Auth foundation works
[ ] React renders
[ ] Inertia works
[ ] Tailwind works
[ ] design tokens work
[ ] app shell works
[ ] bottom navigation works
[ ] Logo component exists
[ ] PhotoStack foundation exists
[ ] Motion foundation exists
[ ] base UI components exist
[ ] responsive base works
[ ] tests pass
[ ] production build passes
[ ] no obvious console errors
[ ] no major TypeScript errors
[ ] no accidental design drift

Khi báo cáo:
- nêu chính xác những gì đã làm
- nêu các file đã thay đổi
- nêu command test/build đã chạy
- nêu lỗi còn lại nếu có
- KHÔNG nói "done" nếu còn lỗi.

Bắt đầu bằng project audit.
Sau đó triển khai Phase 0.
