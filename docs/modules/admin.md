# Admin Module

## Purpose

The Admin module owns platform governance: control center, account oversight, operations,
farms, retailers, logistics, packages, products, blockchain trace oversight, content,
analytics, and website appearance administration.

## Backend Ownership

- Package: `backend/src/main/java/com/bicap/modules/admin`
- Cross-module administration also calls user, farm, retailer, logistics, product, content,
  analytics, and blockchain modules.

## Frontend Ownership

- Routes under `/dashboard/admin/*`
- Main pages:
  - `AdminControlCenterPage.jsx`
  - `AdminUsersPage.jsx`
  - `AdminOperationsPage.jsx`
  - `AdminFarmsPage.jsx`
  - `AdminRetailersPage.jsx`
  - `AdminPackagesPage.jsx`
  - `AdminLogisticsPage.jsx`
  - `AdminProductsPage.jsx`
  - `AdminBlockchainTracePage.jsx`
  - `AdminContentPage.jsx`
  - `AnalyticsDashboardPage.jsx`
  - `WebsiteAppearancePage.jsx`
- Service: `frontend/src/services/adminService.js`

## Roles

| Role | Access |
|---|---|
| Admin | Full admin workspace |
| Others | Forbidden/redirected from admin workspace |

## Business Rules

1. Admin is the governance role for platform-wide oversight.
2. Admin pages may aggregate data from multiple modules, but domain state changes should stay in owning services.
3. Admin can manage public content and appearance.
4. Admin can inspect operational health and traceability state.

## Security Rules

1. Admin routes must be guarded by `ROLES.ADMIN`.
2. Non-admin users must not render admin control center content.
3. Admin actions must avoid leaking sensitive secrets or credentials.

## Tests and Verification

- `AppRoutes.test.jsx` validates admin route access and farm-user denial.
- Build/test should remain green after admin navigation changes.

## Known Gaps

- Expand backend admin authorization tests when adding new admin endpoints.
