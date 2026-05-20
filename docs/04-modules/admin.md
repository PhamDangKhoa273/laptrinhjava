---
title: Module - Admin
ids: []
status: draft
last-reviewed: 2026-05-19
language: bilingual
depends-on: [user, farm, product, vechain]
---

# Admin

## Purpose

Admin module owns platform governance for the brief-aligned admin workspace:

- Admin account CRUD, role assignment, and permission oversight.
- Farm registration review: view, approve, reject, suspend, reinstate, revoke.
- Farm detail oversight: certification, contact information, and location.
- Product catalog oversight: product categories, descriptions, display status, and data accuracy.
- Smart-contract / blockchain trace governance for transparent and immutable provenance data.

## Owns

- **R-\***: pending Stage 3 (S3.T2) - `R-ADM-010..050`
- **BR-\***: `BR-USR-020`, `BR-FRMAPP-020`, `BR-FRMAPP-030`, `BR-FRMAPP-040`, `BR-FRMAPP-050`, `BR-FRMAPP-060`, `BR-VCH-010`, `BR-VCH-020`
- **STM-\***: pending Stage 4 (S4.T4) - `STM-FRMAPP-T*`

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/admin/`
- **Cross-module calls:** user, farm, product, vechain/traceability
- **Frontend pages:**
  - `AdminControlCenterPage.jsx`
  - `AdminUsersPage.jsx`
  - `AdminFarmsPage.jsx`
  - `AdminProductsPage.jsx`
  - `AdminBlockchainTracePage.jsx`
- **Frontend service:** `frontend/src/services/adminService.js`

## Depends-on

- user, farm, product, vechain

## API surface

- pending Stage 5 (S5.T4) - `API-ADM-001` (admin dashboard summary placeholder), additional endpoints

## Tests

- `AppRoutes.test.jsx` - admin route access + farm-user denial
- pending: backend admin authorization tests per R-ADM-*

## UI notes

- 2026-05-19: Admin workspace is limited to five brief-aligned areas: overview, admin accounts, farms, products, and blockchain.
- 2026-05-19: Admin sidebar is trimmed to those five routes. Legacy operations, retailer, logistics, packages, content, analytics, and appearance screens are not part of the primary admin workspace.
- 2026-05-19: `frontend/src/admin-clean.css` is imported last and provides flat SaaS surfaces, compact tables, restrained spacing, and removal of legacy glass/gradient treatment.
- 2026-05-19: `AdminProductsPage.jsx` manages only product catalog and categories. Batch QR, batch verification, and trace operations live under blockchain/trace governance instead of product catalog oversight.
- 2026-05-19: `AdminProductsPage.jsx` highlights products missing code, description, or category so admin can correct catalog data quality.
- 2026-05-21: Admin product governance is monitoring/normalization only for Farm-registered products; the admin UI no longer presents "create product" as an admin crop-production action.
- 2026-05-21: Admin product governance separates Farm listing oversight from the small catalog baseline. `/dashboard/admin/products` now defaults to all Farm-created listings, while the catalog tab is only normalization metadata.
- 2026-05-21: Pending Farm listings can be approved or rejected directly inside `/dashboard/admin/products`, so the product oversight count and action are in the same workflow.
- 2026-05-19: `AdminBlockchainTracePage.jsx` exposes validate, deploy, update, and manage actions for smart-contract governance and shows trace verification evidence.
- 2026-05-19: Product deletion soft-deletes catalog products so historical seasons/batches keep traceability.
- 2026-05-19: `AdminControlCenterPage.jsx` includes an operational signal band for pending farm review, catalog oversight, and blockchain readiness while staying limited to the five admin brief areas.

## Open gaps

- [`GAP-001`](../09-governance/gap-register.md) - real production smart-contract deploy still needs KMS/Vault release-pipeline decision.
