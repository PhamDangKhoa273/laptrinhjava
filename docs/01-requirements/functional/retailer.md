---
title: Retailer Functional Requirements
ids: [R-RTL-010, R-RTL-020, R-RTL-030, R-RTL-040, R-RTL-050, R-RTL-060, R-RTL-070, R-RTL-080, R-RTL-090, R-RTL-100, R-RTL-110, R-RTL-120, R-RTL-130, R-RTL-140, R-RTL-150, R-RTL-160, R-RTL-170, R-RTL-180, R-RTL-190]
status: active
last-reviewed: 2026-05-16
language: vi
brief-revision: 2026-05-16
---

# Retailer Functional Requirements

Yêu cầu chức năng cho vai trò **Retailer** (Nhà bán lẻ), workspace web. 19 R-RTL-* sinh từ [`_brief-source.md`](./_brief-source.md). Stride-10.

---

## R-RTL-010 — Đăng ký và đăng nhập

- **source quote:** "Đăng ký và đăng nhập tài khoản."
- **status:** active
- **related-api:** [API-AUT-001, API-AUT-002]

### Acceptance Criteria

1. WHEN user mới gọi `POST /api/v1/auth/register` với role `RETAILER`, THE system SHALL persist user role `RETAILER`.
2. WHEN credentials đúng, THE system SHALL trả tokens + user info.
3. IF credentials sai, THE system SHALL trả `401 UNAUTHORIZED`.

---

## R-RTL-020 — Cập nhật thông tin cá nhân chủ sở hữu

- **source quote:** "Cập nhật thông tin cá nhân của chủ sở hữu."
- **status:** active

### Acceptance Criteria

1. WHEN role `retailer` update own profile, THE system SHALL persist.
2. IF target user khác, THE system SHALL trả `403`.

---

## R-RTL-030 — Cập nhật Giấy phép Kinh doanh và thông tin trang trại

- **source quote:** "Cập nhật Giấy phép Kinh doanh và thông tin trang trại."
- **status:** active
- **note:** [AMBIGUITY: Brief Retailer dùng cụm "thông tin trang trại" — likely có nghĩa là "thông tin doanh nghiệp retailer" (cửa hàng/công ty bán lẻ), không phải Farm. Resolution pending product owner clarification; nếu Retailer thực sự cần update Farm info thì cross-reference sẽ tạo `GAP-*`.]

### Acceptance Criteria

1. WHEN role `retailer` update own business license document và retailer profile, THE system SHALL persist.
2. THE system SHALL không cho phép retailer cập nhật thông tin Farm bên thứ ba (deny by default cho cross-entity write).

---

## R-RTL-040 — Tìm kiếm nông sản trên sàn

- **source quote:** "Tìm kiếm nông sản trên sàn giao dịch."
- **status:** active

### Acceptance Criteria

1. WHEN role `retailer` query marketplace với filters (origin, product type, certification, availability), THE system SHALL trả danh sách listings phù hợp.
2. THE system SHALL không trả listings có `status = PENDING_REVIEW` hay `ARCHIVED`.

---

## R-RTL-050 — Xem chi tiết nông sản

- **source quote:** "Xem chi tiết nông sản."
- **status:** active

### Acceptance Criteria

1. WHEN role `retailer` đọc detail của một listing `ACTIVE`, THE system SHALL trả full listing object + linked product/batch metadata.

---

## R-RTL-060 — Quét QR truy xuất sản phẩm

- **source quote:** "Quét mã QR để truy xuất thông tin sản phẩm về các quy trình mùa vụ."
- **status:** active

### Acceptance Criteria

1. WHEN role `retailer` scan QR và resolve trace URL, THE system SHALL trả full trace info: farm, season, processes, batch, blockchain tx hashes (public-safe fields only).
2. THE system SHALL bảo đảm round-trip: QR encode trace identity → decode → resolve cùng season/batch.
3. THE system SHALL không trả private operational data (phone, email, payment, internal admin notes).

---

## R-RTL-070 — Tạo yêu cầu đặt mua

- **source quote:** "Tạo yêu cầu đặt mua nông sản."
- **status:** active
- **related-stm:** STM-ORD-T01

### Acceptance Criteria

1. WHEN role `retailer` create order cho listing `ACTIVE`, THE system SHALL persist order với `status = PENDING` qua `STM-ORD-T01` AND SHALL tham chiếu listing + farm.

---

## R-RTL-080 — Thanh toán đặt cọc

- **source quote:** "Thanh toán tiền đặt cọc để đặt mua nông sản."
- **status:** active
- **related-stm:** STM-ORD-T02 (PENDING → DEPOSIT_PAID)
- **related-br:** BR-ORD-020 (deposit phải ≥ deposit_minimum của listing)

### Acceptance Criteria

1. WHEN role `retailer` submit deposit cho order `PENDING` với amount ≥ `deposit_minimum`, THE system SHALL transition sang `DEPOSIT_PAID` qua `STM-ORD-T02`.
2. THE system SHALL verify HMAC/signature của payment callback (idempotent).
3. IF deposit < `deposit_minimum`, THE system SHALL từ chối với code `DEPOSIT_TOO_LOW`.

---

## R-RTL-090 — Hủy yêu cầu đặt mua

- **source quote:** "Hủy yêu cầu đặt mua nông sản."
- **status:** active
- **related-stm:** STM-ORD cancel branch
- **related-br:** BR-ORD-030 (Cancel chỉ hợp lệ trong PENDING hoặc DEPOSIT_PAID)

### Acceptance Criteria

1. WHEN role `retailer` cancel order với `status ∈ {PENDING, DEPOSIT_PAID}`, THE system SHALL transition sang `CANCELLED`.
2. IF status ngoài tập trên, THE system SHALL từ chối với code `INVALID_STATE_TRANSITION`.
3. WHEN cancel xảy ra ở `DEPOSIT_PAID`, THE system SHALL trigger deposit refund flow.

---

## R-RTL-100 — Xem lịch sử đơn hàng

- **source quote:** "Xem lịch sử đơn hàng."
- **status:** active

### Acceptance Criteria

1. WHEN role `retailer` list own orders, THE system SHALL trả mọi order thuộc retailer (mọi status) với pagination.

---

## R-RTL-110 — Xem chi tiết và trạng thái đơn hàng

- **source quote:** "Xem chi tiết và trạng thái yêu cầu mua hàng."
- **status:** active

### Acceptance Criteria

1. WHEN role `retailer` đọc detail order thuộc mình, THE system SHALL trả full order + status history.
2. IF order không thuộc retailer, THE system SHALL trả `403`.

---

## R-RTL-120 — Nhận thông báo từ Farm Manager

- **source quote:** "Nhận thông báo từ Quản lý Trang trại."
- **status:** active

### Acceptance Criteria

1. WHEN farm manager send notification liên quan tới order của retailer, THE system SHALL deliver notification.

---

## R-RTL-130 — Gửi thông báo đến Farm Manager

- **source quote:** "Gửi thông báo đến Quản lý Trang trại."
- **status:** active

### Acceptance Criteria

1. WHEN role `retailer` send notification tới farm manager liên quan tới order của mình, THE system SHALL persist notification AND deliver.
2. IF retailer không có order với farm đó, THE system SHALL từ chối (deny by default cross-entity messaging).

---

## R-RTL-140 — Xem các quy trình vận chuyển

- **source quote:** "Xem và xem chi tiết các quy trình vận chuyển."
- **status:** active

### Acceptance Criteria

1. WHEN role `retailer` list shipments liên quan tới orders của mình, THE system SHALL trả shipments + status.
2. WHEN xem detail shipment liên quan tới order của retailer, THE system SHALL trả full shipment record.

---

## R-RTL-150 — Nhận thông báo từ Driver

- **source quote:** "Nhận thông báo từ Người vận chuyển."
- **status:** active

### Acceptance Criteria

1. WHEN driver gửi notification liên quan tới shipment của retailer (pickup, in-transit, delivered), THE system SHALL deliver.

---

## R-RTL-160 — Xác nhận sản phẩm đã được giao đầy đủ

- **source quote:** "Xác nhận sản phẩm đã được giao đầy đủ."
- **status:** active
- **related-stm:** STM-SHP-T06 (DELIVERED → CONFIRMED)

### Acceptance Criteria

1. WHEN role `retailer` confirm receipt cho shipment `DELIVERED`, THE system SHALL transition sang `CONFIRMED` qua `STM-SHP-T06` AND SHALL trigger order completion flow.
2. IF status không phải `DELIVERED`, THE system SHALL từ chối với code `INVALID_STATE_TRANSITION`.

---

## R-RTL-170 — Tải lên hình ảnh sản phẩm đã giao

- **source quote:** "Tải lên hình ảnh sản phẩm đã được giao đầy đủ."
- **status:** active
- **related-br:** BR-SHP-060 (CONFIRMED requires retailer photo)

### Acceptance Criteria

1. WHEN role `retailer` upload photo gắn với shipment `DELIVERED`, THE system SHALL persist media reference vào shipment proof bundle.
2. THE system SHALL validate file type (image whitelist) AND SHALL limit size theo policy.
3. WHEN cả photo upload và confirm receipt thực hiện, THE system SHALL transition shipment sang `CONFIRMED`.

---

## R-RTL-180 — Nhận thông báo từ Driver (duplicated trong Brief)

- **source quote:** "Nhận thông báo từ người vận chuyển."
- **status:** active
- **note:** [AMBIGUITY: Brief Retailer chứa cùng nội dung với R-RTL-150 — "Nhận thông báo từ Người vận chuyển" (xuất hiện 2 lần trong Brief). Preserve verbatim. Resolution pending Brief Revision sẽ chốt: giữ 2 R-* vì có thể có 2 channel riêng (in-app vs email), hoặc gộp lại thành 1.]

### Acceptance Criteria

1. WHEN driver gửi notification (kể cả duplicate channel), THE system SHALL deliver tới retailer.
2. THE system SHALL deduplicate trên client side nếu cùng `notificationId`.

---

## R-RTL-190 — Gửi báo cáo đến admin

- **source quote:** "Gửi báo cáo đến quản trị viên."
- **status:** active

### Acceptance Criteria

1. WHEN role `retailer` submit report tới admin, THE system SHALL persist + notify admin role group.
