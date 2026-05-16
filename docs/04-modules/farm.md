---
title: Module — Farm
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [batch, season, listing, contract, shipment, iot, vechain, subscription, common]
---

# Farm

## Purpose

Farm module sở hữu các luồng sản xuất phía trang trại: farm profile, packages/batches, seasons, blockchain trace actions, QR export, marketplace publishing, contracts, shipping coordination, IoT, và reports.

## Owns

- **R-\***: pending Stage 3 (S3.T3) — sẽ điền `R-FRM-010..210` (21 IDs)
- **BR-\***: pending Stage 4 (S4.T6) — `BR-FRM-010, BR-FRM-020, BR-FRM-030` (referenced trong design D3 RBAC example)
- **STM-\***: pending — none owned directly (Season STM owned by season module)

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/farm/`
- **Frontend routes:**
  - `/dashboard/farm`
  - `/farm/profile`
  - `/farm/packages`
  - `/farm/seasons`
  - `/farm/blockchain`
  - `/farm/export-qr`
  - `/farm/marketplace`
  - `/farm/contracts`
  - `/farm/shipping`
  - `/farm/iot`
  - `/farm/reports`
  - `/farm/workflow`
  - `/farm/phase3`
- **Frontend pages:**
  - `FarmWorkspacePage.jsx`
  - `farmWorkspace/FarmWorkspaceShell.jsx`
  - `FarmWorkflowPage.jsx`
  - `FarmPhase3Page.jsx`
- **Frontend services:** `phase3Service.js`, `workflowService.js`, `businessService.js`

## Depends-on

- batch, season, listing, contract, shipment, iot, vechain, subscription, common

## API surface

- pending Stage 5 — `API-FRM-001` (farm profile read placeholder)

## Tests

- `FarmServiceTests.java`
- `AppRoutes.test.jsx` — farm route access verification

## Open gaps

- pending — ownership-isolation tests cho mọi farm-owned resource
