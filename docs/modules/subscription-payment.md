# Subscription and Payment Module

## Purpose

The Subscription/Payment module owns service packages, farm subscriptions, subscription
payment records, and package-based platform access/capabilities.

## Backend Ownership

- Package: `backend/src/main/java/com/bicap/modules/subscription`
- Key concepts:
  - `ServicePackage`
  - `FarmSubscription`
  - `SubscriptionPayment`

## Frontend Ownership

- Admin packages page: `AdminPackagesPage.jsx`
- Farm package/subscription-related workspace areas
- Services: `adminService.js`, `businessService.js` where package/payment APIs are used

## Roles

| Role | Access |
|---|---|
| Admin | Manage service packages and payment/subscription oversight |
| Farm | View/use subscription package context |
| Others | No direct package administration |

## Business Rules

1. Service packages define platform subscription offerings.
2. Farm subscriptions attach a farm to a selected service package.
3. Subscription payments record payment lifecycle and evidence.
4. Admin can govern package definitions and subscription status.

## Security Rules

1. Package administration is admin-only.
2. Farm subscription data should be scoped to the owning farm unless admin access is used.
3. Payment records should avoid exposing sensitive payment details.

## Tests and Verification

- Add service/controller tests for package CRUD and subscription payment transitions when changed.
- Verify admin package page after API changes.

## Known Gaps

- Document exact payment provider integration if external payment is added.
