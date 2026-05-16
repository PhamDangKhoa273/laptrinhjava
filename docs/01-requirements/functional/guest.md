---
title: Guest Functional Requirements
ids: [R-GST-010, R-GST-020, R-GST-030]
status: active
last-reviewed: 2026-05-16
language: vi
brief-revision: 2026-05-16
---

# Guest Functional Requirements

Yêu cầu chức năng cho vai trò **Guest** (Khách), workspace web/mobile. 3 R-GST-* sinh từ [`_brief-source.md`](./_brief-source.md). Stride-10.

---

## R-GST-010 — Nhận thông báo chung về nền tảng

- **source quote:** "Khách có thể nhận các thông báo chung về nền tảng, chẳng hạn như cập nhật sản phẩm mới, bài viết giáo dục hoặc các sự kiện liên quan đến nông nghiệp bền vững."
- **status:** active

### Acceptance Criteria

1. WHEN role `guest` (đã đăng ký) đọc public announcements, THE system SHALL trả danh sách announcements với content sanitized + safe-for-public fields only.
2. WHEN admin tạo announcement mới, THE system SHALL deliver notification tới subscribed guests.

---

## R-GST-020 — Tìm kiếm và lọc sản phẩm theo tiêu chí

- **source quote:** "Khách có thể sử dụng chức năng tìm kiếm và bộ lọc để dễ dàng tìm sản phẩm theo các tiêu chí như nguồn gốc, loại sản phẩm, chứng nhận và tình trạng sẵn có."
- **status:** active

### Acceptance Criteria

1. WHEN role `guest` query marketplace với filter dimensions: **origin** (location/region), **product type** (category), **certification** (organic/VietGAP/v.v.), **availability** (in-stock/upcoming), THE system SHALL trả danh sách listings phù hợp.
2. THE filter dimensions SHALL được derive từ backend listing data (BR-LST-*); frontend KHÔNG được hardcode static filter values.
3. THE system SHALL chỉ trả listings `ACTIVE` cho guest; private/draft/archived listings KHÔNG hiển thị.
4. THE response SHALL không bao gồm private operational data của farm/retailer.

---

## R-GST-030 — Truy cập nội dung giáo dục

- **source quote:** "Khách có thể truy cập các bài viết, video và nội dung giáo dục khác liên quan đến nông nghiệp, thực hành canh tác bền vững và an toàn thực phẩm."
- **status:** active

### Acceptance Criteria

1. WHEN role `guest` (hoặc public unauthenticated) đọc educational content, THE system SHALL trả articles/videos/media với content sanitized.
2. THE system SHALL deny modify operations cho guest role.
