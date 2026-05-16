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
