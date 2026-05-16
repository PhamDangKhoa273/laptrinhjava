---
id: ADR-003
title: JWT Stateless Authentication
status: accepted
date: 2026-05-16
decision: BICAP dùng stateless JWT cho authentication với access token + refresh token, không session server-side.
context: BICAP cần authentication cho 6 roles, hỗ trợ web SPA + mobile app, có thể horizontal scale backend.
consequences: Backend stateless → scales horizontally; logout là client-side (xóa token); cần refresh token persistence nếu muốn revoke server-side về sau.
---

# ADR-003 — JWT Stateless Authentication

## Status

accepted

## Context

BICAP cần authentication cho:

- Web SPA (React) cho 5 roles (admin, farm_manager, retailer, shipping_manager, guest)
- Mobile app (Capacitor) cho driver
- Backend horizontal scaling (NFR-SCL-010)

Hai phương án:

- **Stateless JWT:** token chứa user identity + roles; backend stateless.
- **Session-based (cookie + Redis store):** server-side session.

## Decision

**Stateless JWT:**

- Access token: 24h expiry (configurable via `APP_JWT_EXPIRATION_MS`)
- Refresh token: 7d expiry (`APP_JWT_REFRESH_EXPIRATION_MS`)
- Token chứa: `sub` (email), `userId`, `roles`, `iat`, `exp`, `jti`, `type`
- Spring Security: `JwtAuthenticationFilter` reads `Authorization: Bearer <token>`, populates `SecurityContext`
- Public endpoints: login, register, refresh, public marketplace, public trace (xem [`../../05-api/authentication.md`](../../05-api/authentication.md))
- Logout: stateless — backend trả thông báo, frontend xóa token cục bộ
- Roles: 6 roles với prefix `ROLE_<NAME>` ở Spring Security level

## Consequences

- **Positive:**
  - Backend stateless → horizontal scale dễ (NFR-SCL-010)
  - Không phụ thuộc session store
  - Mobile app dễ implement (token storage + bearer header)
- **Negative:**
  - Logout không revoke token thực sự; token còn valid đến expiry. Mitigation: short access token TTL + rotate refresh token
  - Token blacklist phức tạp nếu cần revoke gấp (e.g., user bị compromise). Currently không có.
- **Follow-up:**
  - Nếu cần revoke gấp, thêm `RefreshToken` entity + check trong filter (defer)
  - Audit log cho login/refresh actions

## Alternatives Considered

- **Cookie + Redis session:** Reject vì backend không stateless → khó scale, cookie cross-domain cho mobile app phức tạp.
- **OAuth 2.0 / OpenID Connect provider bên ngoài:** Reject scope; có thể adopt sau khi cần SSO với external IdP.
