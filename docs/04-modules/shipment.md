---
title: Module — Shipment
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [order, logistics, farm, retailer, media, common]
---

# Shipment

## Purpose

Shipment module sở hữu shipment lifecycle (create → assign → pickup → in-transit → delivered → confirmed), proof events, handover records, và driver execution workflows.

## Owns

- **R-\***: pending Stage 3 (S3.T5) — `R-DRV-010..060` (driver execution)
- **BR-\***: `BR-SHP-010..110` (referenced trong design D11; tăng phạm vi 2026-05-16 để add dispute/reject/escalation rules từ codebase)
- **STM-\***: `STM-SHP-T01..T12` (worked example trong design D11; mở rộng 2026-05-16 để add T08–T12 dispute/reject/escalation branches)

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/shipment/`
- **Controllers:** `ShipmentController` (`/api/v1/shipments`)
- **Frontend routes (driver):**
  - `/dashboard/driver`
  - `/driver/qr`
  - `/driver/pickup`
  - `/driver/checkpoint`
  - `/driver/handover`
  - `/driver/report`
  - `/driver/mobile`
  - `/driver/proof`
- **Frontend pages:** `DriverWorkspacePage.jsx`, `DriverMobilePage.jsx`
- Driver workspace là mobile-first, reuse cùng mobile shell/card language across driver routes.

## UI notes

- 2026-05-19: Driver mobile UI uses a compact app shell with clean header, shipment summary, sticky action tabs, route/progress cards, QR scan, pickup/checkpoint/handover, and report views aligned to `R-DRV-010..060`.
- 2026-05-19: Driver mobile routes use Vietnamese-only labels and a tightened action-card layout so trip, QR, action, and report views remain readable on narrow screens.
- 2026-05-19: Driver checkpoint advances an assigned driver's shipment from `PICKED_UP` to `IN_TRANSIT`, enabling the next `DELIVERED` handover step.
- 2026-05-19: Driver report issue types accept the mobile UI set `ACCIDENT`, `BREAKDOWN`, `DELAY`, `DAMAGED`, `THEFT`, `OTHER` plus legacy shipment types `WRONG_BATCH`, `SHORTAGE`, `ROUTE_ISSUE`.
- 2026-05-19: Shipment delivery sync writes a shipping proof marker when driver handover marks the order `DELIVERED`, so retailer delivery confirmation can upload proof and complete the receive step.
- 2026-05-19: Driver issue reports are operational notes by default; only `DAMAGED`, `SHORTAGE`, `WRONG_BATCH`, and `THEFT` move shipment/order into dispute.
- 2026-05-19: Retailer delivery confirmation transitions shipment `DELIVERED -> CONFIRMED` after a delivery proof image is submitted.
- 2026-05-20: Driver mobile treats `CONFIRMED` as a terminal completed state; pickup, checkpoint, and handover controls stay disabled after retailer confirmation.
- 2026-05-20: Driver mobile contrast was tightened for phone viewing: compact non-wrapping header, stronger card borders, darker operational text, and high-contrast route text on the summary hero.
- 2026-05-20: Driver QR scanning requires a secure browser context on real phones; frontend now uses same-origin `/api/v1` and nginx allows `camera=(self)` so the driver shell can run behind an HTTPS tunnel without mixed-content or permissions-policy blocking.
- 2026-05-20: Login normalizes copy/paste password whitespace and redirects authenticated drivers directly to their RBAC dashboard route.
- 2026-05-20: Frontend nginx strips the browser `Origin` header when proxying same-origin `/api/*` calls to backend, preventing temporary HTTPS tunnel hosts from tripping backend CORS during driver login.
- 2026-05-20: Driver QR scan now validates scanned trace/batch/shipment codes against the driver's assigned shipment list before showing route details, so public marketplace QR codes no longer appear as successful driver scans unless they belong to an assigned shipment (`R-DRV-030`).
- 2026-05-20: Driver QR matching accepts same-origin/public trace URLs, `/trace/<code>` paths, QR URL fields, trace codes, batch codes, batch ids, and shipment ids. Selecting a shipment is optimistic so tapping an assigned trip updates immediately while detail refresh runs in the background.
- 2026-05-20: Driver execution flow requires product QR match before pickup at farm, then requires delivery proof image before driver handover marks the shipment `DELIVERED` (`R-DRV-030`, `R-DRV-050`).
- 2026-05-21: Shipping Manager sidebar uses explicit icons per menu item instead of the generic shipping icon, and completed-delivery views count both `DELIVERED` and retailer-confirmed `CONFIRMED` shipments as completed.
- 2026-05-21: Driver handover proof selected from a phone camera is compressed client-side before upload; frontend nginx allows up to 8 MB so camera photos do not fail before backend validation (`BR-SHP-050`).
- 2026-05-21: Driver shipping-proof authorization accepts any shipment on the order assigned to the current driver, so historical cancelled shipments on the same order do not make proof upload fail with a non-unique order lookup (`BR-SHP-050`).

## Depends-on

- order, logistics, farm, retailer, media, common

## API surface

- pending Stage 5 (S5.T4):
  - `API-SHM-001` `POST /api/v1/shipments` (`shipmentCreate`)
  - `API-SHM-002` `POST /api/v1/shipments/{id}/assign` (`shipmentAssign`)
  - `API-SHM-003` `PATCH /api/v1/shipments/{id}/status` (`shipmentUpdateStatus`)

## Tests

- `AppRoutes.test.jsx` — driver workspace access
- pending — shipment status transition tests

## Open gaps

- pending — backend shipment status transition exhaustive tests
