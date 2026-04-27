# Logistics, Shipment, and Driver Module

## Purpose

This module group owns shipping manager workflows, shipment creation/tracking, driver
assignment, vehicle/driver management, delivery proof, handover, checkpoints, and incident reports.

## Backend Ownership

- Packages:
  - `modules/logistics`
  - `modules/shipment`
- Related packages: `modules/order`, `modules/farm`, `modules/retailer`, `modules/media`

## Frontend Ownership

- Shipping manager routes:
  - `/dashboard/shipping-manager`
  - `/shipping/orders`
  - `/shipping/create`
  - `/shipping/tracking`
  - `/shipping/drivers`
  - `/shipping/vehicles`
  - `/shipping/notifications`
  - `/shipping/reports`
  - `/shipping/proof`
- Driver routes:
  - `/dashboard/driver`
  - `/driver/qr`
  - `/driver/pickup`
  - `/driver/checkpoint`
  - `/driver/handover`
  - `/driver/report`
  - `/driver/mobile`
  - `/driver/proof`
- Pages: `ShippingWorkspacePage.jsx`, `DriverWorkspacePage.jsx`, `DriverMobilePage.jsx`, `ShippingProofPage.jsx`

## Roles

| Role | Access |
|---|---|
| Shipping Manager | Shipment planning, assignment, tracking, reports |
| Driver | Assigned delivery execution workflows |
| Farm/Retailer | Shipping status/proof where relevant |
| Admin | Logistics oversight |

## Business Rules

1. Shipping managers create shipments from eligible orders.
2. Shipments can be assigned to drivers and vehicles.
3. Drivers execute pickup, checkpoint, handover, proof, and incident report workflows.
4. Proof events must remain tied to shipment/order traceability.
5. Shipping status changes must be valid for the current shipment state.

## Security Rules

1. Shipping manager routes require `ROLES.SHIPPING_MANAGER`.
2. Driver routes require `ROLES.DRIVER`.
3. Retailers must not render shipping manager workspace routes.
4. Driver actions should be restricted to assigned deliveries where supported by backend rules.

## Tests and Verification

- `AppRoutes.test.jsx` verifies shipping manager and driver workspace access.
- Runtime fallback data must be defined to avoid dashboard crashes.

## Known Gaps

- Add explicit backend shipment status transition tests where not covered.
