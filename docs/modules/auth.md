# Auth Module

## Purpose

The Auth module owns authentication workflows: register, login, password reset, JWT token
issuance/validation integration, and authenticated session bootstrap for the frontend.

## Backend Ownership

- Package: `backend/src/main/java/com/bicap/modules/auth`
- Related security infrastructure: `backend/src/main/java/com/bicap/core/security`
- Related user data: `modules/user`

## Frontend Ownership

- Routes: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/landing`
- Pages: `LoginPage.jsx`, `RegisterPage.jsx`, `ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`, `AuthLandingPage.jsx`
- Context: `frontend/src/context/AuthContext.jsx`
- Service: `frontend/src/services/authService.js`

## Roles

Auth itself is public for login/register/reset flows. After login, users are routed by
primary role.

## Business Rules

1. Users authenticate before protected workspaces render.
2. Post-login routing must resolve to the primary role dashboard.
3. Registration captures account identity and requested role context.
4. Password reset flows must not expose sensitive token values in public UI.
5. Auth state must expose enough user role data for route guards.

## Security Rules

1. JWT and security filters enforce backend authentication.
2. Frontend auth guards improve UX but do not replace backend authorization.
3. Production must not rely on weak default credentials.
4. Rate limiting should protect sensitive auth endpoints.

## Tests and Verification

- Frontend route tests in `frontend/src/routes/AppRoutes.test.jsx` validate protected route behavior.
- Backend auth/security tests should be preferred when changing token behavior.

## Known Gaps

- Keep password reset and token expiry behavior documented in endpoint-specific API docs when changed.
