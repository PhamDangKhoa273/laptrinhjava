---
title: Admin Functional Requirements
ids: [R-ADM-010, R-ADM-020, R-ADM-030, R-ADM-040, R-ADM-050]
status: active
last-reviewed: 2026-05-16
language: vi
brief-revision: 2026-05-16
gap: GAP-001
---

# Admin Functional Requirements

Yêu cầu chức năng cho vai trò **Admin** (Quản trị viên), workspace web. Tất cả R-ADM-* được sinh từ [`_brief-source.md`](./_brief-source.md) Brief Revision 2026-05-16. Stride-10 numbering per [`../../09-governance/id-naming.md`](../../09-governance/id-naming.md).

---

## R-ADM-010 — Quản lý tài khoản admin và phân quyền

- **role:** admin
- **source quote:** "Quản trị viên có thể tạo, xem, chỉnh sửa và xóa các tài khoản quản trị viên khác, đồng thời phân quyền và vai trò khi cần thiết."
- **status:** active
- **related-br:** [BR-USR-*, BR-ADM-*] (pending Stage 4)
- **related-stm:** —
- **related-api:** [API-ADM-*] (pending Stage 5; out of scope `docs-openapi-completion`)
- **tests:** AppRoutes.test.jsx (admin route access verification); pending backend admin user CRUD tests

### Acceptance Criteria

1. WHEN role `admin` gọi `POST /api/v1/users` với payload tạo admin mới, THE system SHALL persist user mới với role `ADMIN` AND SHALL ghi audit log.
2. WHEN role `admin` gọi `GET /api/v1/users` với filter role=`ADMIN`, THE system SHALL trả danh sách admin users.
3. WHEN role `admin` gọi `PUT /api/v1/users/{id}/profile` HOẶC `PATCH /api/v1/users/{id}/status` HOẶC `POST /api/v1/users/{id}/roles`, THE system SHALL update user và ghi audit log.
4. WHEN role `admin` gọi delete user (soft hoặc hard), THE system SHALL không cho phép admin tự xoá tài khoản của chính mình.
5. IF role không phải `ADMIN`, THE system SHALL trả `403 FORBIDDEN` với code `FORBIDDEN`.

---

## R-ADM-020 — Phê duyệt/từ chối đăng ký trang trại mới

- **role:** admin
- **source quote:** "Quản trị viên có thể xem, phê duyệt hoặc từ chối các đăng ký trang trại mới để đảm bảo tính hợp lệ."
- **status:** active
- **related-br:** [BR-FRMAPP-010] (pending Stage 4)
- **related-stm:** [STM-FRMAPP-T01..T07] (pending Stage 4 — `02-domain/state-machines/farm-approval.md`)
- **related-api:** pending (out of scope)
- **tests:** pending

### Acceptance Criteria

1. WHEN role `admin` gọi list pending farm applications, THE system SHALL trả các record với `status = PENDING`.
2. WHEN role `admin` approve một farm application với `status = PENDING`, THE system SHALL transition sang `APPROVED` qua `STM-FRMAPP-T02` AND SHALL gửi notification cho farm owner.
3. WHEN role `admin` reject một farm application với `status = PENDING`, THE system SHALL transition sang `REJECTED` qua `STM-FRMAPP-T03` AND SHALL gửi notification kèm lý do.
4. IF farm application không ở `status = PENDING`, THE system SHALL từ chối approve/reject với code `INVALID_STATE_TRANSITION`.

---

## R-ADM-030 — Quản lý chi tiết trang trại (chứng nhận, liên hệ, vị trí)

- **role:** admin
- **source quote:** "Quản trị viên có thể truy cập và quản lý thông tin chi tiết của trang trại, bao gồm chứng nhận, thông tin liên hệ và vị trí."
- **status:** active
- **related-br:** [BR-FRM-*] (pending Stage 4)
- **related-stm:** —
- **related-api:** pending
- **tests:** pending

### Acceptance Criteria

1. WHEN role `admin` đọc bất kỳ farm record nào, THE system SHALL trả full detail (certifications, contact info, location, farm profile).
2. WHEN role `admin` cập nhật farm certifications/contact/location, THE system SHALL persist thay đổi AND SHALL ghi audit log.
3. WHEN role `admin` đọc/cập nhật farm thuộc về user khác, THE system SHALL cho phép (admin có quyền cross-farm theo BR-FRM-* exception).
4. IF role không phải `ADMIN`, THE system SHALL từ chối cross-farm read/update.

---

## R-ADM-040 — Giám sát sản phẩm và quản lý danh mục

- **role:** admin
- **source quote:** "Quản trị viên có thể giám sát tất cả sản phẩm được đăng ký trên nền tảng, quản lý danh mục sản phẩm, mô tả và đảm bảo tính chính xác của dữ liệu."
- **status:** active
- **related-br:** [BR-PRD-*] (pending Stage 4)
- **related-stm:** —
- **related-api:** pending
- **tests:** pending

### Acceptance Criteria

1. WHEN role `admin` list mọi product trên platform, THE system SHALL trả full catalog (filter by category, status, listing state).
2. WHEN role `admin` tạo/cập nhật/xoá product category, THE system SHALL persist thay đổi AND SHALL không phá vỡ existing product references (constraint check).
3. WHEN role `admin` cập nhật mô tả/metadata sản phẩm, THE system SHALL persist AND SHALL ghi audit log.
4. IF role không phải `ADMIN`, THE system SHALL từ chối catalog write operations.

---

## R-ADM-050 — Triển khai và quản lý smart contracts

- **role:** admin
- **source quote:** "Quản trị viên có thể triển khai, cập nhật và quản lý các hợp đồng thông minh nhằm duy trì tính chính xác và minh bạch của dữ liệu truy xuất nguồn gốc sản phẩm trên blockchain."
- **status:** planned
- **related-br:** [BR-VCH-*] (pending Stage 4)
- **related-stm:** —
- **related-api:** pending
- **tests:** pending
- **gap:** [`GAP-001`](../../09-governance/gap-register.md) — Brief yêu cầu deploy/update smart contracts; codebase hiện tại (`docs/architecture/BLOCKCHAIN_ARCHITECTURE.md` cũ, sẽ được di chuyển sang `03-architecture/component.md`) ghi rõ "validation/manage, NOT real deployment". Cần product decision.

### Acceptance Criteria

> **[CONTRADICTION: see `GAP-001`]** — Acceptance criteria dưới đây phản ánh Brief; implementation hiện tại chỉ partial cover (validate/track only). Khi `GAP-001` được resolve (deploy thật hoặc Brief revision), AC này phải được sửa hoặc giữ nguyên tương ứng.

1. WHEN role `admin` trigger deploy smart contract via admin governance UI, THE system SHALL submit deploy transaction tới VeChainThor AND SHALL persist `BlockchainTransaction` record với status `PENDING`.
2. WHEN deploy transaction được confirm trên VeChainThor, THE system SHALL update status sang `SUCCESS` AND SHALL store contract address.
3. WHEN role `admin` update existing smart contract, THE system SHALL submit update transaction kèm new contract metadata.
4. WHILE deploy/update đang `PENDING`, THE system SHALL không cho phép admin trigger deploy mới cho cùng contract slot.
5. IF deploy transaction fail, THE system SHALL set status `FAILED` AND SHALL cho phép admin retry qua governance API.
6. THE system SHALL không bao giờ trả private signing key trong response API/log/UI.
7. IF role không phải `ADMIN`, THE system SHALL từ chối deploy/update operations.
