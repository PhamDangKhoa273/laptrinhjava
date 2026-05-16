---
title: Module — Logistics
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [shipment, common]
---

# Logistics

## Purpose

Logistics module sở hữu shipping manager workflows: tạo chuyến hàng, gán driver/vehicle, quản lý đội xe và đội tài xế, tracking, reports.

## Owns

- **R-\***: pending Stage 3 (S3.T6) — `R-SHM-010..090`
- **BR-\***: pending Stage 4 — `BR-LOG-*`
- **STM-\***: none owned directly (Shipment STM owned by shipment module)

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/logistics/`
- **Controllers:** `DriverController` (`/api/v1/drivers`), `VehicleController` (`/api/v1/vehicles`), `ShippingController` (`/api/v1/shipping`), `TrackingController` (`/api/v1/tracking`)
- **Frontend routes:**
  - `/dashboard/shipping-manager`
  - `/shipping/orders`
  - `/shipping/create`
  - `/shipping/tracking`
  - `/shipping/drivers`
  - `/shipping/vehicles`
  - `/shipping/notifications`
  - `/shipping/reports`
  - `/shipping/proof`
- **Frontend pages:** `ShippingWorkspacePage.jsx`, `ShippingProofPage.jsx`

## Depends-on

- shipment, common

## API surface

- pending Stage 5 — `API-SHM-010` (shipping manager dashboard summary placeholder)

## Tests

- `AppRoutes.test.jsx` — shipping manager route access verification
- pending — backend driver/vehicle CRUD tests

## Open gaps

- pending — driver/vehicle ownership boundary tests
