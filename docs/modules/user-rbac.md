# User and RBAC Module

## Purpose

The User/RBAC module owns user accounts, roles, permissions, and role assignment data.
It is the source of truth for who a user is and what they are allowed to access.

## Backend Ownership

- Package: `backend/src/main/java/com/bicap/modules/user`
- Key layers:
  - `controller/` for user and permission APIs
  - `service/` for user/permission rules
  - `entity/` for `User`, `Role`, `Permission`, `UserRole`, `RolePermission`
  - `repository/` for account and RBAC persistence

## Frontend Ownership

- Admin user management page: `frontend/src/pages/AdminUsersPage.jsx`
- Auth role normalization: `frontend/src/utils/helpers.js`
- Role constants: `frontend/src/utils/constants.js`
- Route guards: `RoleProtectedRoute.jsx`, `ProtectedRoute.jsx`

## Roles

| Role | Access |
|---|---|
| Admin | Manage users, accounts, roles, verification and locks |
| Non-admin roles | Access own workspace/profile only |

## Business Rules

1. A user may have role data exposed as `role`, `primaryRole`, or `roles`; frontend normalizes it.
2. Primary role determines post-login workspace and visible dashboard navigation.
3. Admin-only user governance must not render for non-admin accounts.
4. Permission assignments must remain consistent with role assignments.

## Security Rules

1. Backend authorization is authoritative.
2. Frontend RBAC must mirror backend intent for workspace isolation.
3. Role checks should deny by default when role data is missing or unknown.

## Tests and Verification

- `AppRoutes.test.jsx` validates workspace RBAC access and denial.
- Backend tests should cover user service and seeder/role assignment behavior.

## Known Gaps

- Add explicit permission matrix documentation if permissions become more granular than role workspaces.
