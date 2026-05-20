---
title: Module - Product
ids: []
status: draft
last-reviewed: 2026-05-19
language: bilingual
depends-on: [common]
---

# Product

## Purpose

Product module owns catalog data, product categories, product descriptions, display status, and catalog data-quality oversight for admin.

## Owns

- **R-\***: pending - `R-ADM-040` (admin monitors registered products and manages categories/descriptions)
- **BR-\***: pending Stage 4 - `BR-PRD-*`
- **STM-\***: none

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/product/`
- **Controllers:** `ProductManagementController` (`/api/v1`)
- **Frontend pages:** `AdminProductsPage.jsx`

## Depends-on

- common

## API surface

- pending Stage 5 - product/category endpoints

## Tests

- pending - admin product management tests

## UI notes

- 2026-05-19: Admin product page exposes only product catalog and category governance. It shows incomplete products when name/code/description/category data is missing so admin can correct catalog accuracy.

## Open gaps

- pending - product validation rules if catalog governance expands
