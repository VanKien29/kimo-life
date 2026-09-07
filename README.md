# KIMO LIFE — CONSOLIDATED AI PROJECT KIT

Đây là folder tổng hợp toàn bộ prompt, skill và cấu hình đã xây dựng cho Kimo Life.

## Cấu trúc

```text
KIMO_LIFE_PROJECT_AI_KIT/
│
├── 01_PRODUCT_PROMPTS/
│   ├── START_HERE.md
│   └── MASTER_IMPLEMENTATION_PROMPTS_LEGACY_DAYTLE.md
│
├── 02_SKILLS/
│   ├── KIMO_LIFE_UI_UX_SKILL.md
│   ├── KIMO_LIFE_PROJECT_SKILL.md
│   └── KIMO_LIFE_AI_WORKFLOW.md
│
├── 03_PROJECT_DEFAULTS/
│   └── KIMO_LIFE_PROJECT_DEFAULTS.md
│
└── 04_REFERENCES/
    └── KIMO_LIFE_UI_SKILL_ORIGINAL.zip
```

## Thứ tự sử dụng

### 1. UI/UX Skill

`02_SKILLS/KIMO_LIFE_UI_UX_SKILL.md`

Nguồn sự thật cho:
- brand Kimo Life
- logo
- green-first visual system
- typography
- icons
- illustrations
- PhotoStack 3 ảnh
- layout
- motion
- responsive
- anti-design-drift

### 2. Project Skill

`02_SKILLS/KIMO_LIFE_PROJECT_SKILL.md`

Nguồn sự thật cho:
- Laravel conventions
- React/TypeScript conventions
- Inertia
- database
- privacy
- uploads
- notifications
- reminders
- realtime
- testing
- security
- performance
- Git safety
- AI session protocol

### 3. Workflow Skill

`02_SKILLS/KIMO_LIFE_AI_WORKFLOW.md`

Quy định cách AI thực hiện từng task:
read → inspect → plan → implement → verify → report.

### 4. Project Defaults

`03_PROJECT_DEFAULTS/KIMO_LIFE_PROJECT_DEFAULTS.md`

Các default nên được tập trung trong config:
- app identity
- locale
- timezone
- pagination
- image limits
- motion
- notifications
- reminders
- storage
- queue
- feature flags
- privacy
- web language (Vietnamese-first)

### 5. Start Prompt

`01_PRODUCT_PROMPTS/START_HERE.md`

Đây là prompt nên đưa cho coding agent khi bắt đầu project.

Nó yêu cầu:
- đọc source of truth
- hiểu Daytle là tên cũ và Kimo Life là brand hiện tại
- inspect project
- thực hiện Phase 0
- test/build
- dừng lại sau foundation

### 6. Legacy Master Prompt

`01_PRODUCT_PROMPTS/MASTER_IMPLEMENTATION_PROMPTS_LEGACY_DAYTLE.md`

Đây là bộ roadmap/implementation prompt đầy đủ từ foundation đến production.

File này ban đầu được viết với tên Daytle. Khi dùng cho project hiện tại:
- giữ nguyên nghiệp vụ, phase và kiến trúc được mô tả
- dùng Kimo Life làm brand hiện tại
- xem START_HERE.md + Kimo Life UI Skill là lớp override về brand/visual identity.

## Recommended installation into the actual project

```text
your-kimo-life-project/
│
├── .claude/
│   └── skills/
│       ├── kimo-life-ui/
│       │   └── SKILL.md
│       └── kimo-life-project/
│           ├── SKILL.md
│           └── WORKFLOW.md
│
├── docs/
│   └── KIMO_LIFE_PROJECT_DEFAULTS.md
│
└── ...
```

Sau đó dùng:

`01_PRODUCT_PROMPTS/START_HERE.md`

để khởi động coding agent.

## Important

Không đưa toàn bộ roadmap cho AI và yêu cầu code tất cả trong một lần.

Hãy chạy theo phase.

Mỗi phase:
1. inspect
2. implement
3. test
4. typecheck
5. build
6. visual QA
7. report
8. stop

Mục tiêu là giữ Kimo Life nhất quán qua toàn bộ vòng đời project.

## Phase 0 foundation

Thư mục này hiện cũng chứa Laravel application foundation của Kimo Life, được scaffold từ official Laravel React Starter Kit. Branding active là Kimo Life; các tài liệu Daytle chỉ là legacy product reference.

Foundation hiện có:

- Laravel 12 + PHP 8.3+
- React + TypeScript + Inertia + Tailwind CSS v4
- authentication starter (login, register, password reset, email verification)
- mobile-first AppLayout với Today / Calendar / Add / Together / Me
- semantic Kimo Life tokens, reusable UI primitives, Logo, PhotoStack và motion presets
- route `/foundation` cho showcase nội bộ của Phase 1
- MySQL local runtime database, Laravel queue/cache/filesystem defaults và SQLite in-memory test foundation
- Vietnamese-first web copy với English fallback cho nội bộ/brand khi cần

Các lệnh chính:

```text
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run dev
```

`npm run dev` đã gộp Laravel server và Vite trong cùng một lệnh. Mở web tại `http://127.0.0.1:8000`.

Kiểm tra trước khi chuyển phase:

```text
php artisan test
npx tsc --noEmit
npx eslint resources/js --max-warnings=0
npm run build
```

Phase 0 và Phase 1 đã hoàn thành; Phase 2 đang triển khai auth + onboarding. Memory, Calendar, Streak, Together và Chat vẫn là placeholder cho các phase sản phẩm sau.
