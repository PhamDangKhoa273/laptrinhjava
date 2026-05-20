---
title: Module - Listing
ids: []
status: draft
last-reviewed: 2026-05-18
language: bilingual
depends-on: [product, farm, batch, common]
---

# Listing

## Purpose

Listing module owns marketplace listings, connecting farm-owned products/batches with marketplace discovery.

## Owns

- **R-***: `R-FRM-120` (register product on marketplace), `R-FRM-130` (view registrations)
- **BR-***: `BR-LST-010`, `BR-LST-020`, plus farm guards `BR-FRM-010`, `BR-FRM-020`
- **STM-***: none

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/listing/`
- **Controllers:** `ProductListingController` (`/api/v1/listings`)
- **Frontend pages:** `ListingDetailPage.jsx`, `PublicMarketplacePage.jsx`, `FarmMarketplacePage.jsx`
- **Frontend services:** `listingService.js`

## Depends-on

- product, farm, batch, common

## API Surface

- `POST /api/v1/listings` - create draft listing from a farm-owned eligible batch.
- `GET /api/v1/listings/my` - list current farm owner's listings.
- `PUT /api/v1/listings/{id}` - update current farm owner's listing.
- `POST /api/v1/listings/{id}/submit` - submit listing for admin review.
- `PATCH /api/v1/listings/registrations/{registrationId}/review` - admin review for listing registration.

## Current Behavior

- `POST /api/v1/listings` creates a draft listing only when the batch has a valid farm/owner link, approved farm, eligible harvested/completed season, active QR, remaining quantity, and an effective farm subscription (`ACTIVE`, `EXPIRING_SOON`, or `GRACE_PERIOD`) per `BR-LST-010` / `BR-FRM-020`.
- Listing quantity validation sums existing available + reserved listing quantity for the batch; a batch with no prior listings is treated as zero already listed.
- Public listing reads expose only approved active listings.
- Marketplace filter options are derived from approved active listings, including only product categories that actually have stock on the marketplace.
- Farm listing UI hides ineligible batches from the create selector and calls out expired/sold-out/no-stock batches before submit, matching backend listing eligibility.
- Farm listing UI shows the selected batch's catalog category as read-only metadata; category is owned by the product catalog, not manually typed on the listing.

## Tests

- `ProductListingServiceOwnershipTests` covers owner checks, invalid batch/farm association handling, draft visibility, and effective subscription eligibility.
- `ProductListingAndDiscoveryServiceTests` covers create/update validation and discovery search behavior.

## Open Gaps

- pending - listing approval workflow if stricter admin oversight is needed.
