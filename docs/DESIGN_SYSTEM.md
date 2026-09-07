# Kimo Life — Design System

## Định hướng

Kimo Life là một không gian lưu giữ những khoảnh khắc đời thường: thân thiện, bình tĩnh, ấm áp, hiện đại và tự nhiên. Giao diện mobile-first, xanh lá làm màu chủ đạo, nền kem nhẹ, card bo tròn và chuyển động tiết chế.

## Ngôn ngữ web

Web UI ưu tiên tiếng Việt. Navigation, form, trạng thái rỗng/loading/error/success và nội dung hướng dẫn dùng tiếng Việt tự nhiên. Chỉ dùng tiếng Anh cho tên thương hiệu/sản phẩm như Kimo Life, PhotoStack, technical identifier hoặc khi có yêu cầu rõ ràng.

## Token nền tảng

- Primary: `#74C69D`
- Primary dark: `#3F8F6B`
- Soft green: `#A7D7A7`
- Pale green: `#E8F5E9`
- Background: `#F8FAF7`
- Text: `#24312A`
- Muted text: `#6B7280`
- Border: `#DDE7E0`
- Accent warm: `#FFD59A`

Trong UI code, ưu tiên semantic token (`brand-primary`, `brand-surface`, `brand-text`, `brand-border`) thay vì lặp raw hex.

## Typography và hình học

- Font chính: Inter, fallback system sans-serif.
- Heading đậm vừa, line-height thoáng, body dễ đọc.
- Radius chuẩn: `12px`; card lớn có thể dùng `16px`.
- Shadow mềm, thấp; không dùng shadow nặng kiểu admin dashboard.
- Spacing theo nhịp 4/8px; touch target tối thiểu khoảng 44px.

## Component language

Các primitive dùng chung gồm Button, Card, Input, Textarea, Badge, Tag, Avatar, AvatarGroup, IconButton, Tabs, Dropdown, Modal, BottomSheet, Toast, Progress, EmptyState, Divider và Skeleton.

PhotoStack là signature component: đúng 3 ảnh, ảnh giữa nổi bật nhất, hai ảnh sau xoay nhẹ, có `alt`, `loading` phù hợp và tôn trọng reduced motion.

## Responsive và accessibility

- Thiết kế mobile trước; desktop dùng max-width rõ ràng và khoảng thở rộng hơn.
- Bottom navigation cố định ở mobile, có safe-area padding và không gây horizontal overflow.
- Icon chỉ dùng Lucide hoặc icon component nhất quán; icon-only button phải có accessible label.
- Luôn có visible focus, keyboard navigation, contrast đủ, empty/error state và reduced-motion fallback.

## Visual QA

Trước khi hoàn thành màn hình, kiểm tra palette xanh/kem, typography, radius, shadow, spacing, icon, responsive mobile/desktop, không overflow, copy tiếng Việt và tính nhất quán với PhotoStack.
