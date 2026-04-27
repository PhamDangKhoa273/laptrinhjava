# REQUIREMENT TRACEABILITY

## Rule
Every requirement should map to:
- API
- UI
- test
- screenshot/evidence

If one of those is missing, mark the requirement as PARTIAL, not DONE.

## Traceability matrix

### Auth / account
- API: `/api/v1/auth/*`, `/api/v1/users/*`
- UI: auth pages, protected routes, profile/workspace pages
- Test: backend auth/user tests
- Evidence: build/test outputs, screenshots if available

### Farm management
- API: farm, subscription, package, season, batch, listing, media routes
- UI: farm workspace pages
- Test: backend service/controller tests
- Evidence: build outputs, audit docs, screenshots if available

### Retailer flow
- API: retailer, listing search, order, payment, shipment routes
- UI: marketplace, listing detail, retailer workspace
- Test: backend order/shipment/listing tests
- Evidence: build outputs, screenshots if available

### Shipping / driver flow
- API: shipment, IoT, report, notification routes
- UI: shipping workspace, driver workspace/mobile route
- Test: shipment, IoT, notification tests
- Evidence: build outputs, screenshots if available

### Admin flow
- API: user, role, farm approval, governance, content, category routes
- UI: admin workspace pages
- Test: backend admin/service tests
- Evidence: build outputs, screenshots if available

### Guest/public flow
- API: public listing search, announcement feed, trace/public pages
- UI: guest marketplace and public pages
- Test: backend/public search and announcement tests
- Evidence: build outputs, screenshots if available

### Analytics / forecasting
- API: analytics dashboard/forecast routes
- UI: analytics dashboard page
- Test: analytics service tests
- Evidence: build outputs, screenshots if available

### Dispute / exception flow
- API: shipment reject/escalate/report routes
- UI: shipping workspace status/actions
- Test: shipment service tests covering shortage, damaged, wrong batch, reject, escalate, QR mismatch
- Evidence: backend test output, frontend build output, screenshots if captured

## Known honesty gaps to keep current
- Do not claim native mobile app unless a native build is proven.
- Do not claim fully automatic blockchain deployment unless runtime proof exists.
- Do not claim cloud scaling or load-test proof unless artifacts exist.
