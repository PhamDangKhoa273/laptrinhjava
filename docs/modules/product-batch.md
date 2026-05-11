# Product and Batch Module

## Purpose

The Product/Batch module owns catalog data, product categories, products, packages/batches,
QR trace links, and batch lifecycle data used by farms, retailers, admin, and public trace.

## Backend Ownership

- Packages: `modules/product`, `modules/batch`
- Related packages: `modules/farm`, `modules/listing`, `modules/vechain`, `modules/season`

## Frontend Ownership

- Admin products page: `AdminProductsPage.jsx`
- Batch detail page: `BatchDetailPage.jsx`
- Farm packages/batches route: `/farm/packages`
- Product/listing pages: `PublicMarketplacePage.jsx`, `ListingDetailPage.jsx`
- Styles: `batch-detail.css`, farm/admin workspace CSS

## Roles

| Role | Access |
|---|---|
| Admin | Catalog/product/batch oversight |
| Farm | Farm-owned batch/package management |
| Retailer | Product/listing discovery |
| Guest/Public | Public product/listing visibility |

## Business Rules

1. Product and category data define marketplace catalog structure.
2. Batch/package data represents traceable production units.
3. Farm-created batch data should connect to seasons, QR, listing, and traceability flows.
4. Public batch detail must expose only safe trace data.
5. Admin product management can oversee product/category/batch records.
6. Marketplace filters and listing cards must be generated from backend product/category/batch/listing data; frontend pages must not add static sample categories or products.

## Security Rules

1. Farm batch changes must respect farm ownership.
2. Admin-only catalog governance must not be exposed to non-admin roles.
3. Public batch/listing pages must avoid private operational fields.

## Tests and Verification

- Verify admin product route/build after product page changes.
- Add backend service tests for batch lifecycle and ownership when business rules change.

## Known Gaps

- Maintain a status transition matrix if batch statuses become more complex.
