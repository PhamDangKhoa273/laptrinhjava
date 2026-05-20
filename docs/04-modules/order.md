---
title: Module — Order
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [listing, retailer, farm, shipment, contract, common]
---

# Order

## Purpose

Order module sở hữu retailer purchase requests, deposit lifecycle, order status transitions, và liên kết tới listing/contract/shipment.

## Owns

- **R-\***: pending — `R-RTL-070..150` (purchase request, deposit, cancel, history)
- **BR-\***: `BR-ORD-010..110` (referenced trong design D11; tăng phạm vi 2026-05-16 để add dispute/complete/resolution rules)
- **STM-\***: `STM-ORD-T01..T12` (mở rộng 2026-05-16 để khớp `OrderService.STATUS_TRANSITIONS` thực tế: thêm SHIPPING, DELIVERED, DISPUTED, COMPLETED workflow + tách `OrderPaymentStatus` thành dimension riêng)

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/order/`
- **Controllers:** `OrderController` (`/api/v1/orders`, `/api/orders`)
- **Frontend pages:** `RetailerOrderWorkflowPage.jsx`
- **Frontend services:** `workflowService.js`, `businessService.js`

## Depends-on

- listing, retailer, farm, shipment, contract, common

## API surface

- pending Stage 5 (S5.T4):
  - `API-ORD-001` `POST /api/v1/orders` (`orderCreate`)
  - `API-ORD-002` `PATCH /api/v1/orders/{id}/status` (`orderUpdateStatus`)
  - `API-ORD-003` `POST /api/v1/orders/{id}/cancel` (`orderCancel`)
  - `API-ORD-004` `POST /api/v1/orders/{id}/deposit` (`orderDeposit`) records a deposit request; local profile may auto-confirm to `DEPOSIT_PAID`/`READY_FOR_SHIPMENT`, while non-local environments require signed gateway callback.
  - `API-ORD-005` `POST /api/v1/orders/{id}/delivery-proof/upload` stores retailer delivery proof and writes the uploaded URL back to the order before confirmation.
- Local demo profile extends pending-order reservation timeout to keep multi-role manual testing feasible; non-local default remains 30 minutes.

## Tests

- pending — order status transition tests (forbidden transitions)

## Open gaps

- pending — formal deposit refund policy nếu retailer cancel
