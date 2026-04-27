# Analytics and Discovery Module

## Purpose

The Analytics/Discovery module owns operational dashboards, reporting summaries, search,
and discovery support used by admin, retailers, guests, and other role dashboards.

## Backend Ownership

- Packages:
  - `modules/analytics`
  - `modules/discovery`
- Related modules: listing, product, order, shipment, farm, retailer

## Frontend Ownership

- Analytics page: `AnalyticsDashboardPage.jsx`
- Discovery/search services: `analyticsService.js`, `searchService.js`
- Marketplace search areas in public/guest/retailer pages

## Roles

| Role | Access |
|---|---|
| Admin | Platform analytics and operational reports |
| Retailer/Guest/Public | Discovery/search over public-safe marketplace data |
| Farm/Shipping/Driver | Role dashboard metrics where exposed |

## Business Rules

1. Analytics aggregates operational data but should not mutate domain state.
2. Discovery/search must respect public/private data boundaries.
3. Admin analytics may include platform-wide data.
4. Public discovery must expose only marketplace-safe information.

## Security Rules

1. Admin analytics require admin access.
2. Public search must not leak private farm/retailer/order/shipment data.
3. Aggregations should avoid exposing sensitive row-level data when not authorized.

## Tests and Verification

- Verify analytics dashboard build after chart/metric changes.
- Add backend aggregation tests when query logic changes.

## Known Gaps

- Document metric definitions if analytics becomes part of grading/reporting criteria.
