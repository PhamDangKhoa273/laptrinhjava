---
title: Driver Functional Requirements
ids: [R-DRV-010, R-DRV-020, R-DRV-030, R-DRV-040, R-DRV-050, R-DRV-060]
status: active
last-reviewed: 2026-05-16
language: vi
brief-revision: 2026-05-16
---

# Driver Functional Requirements

Yêu cầu chức năng cho vai trò **Driver** (Tài xế vận chuyển), workspace mobile. 6 R-DRV-* sinh từ [`_brief-source.md`](./_brief-source.md). Stride-10.

---

## R-DRV-010 — Xem chuyến hàng được giao

- **source quote:** "Xem và xem chi tiết các chuyến hàng của bạn."
- **status:** active

### Acceptance Criteria

1. WHEN role `driver` list shipments được assign cho mình, THE system SHALL trả danh sách + status.
2. WHEN role `driver` xem detail shipment được assign, THE system SHALL trả full shipment record.
3. IF shipment không assign cho driver, THE system SHALL trả `403 FORBIDDEN`.

---

## R-DRV-020 — Cập nhật quy trình vận chuyển

- **source quote:** "Cập nhật các quy trình vận chuyển."
- **status:** active
- **related-stm:** STM-SHP-T03..T05

### Acceptance Criteria

1. WHEN role `driver` transition shipment được assign từ `ASSIGNED → PICKED_UP` (T03), `PICKED_UP → IN_TRANSIT` (T04), `IN_TRANSIT → DELIVERED` (T05), THE system SHALL apply transition AND SHALL log checkpoint event.
2. IF transition không khớp `STM-SHP` table, THE system SHALL từ chối với code `INVALID_STATE_TRANSITION`.

---

## R-DRV-030 — Quét QR khi tới trang trại

- **source quote:** "Quét mã QR để theo dõi thông tin sản phẩm khi hoàn tất đến trang trại."
- **status:** active

### Acceptance Criteria

1. WHEN role `driver` scan QR tại farm pickup point, THE system SHALL resolve trace identity AND SHALL match shipment's expected farm/season/batch.
2. THE system SHALL bảo đảm round-trip: QR encode → decode → resolve cùng trace identity.
3. IF QR không match expected shipment, THE system SHALL warn driver AND SHALL log discrepancy.

---

## R-DRV-040 — Xác nhận hoàn tất nhận sản phẩm

- **source quote:** "Xác nhận đã hoàn tất việc nhận sản phẩm."
- **status:** active
- **related-stm:** STM-SHP-T03 (ASSIGNED → PICKED_UP)

### Acceptance Criteria

1. WHEN role `driver` confirm pickup hoàn tất với shipment `ASSIGNED`, THE system SHALL transition sang `PICKED_UP` qua `STM-SHP-T03`.
2. THE system SHALL ghi pickup timestamp + driver location (nếu available).

---

## R-DRV-050 — Xác nhận hoàn tất giao sản phẩm cho retailer

- **source quote:** "Xác nhận đã hoàn tất việc giao sản phẩm cho nhà bán lẻ."
- **status:** active
- **related-stm:** STM-SHP-T05 (IN_TRANSIT → DELIVERED)

### Acceptance Criteria

1. WHEN role `driver` confirm delivery hoàn tất với shipment `IN_TRANSIT`, THE system SHALL transition sang `DELIVERED` qua `STM-SHP-T05`.
2. THE system SHALL gửi notification cho retailer (R-RTL-150).
3. THE system SHALL không transition shipment sang `CONFIRMED` (đó là retailer responsibility — R-RTL-160).

---

## R-DRV-060 — Gửi báo cáo đến Shipping Manager

- **source quote:** "Gửi báo cáo đến Quản lý Vận chuyển."
- **status:** active

### Acceptance Criteria

1. WHEN role `driver` submit report (e.g., incident, delay, vehicle issue), THE system SHALL persist report AND SHALL notify shipping manager role group.
2. IF report nội dung vi phạm content policy, THE system SHALL từ chối với code `CONTENT_POLICY_VIOLATION`.
