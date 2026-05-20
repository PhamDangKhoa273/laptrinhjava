---
title: Module — Auth
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [user, common]
---

# Auth

## Purpose

Auth module sở hữu các luồng xác thực: register, login, password reset, JWT token issuance/validation, và authenticated session bootstrap cho frontend.

## Owns

- **R-\***: shared with role files (login/register là first bullet của Farm Manager R-FRM-010 và Retailer R-RTL-010)
- **BR-\***: pending Stage 4 — `BR-AUT-*`
- **STM-\***: none

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/auth/`
- **Related security infrastructure:** `backend/src/main/java/com/bicap/core/security/` (`JwtTokenProvider`, `JwtAuthenticationFilter`, `CustomUserDetailsService`, `SecurityUtils`, `RateLimitFilter`)
- **Controllers:** `AuthController`
- **Services:** `AuthService`
- **Frontend routes:** `/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/landing`
- **Frontend pages:** `LoginPage.jsx`, `RegisterPage.jsx`, `ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`, `AuthLandingPage.jsx`
- **Context:** `frontend/src/context/AuthContext.jsx`
- **Service:** `frontend/src/services/authService.js`

## Depends-on

- user, common

## API surface

- pending Stage 5 (S5.T4) — `API-AUT-001..005`:
  - `API-AUT-001` `POST /api/v1/auth/login` (`authLogin`)
  - `API-AUT-002` `POST /api/v1/auth/register` (`authRegister`)
  - `API-AUT-003` `POST /api/v1/auth/refresh` (`authRefresh`)
  - `API-AUT-004` `POST /api/v1/auth/logout` (`authLogout`)
  - `API-AUT-005` `GET /api/v1/auth/me` (`authMe`)

## Tests

- `AppRoutes.test.jsx` — protected route behavior
- pending: backend auth/security tests per R-* và endpoint-specific contract tests

## Open gaps

- pending — token revocation strategy (currently stateless logout)
## Change notes

- 2026-05-21: Login/JWT auth treats only `ACTIVE` users as enabled; `BLOCKED` users are locked. Existing access tokens stop authenticating after DB status changes because JWT auth reloads current user status.
- 2026-05-21: Refresh token rotation rejects non-active users and revokes the attempted refresh session.
- 2026-05-21: Soft-deleted (`DELETED`) users are disabled for login and JWT authentication.
