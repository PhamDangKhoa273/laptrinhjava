# Security and Observability Module

## Purpose

Security/Observability is a cross-cutting module covering JWT filters, RBAC support,
rate limiting, CORS, audit logging, exception handling, actuator health, metrics, and
production hardening conventions.

## Backend Ownership

- Core package: `backend/src/main/java/com/bicap/core`
- Security package: `backend/src/main/java/com/bicap/core/security`
- Key examples:
  - `RateLimitFilter.java`
  - JWT/security configuration
  - audit log service/entity/repository
  - exception handling
  - actuator configuration

## Frontend Ownership

- Route guards: `ProtectedRoute.jsx`, `RoleProtectedRoute.jsx`
- Auth state: `AuthContext.jsx`
- API client: `services/api.js`
- RBAC tests: `routes/AppRoutes.test.jsx`

## Roles

Security applies to all roles and public users.

## Business Rules

1. Protected workspaces require authentication.
2. Workspace access is determined by normalized primary role.
3. Admin-only functions require admin authority.
4. Security-relevant actions should be auditable where supported.
5. Observability endpoints support deployment/runtime health checks.

## Security Rules

1. Deny-by-default when authentication or role information is missing.
2. Rate limiting protects sensitive or high-risk endpoints.
3. CORS must be environment-controlled.
4. Production secrets must come from environment variables.
5. Demo seed data must not weaken production security.
6. Public endpoints must be intentionally public.

## Tests and Verification

- `AppRoutes.test.jsx` validates frontend RBAC route behavior.
- Backend security/rate-limit tests should be updated when filters change.
- Frontend audit should report zero moderate+ vulnerabilities.

## Known Gaps

- Keep a formal endpoint permission matrix if API surface expands further.
