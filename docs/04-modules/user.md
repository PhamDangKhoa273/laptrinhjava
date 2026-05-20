---
title: Module — User and RBAC
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [auth, common]
---

# User and RBAC

## Purpose

User/RBAC module sở hữu accounts, roles, permissions, và role assignment data. Đây là source of truth cho "ai là ai" và "ai được làm gì".

## Owns

- **R-\***: pending — admin user management bullets từ R-ADM-010 referenced
- **BR-\***: pending Stage 4 — `BR-USR-*`
- **STM-\***: none

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/user/`
- **Layers:**
  - `controller/` — user và permission APIs
  - `service/` — user/permission rules
  - `entity/` — `User`, `Role`, `Permission`, `UserRole`, `RolePermission`
  - `repository/` — account và RBAC persistence
- **Frontend pages:** `AdminUsersPage.jsx`
- **Frontend utils:** `frontend/src/utils/helpers.js` (role normalization), `frontend/src/utils/constants.js` (role constants)
- **Route guards:** `RoleProtectedRoute.jsx`, `ProtectedRoute.jsx`

## Depends-on

- auth, common

## API surface

- pending Stage 5 — user CRUD endpoints (out of scope for spec hiện tại; defer to `docs-openapi-completion`)

## Tests

- `AppRoutes.test.jsx` — workspace RBAC access và denial
- pending: backend user service và role assignment behavior tests

## Open gaps

- pending — explicit permission matrix nếu permissions trở nên granular hơn role workspaces
## Change notes

- 2026-05-21: Admin-created users honor `initialRole`; if a non-guest role is selected, the default `GUEST` role is removed.
- 2026-05-21: User status/role mutation APIs flush persistence changes before returning so admin UI receives current DB status and roles.
- 2026-05-21: Admin delete uses soft delete (`DELETED`) so accounts with farm/order/driver references can be removed from admin lists without breaking historical data.
