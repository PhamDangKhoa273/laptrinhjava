---
title: Farm Manager Functional Requirements
ids: [R-FRM-010, R-FRM-020, R-FRM-030, R-FRM-040, R-FRM-050, R-FRM-060, R-FRM-070, R-FRM-080, R-FRM-090, R-FRM-100, R-FRM-110, R-FRM-120, R-FRM-130, R-FRM-140, R-FRM-150, R-FRM-160, R-FRM-170, R-FRM-180, R-FRM-190, R-FRM-200, R-FRM-210]
status: active
last-reviewed: 2026-05-16
language: vi
brief-revision: 2026-05-16
---

# Farm Manager Functional Requirements

Yêu cầu chức năng cho vai trò **Farm Manager** (Quản lý Trang trại), workspace web. 21 R-FRM-* sinh từ [`_brief-source.md`](./_brief-source.md) Brief Revision 2026-05-16. Stride-10 numbering.

---

## R-FRM-010 — Đăng ký và đăng nhập

- **source quote:** "Đăng ký và đăng nhập tài khoản."
- **status:** active
- **related-api:** [API-AUT-001, API-AUT-002] (pending S5.T4)
- **tests:** AppRoutes.test.jsx (post-login routing)

### Acceptance Criteria

1. WHEN một user mới gọi `POST /api/v1/auth/register` với role request `FARM`, THE system SHALL persist user với role `FARM` AND SHALL hash password bằng BCrypt.
2. WHEN user đã đăng ký gọi `POST /api/v1/auth/login` đúng credentials, THE system SHALL trả access token + refresh token + user info + roles.
3. IF credentials sai, THE system SHALL trả `401 UNAUTHORIZED`.

---

## R-FRM-020 — Cập nhật thông tin cá nhân chủ sở hữu

- **source quote:** "Cập nhật thông tin cá nhân của chủ sở hữu."
- **status:** active
- **related-br:** BR-USR-* (pending Stage 4)

### Acceptance Criteria

1. WHEN role `farm_manager` gọi `PUT /api/v1/users/{id}/profile` với `id` của chính mình, THE system SHALL persist thay đổi.
2. IF `id` thuộc user khác, THE system SHALL trả `403 FORBIDDEN`.

---

## R-FRM-030 — Cập nhật Giấy phép Kinh doanh và thông tin trang trại

- **source quote:** "Cập nhật Giấy phép Kinh doanh và thông tin trang trại."
- **status:** active
- **related-br:** BR-FRM-010 (ownership check), BR-FRM-030 (suspension check)

### Acceptance Criteria

1. WHEN role `farm_manager` cập nhật business license document hoặc farm metadata cho farm thuộc về mình, THE system SHALL persist AND SHALL trigger admin re-review nếu license thay đổi.
2. IF user không phải owner của farm, THE system SHALL trả `403 FORBIDDEN`.
3. IF farm bị `SUSPENDED` (BR-FRM-030 fail), THE system SHALL từ chối write với code `FARM_SUSPENDED`.

---

## R-FRM-040 — Mua gói dịch vụ

- **source quote:** "Mua gói dịch vụ để sử dụng hệ thống."
- **status:** active
- **related-stm:** STM-SUB-T01..T02 (pending Stage 4)
- **related-br:** BR-SUB-* (pending Stage 4)

### Acceptance Criteria

1. WHEN role `farm_manager` chọn một `ServicePackage` và submit purchase, THE system SHALL tạo `FarmSubscription` với status `PENDING_PAYMENT`.
2. THE system SHALL trả `subscriptionId` và `paymentInstructions` để user thanh toán (xem R-FRM-050).

---

## R-FRM-050 — Thanh toán mua gói dịch vụ

- **source quote:** "Thanh toán cho việc mua gói dịch vụ."
- **status:** active
- **related-stm:** STM-SUB-T03 (transition PENDING_PAYMENT → ACTIVE)

### Acceptance Criteria

1. WHEN payment gateway callback xác nhận thanh toán thành công, THE system SHALL transition `FarmSubscription` từ `PENDING_PAYMENT` sang `ACTIVE` qua `STM-SUB-T03`.
2. THE system SHALL verify HMAC/signature của callback (BR-SUB-* — payment callback policy).
3. THE system SHALL idempotent xử lý callback trùng lặp.
4. IF callback signature không hợp lệ, THE system SHALL trả `400 BAD_REQUEST` AND SHALL không thay đổi subscription state.

---

## R-FRM-060 — Xem các quy trình mùa vụ canh tác

- **source quote:** "Xem các quy trình của mùa vụ canh tác."
- **status:** active

### Acceptance Criteria

1. WHEN role `farm_manager` đọc seasons của farm thuộc mình, THE system SHALL trả danh sách seasons + farming processes.
2. IF role không phải owner, THE system SHALL trả `403 FORBIDDEN`.

---

## R-FRM-070 — Xem chi tiết mùa vụ

- **source quote:** "Xem chi tiết mùa vụ canh tác."
- **status:** active

### Acceptance Criteria

1. WHEN role `farm_manager` đọc detail của một season thuộc farm mình, THE system SHALL trả full season object (states, processes, batches, blockchain tx hash).

---

## R-FRM-080 — Tạo mùa vụ canh tác (ghi blockchain)

- **source quote:** "Tạo mùa vụ canh tác (thông tin được lưu vào blockchain)."
- **status:** active
- **related-stm:** STM-SEA-T01..T02 (pending Stage 4)
- **related-br:** BR-SEA-010 (Season create với farm owner reference + blockchain commit job)

### Acceptance Criteria

1. WHEN role `farm_manager` tạo season cho farm thuộc mình, THE system SHALL persist season với `status = DRAFT` AND SHALL emit blockchain commit job (async, idempotency-key = seasonId).
2. WHEN blockchain commit thành công, THE system SHALL set `season.blockchainTxHash` AND transition sang `STATE = COMMITTED` qua `STM-SEA-T02`.
3. WHEN blockchain commit fail, THE system SHALL giữ season ở `DRAFT` AND SHALL log `BlockchainTransaction` với status `FAILED` (admin có thể retry qua R-ADM-050 governance).
4. THE system SHALL bảo đảm round-trip: serialize season payload → persist → blockchain → retrieve → deserialize → equivalent value.
5. IF user không phải owner của farm, THE system SHALL trả `403 FORBIDDEN`.

---

## R-FRM-090 — Cập nhật quy trình mùa vụ (ghi blockchain)

- **source quote:** "Cập nhật quy trình của mùa vụ canh tác (thông tin được lưu vào blockchain)."
- **status:** active

### Acceptance Criteria

1. WHEN role `farm_manager` cập nhật farming process trong season thuộc mình, THE system SHALL persist process AND SHALL emit blockchain proof commit job.
2. THE system SHALL bảo đảm round-trip serialization equivalence.
3. IF blockchain commit fail, THE system SHALL persist process locally AND SHALL log `BlockchainTransaction` với status `FAILED`.

---

## R-FRM-100 — Xuất mùa vụ

- **source quote:** "Xuất mùa vụ canh tác."
- **status:** active
- **related-stm:** STM-SEA-T04 (transition ACTIVE → EXPORTED)

### Acceptance Criteria

1. WHEN role `farm_manager` trigger export season, THE system SHALL transition season từ `ACTIVE` sang `EXPORTED` qua `STM-SEA-T04` AND SHALL generate export bundle.
2. THE export bundle SHALL bao gồm tham chiếu tới blockchain tx hashes của season + processes.

---

## R-FRM-110 — Tạo mã QR cho mùa vụ đã xuất (ghi blockchain)

- **source quote:** "Tạo mã QR cho mỗi mùa vụ đã xuất (thông tin được lưu vào blockchain)."
- **status:** active

### Acceptance Criteria

1. WHEN role `farm_manager` request QR code cho season `EXPORTED`, THE system SHALL generate QR encoding stable trace URL (containing seasonId + farmId).
2. THE QR generation SHALL emit blockchain commit job recording QR creation event.
3. THE system SHALL bảo đảm round-trip: decode QR → resolve trace → match season identity.
4. IF season chưa ở `EXPORTED`, THE system SHALL từ chối với code `SEASON_NOT_EXPORTED`.

---

## R-FRM-120 — Đăng ký đưa sản phẩm lên sàn

- **source quote:** "Đăng ký đưa sản phẩm lên sàn giao dịch."
- **status:** active
- **related-br:** conditional:BR-FRM-010&BR-FRM-020&BR-FRM-030 (per design D3)

### Acceptance Criteria

1. WHEN role `farm_manager` create listing cho batch thuộc farm mình AND có active subscription AND không bị suspend, THE system SHALL persist `ProductListing` với `status = PENDING_REVIEW` (hoặc `ACTIVE` nếu workflow không yêu cầu admin review).
2. IF farm không có active subscription (BR-FRM-020 fail), THE system SHALL trả `402 PAYMENT_REQUIRED` với code `SUBSCRIPTION_REQUIRED`.
3. IF farm bị suspend (BR-FRM-030 fail), THE system SHALL trả `403 FORBIDDEN` với code `FARM_SUSPENDED`.

---

## R-FRM-130 — Xem đăng ký sản phẩm trên sàn

- **source quote:** "Xem đăng ký đưa sản phẩm lên sàn giao dịch."
- **status:** active

### Acceptance Criteria

1. WHEN role `farm_manager` list own listings, THE system SHALL trả danh sách `ProductListing` thuộc farm của user (mọi status).

---

## R-FRM-140 — Xử lý yêu cầu mua từ Retailer

- **source quote:** "Xử lý các yêu cầu mua nông sản từ Nhà bán lẻ."
- **status:** active
- **related-stm:** STM-ORD-T03..T04 (transition PENDING/DEPOSIT_PAID → ACCEPTED|REJECTED)

### Acceptance Criteria

1. WHEN role `farm_manager` accept order thuộc farm mình, THE system SHALL transition order sang `ACCEPTED` qua `STM-ORD-T03` AND SHALL gửi notification cho retailer.
2. WHEN role `farm_manager` reject order, THE system SHALL transition sang `REJECTED` qua `STM-ORD-T04` AND SHALL trigger deposit refund flow.
3. IF order không thuộc farm của user, THE system SHALL trả `403 FORBIDDEN`.

---

## R-FRM-150 — Xem retailer đã ký hợp đồng

- **source quote:** "Xem thông tin Nhà bán lẻ đã ký hợp đồng."
- **status:** active

### Acceptance Criteria

1. WHEN role `farm_manager` list contracts thuộc farm mình, THE system SHALL trả danh sách contracts + retailer info (name, contact, contract status).

---

## R-FRM-160 — Xem các quy trình vận chuyển

- **source quote:** "Xem và xem chi tiết các quy trình vận chuyển."
- **status:** active

### Acceptance Criteria

1. WHEN role `farm_manager` list shipments liên quan tới orders thuộc farm mình, THE system SHALL trả danh sách shipments + status.
2. WHEN role `farm_manager` xem detail của một shipment thuộc farm, THE system SHALL trả full shipment record (states, checkpoints, proof events).

---

## R-FRM-170 — Xem báo cáo vận chuyển

- **source quote:** "Xem báo cáo của các quy trình vận chuyển."
- **status:** active

### Acceptance Criteria

1. WHEN role `farm_manager` list reports liên quan tới shipments của farm, THE system SHALL trả danh sách reports (driver reports, retailer reports).

---

## R-FRM-180 — Nhận thông báo từ Retailer

- **source quote:** "Nhận thông báo về báo cáo từ Nhà bán lẻ."
- **status:** active

### Acceptance Criteria

1. WHEN một retailer submit report liên quan tới order/farm của user, THE system SHALL tạo notification cho farm manager AND SHALL deliver qua channel cấu hình (in-app + email).

---

## R-FRM-190 — Nhận thông báo từ Driver

- **source quote:** "Nhận thông báo về báo cáo từ Người vận chuyển."
- **status:** active

### Acceptance Criteria

1. WHEN một driver submit shipment-related report liên quan tới farm của user, THE system SHALL tạo notification cho farm manager AND SHALL deliver.

---

## R-FRM-200 — Nhận thông báo IoT trong ngày (nhiệt độ/độ ẩm/pH)

- **source quote:** "Nhận thông báo về nhiệt độ, độ ẩm, độ pH trong ngày."
- **status:** active
- **related-br:** BR-IOT-010
- **gap:** [`GAP-007`](../../09-governance/gap-register.md) (resolved by design D4) — cadence definition

### Acceptance Criteria

1. WHEN sensor reading vượt ngưỡng cấu hình cho farm thuộc user, THE system SHALL tạo `IoTAlert` (kind=BREACH) AND SHALL gửi notification ngay (immediate).
2. WHILE thời gian là 07:00 ICT (timezone của farm), THE system SHALL aggregate readings 24h trước AND SHALL gửi daily digest cho farm manager dù không có breach.
3. IF reading thuộc về farm khác (cross-farm ingest), THE system SHALL reject ingest trước khi persist (BR-IOT-* ownership check).

---

## R-FRM-210 — Gửi báo cáo đến admin

- **source quote:** "Gửi báo cáo đến quản trị viên."
- **status:** active

### Acceptance Criteria

1. WHEN role `farm_manager` submit report nhắm tới admin, THE system SHALL persist report AND SHALL tạo notification cho admin role group.
2. IF report content vi phạm content policy (sanitization fail), THE system SHALL từ chối với code `CONTENT_POLICY_VIOLATION`.
