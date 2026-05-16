---
title: Shipping Manager Functional Requirements
ids: [R-SHM-010, R-SHM-020, R-SHM-030, R-SHM-040, R-SHM-050, R-SHM-060, R-SHM-070, R-SHM-080, R-SHM-090]
status: active
last-reviewed: 2026-05-16
language: vi
brief-revision: 2026-05-16
---

# Shipping Manager Functional Requirements

Yêu cầu chức năng cho vai trò **Shipping Manager** (Quản lý Vận chuyển), workspace web. 9 R-SHM-* sinh từ [`_brief-source.md`](./_brief-source.md). Stride-10.

---

## R-SHM-010 — Xem các đơn hàng thành công giữa Retailer và Farm

- **source quote:** "Xem các đơn hàng thành công giữa Nhà bán lẻ và Quản lý Trang trại."
- **status:** active

### Acceptance Criteria

1. WHEN role `shipping_manager` list orders với `status ∈ {ACCEPTED, IN_FULFILLMENT}`, THE system SHALL trả danh sách orders eligible cho shipment creation.

---

## R-SHM-020 — Tạo chuyến hàng cho mỗi đơn thành công

- **source quote:** "Tạo chuyến hàng cho mỗi đơn hàng thành công."
- **status:** active
- **related-stm:** STM-SHP-T01 (none → CREATED)

### Acceptance Criteria

1. WHEN role `shipping_manager` tạo shipment cho order eligible, THE system SHALL persist shipment với `status = CREATED` qua `STM-SHP-T01` AND SHALL link tới order.
2. IF order không eligible (status ngoài tập trên), THE system SHALL từ chối với code `ORDER_NOT_SHIPPABLE`.

---

## R-SHM-030 — Hủy chuyến hàng

- **source quote:** "Hủy chuyến hàng đã tạo."
- **status:** active
- **related-stm:** STM-SHP-T07 (multiple → CANCELLED)

### Acceptance Criteria

1. WHEN role `shipping_manager` cancel shipment với `status ∈ {CREATED, ASSIGNED, PICKED_UP}`, THE system SHALL transition sang `CANCELLED` qua `STM-SHP-T07`.
2. IF status ngoài tập trên (e.g., `DELIVERED`, `CONFIRMED`), THE system SHALL từ chối với code `INVALID_STATE_TRANSITION`.

---

## R-SHM-040 — Xem các quy trình vận chuyển

- **source quote:** "Xem các quy trình vận chuyển."
- **status:** active

### Acceptance Criteria

1. WHEN role `shipping_manager` list shipments, THE system SHALL trả mọi shipment trong system (filter optional).
2. WHEN xem detail shipment, THE system SHALL trả full record (status history, checkpoints, proof events, driver/vehicle assignments).

---

## R-SHM-050 — Quản lý phương tiện vận chuyển (CRUD)

- **source quote:** "Quản lý phương tiện vận chuyển (Tạo, Cập nhật, Xóa, Xem)."
- **status:** active

### Acceptance Criteria

1. WHEN role `shipping_manager` create vehicle, THE system SHALL persist `Vehicle` record.
2. WHEN role `shipping_manager` update vehicle, THE system SHALL persist changes.
3. WHEN role `shipping_manager` delete vehicle, THE system SHALL không cho phép delete nếu vehicle đang được assign cho shipment `ACTIVE`.
4. WHEN role `shipping_manager` list/read vehicles, THE system SHALL trả danh sách.

---

## R-SHM-060 — Quản lý tài xế vận chuyển (CRUD)

- **source quote:** "Quản lý tài xế vận chuyển (Tạo, Cập nhật, Xóa, Xem)."
- **status:** active

### Acceptance Criteria

1. WHEN role `shipping_manager` create driver record, THE system SHALL persist `Driver` entity AND optionally link tới user account với role `DRIVER`.
2. WHEN role `shipping_manager` update driver, THE system SHALL persist.
3. WHEN role `shipping_manager` delete driver, THE system SHALL từ chối nếu driver có shipment `ACTIVE` (per BR known authorization pattern).
4. WHEN role `shipping_manager` list/read drivers, THE system SHALL trả danh sách.

---

## R-SHM-070 — Gửi báo cáo đến admin

- **source quote:** "Gửi báo cáo đến quản trị viên."
- **status:** active

### Acceptance Criteria

1. WHEN role `shipping_manager` submit report tới admin, THE system SHALL persist + notify admin role group.

---

## R-SHM-080 — Gửi thông báo đến Farm và Retailer

- **source quote:** "Gửi thông báo đến Quản lý Trang trại và Nhà bán lẻ."
- **status:** active

### Acceptance Criteria

1. WHEN role `shipping_manager` send notification liên quan tới shipment, THE system SHALL deliver tới farm manager + retailer linked với shipment.
2. IF shipment không tồn tại hoặc không liên quan, THE system SHALL từ chối.

---

## R-SHM-090 — Xem báo cáo từ Driver

- **source quote:** "Xem báo cáo từ Tài xế vận chuyển."
- **status:** active

### Acceptance Criteria

1. WHEN role `shipping_manager` list driver reports, THE system SHALL trả danh sách reports (filter by driver, shipment, time range).
