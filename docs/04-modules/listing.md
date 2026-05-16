---
title: Module — Listing
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [product, farm, batch, common]
---

# Listing

## Purpose

Listing module sở hữu marketplace listings — kết nối farm-owned products/batches với marketplace discovery.

## Owns

- **R-\***: pending — `R-FRM-120` (đăng ký đưa sản phẩm lên sàn), `R-FRM-130` (xem đăng ký)
- **BR-\***: pending Stage 4 — `BR-LST-*`
- **STM-\***: none

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/listing/`
- **Controllers:** `ProductListingController` (`/api/v1/listings`)
- **Frontend pages:** `ListingDetailPage.jsx`, `PublicMarketplacePage.jsx`
- **Frontend services:** `listingService.js`

## Depends-on

- product, farm, batch, common

## API surface

- pending Stage 5 — listing CRUD endpoints

## Tests

- pending — listing visibility (public vs authenticated) tests

## Open gaps

- pending — listing approval workflow nếu admin oversight cần thiết
