# Listing, Order, and Contract Module

## Purpose

This module group owns marketplace listings, retailer orders, farm-retailer contracts,
and dispute/order workflow boundaries.

## Backend Ownership

- Packages:
  - `modules/listing`
  - `modules/order`
  - `modules/contract`
- Related packages: `modules/farm`, `modules/retailer`, `modules/shipment`, `modules/product`

## Frontend Ownership

- `ListingDetailPage.jsx`
- `RetailerOrderWorkflowPage.jsx`
- `RetailerWorkspacePage.jsx`
- Farm contracts route: `/farm/contracts`
- Retailer orders/history/deposit routes
- Services: `listingService.js`, `contractService.js`, `workflowService.js`, `businessService.js`

## Roles

| Role | Access |
|---|---|
| Farm | Publish/manage farm-side listing/contract context |
| Retailer | Browse listings, create orders, track order history |
| Admin | Operational oversight and dispute visibility |
| Guest/Public | Browse public listing detail where exposed |

## Business Rules

1. Listings connect farm-owned products/batches to marketplace discovery.
2. Retailers initiate order workflows from listings/product context.
3. Orders must preserve status and history.
4. Contracts define farm-retailer commitments where the workflow requires it.
5. Dispute/report windows must be enforced at service level.

## Security Rules

1. Listing writes require farm/admin authority.
2. Order access must be restricted to the owning retailer/farm/admin flow.
3. Public listing detail must not expose private contract/order state.

## Tests and Verification

- Add service tests for order status transitions and forbidden transitions.
- Verify retailer/farm routes after workflow changes.

## Known Gaps

- Maintain a formal order status transition table if statuses expand.
