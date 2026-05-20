---
title: Module — Retailer
ids: []
status: draft
last-reviewed: 2026-05-18
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
  - `/retailer/shipping`
  - `/retailer/notifications`
  - `/retailer/messages`
  - `/retailer/reports`
- **Frontend pages:**
  - `RetailerWorkspacePage.jsx`
    - `/retailer/trace` provides a structured QR trace console for manual trace-code/batch-ID lookup, camera QR scanning, and grouped result details for `R-RTL-060`.
    - `/retailer/orders` provides a structured order workspace for selecting orders, viewing status/detail fields, paying deposits, and cancelling requests. Local profile deposit auto-confirms to `DEPOSIT_PAID`/`READY_FOR_SHIPMENT`; non-local flows still rely on gateway callback. Legacy `/retailer/deposit` and `/retailer/history` routes redirect here.
    - `/retailer/profile` provides a structured retailer profile workspace for creating the first retailer resource for a newly registered retailer user, editing legal retailer fields, uploading the business license, updating the representative user account, changing password, and showing backend order-readiness signals.
    - `/retailer/shipping` provides a structured shipment workspace for status review, delivery proof upload, and delivery confirmation after a shipping manager creates a shipment from a `READY_FOR_SHIPMENT` order.
    - `/retailer/notifications` provides the retailer notification inbox used by the topbar bell "view all" action.
    - `/retailer/messages` provides the order-thread message form; retailer sends to farm only through an owned order target (`targetType=ORDER`).
    - `/retailer/reports` provides an admin report form with optional shipment references.
    - `/retailer/contracts` is outside the active Retailer brief and redirects to `/retailer/orders`.
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
