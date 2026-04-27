# Retailer Module

## Purpose

The Retailer module owns buyer-side business workflows: retailer profile, marketplace
product discovery, QR trace, order creation, deposit, order history, shipping confirmation,
farm messages, and reports.

## Backend Ownership

- Package: `backend/src/main/java/com/bicap/modules/retailer`
- Related modules: `listing`, `order`, `contract`, `shipment`, `product`, `vechain`

## Frontend Ownership

- Routes:
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
- Pages:
  - `RetailerWorkspacePage.jsx`
  - `retailerWorkspace/RetailerWorkspaceShell.jsx`
  - `RetailerOrderWorkflowPage.jsx`
- Services: `businessService.js`, `listingService.js`, `contractService.js`, `workflowService.js`

## Roles

| Role | Access |
|---|---|
| Retailer | Retailer workspace and buyer workflows |
| Admin | Retailer oversight via admin pages |
| Others | No direct retailer workspace access |

## Business Rules

1. Retailers discover products/listings before initiating orders.
2. Retailer orders should retain status/history and traceability context.
3. Deposit/payment-related UI must map to backend order/payment rules.
4. Retailers can report issues to admin.
5. Retailers can confirm shipping/handover state when workflow allows it.

## Security Rules

1. Retailer workspace routes require `ROLES.RETAILER`.
2. Retailer data must not leak to unrelated retailers.
3. Shipping manager routes must not render for retailer accounts.

## Tests and Verification

- `AppRoutes.test.jsx` verifies retailer route access and shipping route denial.

## Known Gaps

- Add backend tests for retailer ownership and order access boundaries where missing.
