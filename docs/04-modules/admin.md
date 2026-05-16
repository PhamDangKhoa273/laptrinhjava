---
title: Module — Admin
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [user, farm, retailer, logistics, product, content, analytics, vechain, subscription]
---

# Admin

## Purpose

Admin module sở hữu các luồng quản trị nền tảng: control center, oversight tài khoản, vận hành, farm, retailer, logistics, packages, products, blockchain trace oversight, content, analytics, và website appearance administration.

## Owns

- **R-\***: pending Stage 3 (S3.T2) — sẽ điền `R-ADM-010..050`
- **BR-\***: pending Stage 4 (S4.T6) — `BR-ADM-*`, `BR-FRMAPP-*`
- **STM-\***: pending Stage 4 (S4.T4) — `STM-FRMAPP-T*`

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/admin/`
- **Cross-module calls:** user, farm, retailer, logistics, product, content, analytics, blockchain modules
- **Frontend pages:**
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
- **Frontend service:** `frontend/src/services/adminService.js`

## Depends-on

- user, farm, retailer, logistics, product, content, analytics, vechain, subscription

## API surface

- pending Stage 5 (S5.T4) — `API-ADM-001` (admin dashboard summary placeholder), additional endpoints

## Tests

- `AppRoutes.test.jsx` — admin route access + farm-user denial
- pending: backend admin authorization tests per R-ADM-*

## Open gaps

- [`GAP-001`](../09-governance/gap-register.md) — Admin smart-contract deploy mismatch (Brief says "deploy", code says "validate only")
