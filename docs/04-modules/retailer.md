---
title: Module — Retailer
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [listing, order, contract, shipment, product, vechain, common]
---

# Retailer

## Purpose

Retailer module sở hữu các luồng nghiệp vụ phía mua: retailer profile, marketplace product discovery, QR trace, order creation, deposit, order history, shipping confirmation, farm messages, và reports.

## Owns

- **R-\***: pending Stage 3 (S3.T4) — sẽ điền `R-RTL-010..190` (19 IDs)
- **BR-\***: pending Stage 4 — `BR-RTL-*`
- **STM-\***: none owned directly (Order STM owned by order module)

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/retailer/`
- **Frontend routes:**
  - `/dashboard/retailer`
  - `/retailer/workspace`
  - `/retailer/profile`
  - `/retailer/marketplace`
  - `/retailer/trace`
  - `/retailer/orders`
  - `/retailer/deposit`
  - `/retailer/history`
  - `/retailer/shipping`
  - `/retailer/messages`
  - `/retailer/reports`
  - `/retailer/contracts`
- **Frontend pages:**
  - `RetailerWorkspacePage.jsx`
  - `retailerWorkspace/RetailerWorkspaceShell.jsx`
  - `RetailerOrderWorkflowPage.jsx`
- **Frontend services:** `businessService.js`, `listingService.js`, `contractService.js`, `workflowService.js`

## Depends-on

- listing, order, contract, shipment, product, vechain, common

## API surface

- pending Stage 5 — `API-RTL-001` (retailer listings browse placeholder)

## Tests

- `AppRoutes.test.jsx` — retailer route access + shipping route denial

## Open gaps

- pending — backend tests cho retailer ownership và order access boundaries
