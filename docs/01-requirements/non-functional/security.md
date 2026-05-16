---
title: Non-Functional — Security
ids: [NFR-SEC-010, NFR-SEC-020, NFR-SEC-030]
status: active
last-reviewed: 2026-05-16
language: vi
---

# Non-Functional — Security

## NFR-SEC-010 — RBAC enforcement cho 6 roles

- **source quote:** "Blockchain phải đảm bảo tính minh bạch và bất biến của dữ liệu nguồn gốc sản phẩm. Các tiêu chuẩn mã hóa của VeChainThor cần được sử dụng để bảo mật thông tin, đồng thời quyền truy cập phải được giới hạn theo vai trò (quản trị viên, nhà bán lẻ, đơn vị vận chuyển)."
- **status:** active
- **related:** [`../../06-security/rbac-matrix.md`](../../06-security/rbac-matrix.md)

### Acceptance Criteria

1. THE system SHALL enforce RBAC cho 6 roles: `admin`, `farm_manager`, `retailer`, `shipping_manager`, `driver`, `guest`.
2. THE backend SHALL là single point of authorization (per design D5); frontend route guard chỉ enforce role-shape.
3. WHERE matrix cell có `conditional:BR-*`, THE backend SHALL evaluate BR-* server-side trước khi allow.
4. THE system SHALL deny by default cho mọi resource chưa được khai báo trong matrix.

## NFR-SEC-020 — Stateless JWT authentication

- **source quote:** Suy ra từ codebase hiện tại; phần Brief về RBAC.
- **status:** active

### Acceptance Criteria

1. THE system SHALL dùng stateless JWT với access token + refresh token.
2. THE system SHALL không trả password hash trong API response.
3. THE system SHALL hash passwords bằng BCrypt.
4. THE system SHALL có rate limiting cho sensitive endpoints (login, register, forgot-password).

## NFR-SEC-030 — Secrets management

- **source quote:** Suy ra từ AGENTS.md security rules.
- **status:** active

### Acceptance Criteria

1. THE system SHALL không hardcode production credentials trong code/docs.
2. THE system SHALL load secrets từ environment variables (`APP_JWT_SECRET`, `VECHAIN_THOR_DEV_PRIVATE_KEY`, ...).
3. THE system SHALL không trả private signing keys trong API response, log, hoặc UI (per `R-ADM-050` AC 6).
4. THE production deployment SHALL không dùng demo seed credentials.
