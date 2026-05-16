---
title: Module — Product
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [common]
---

# Product

## Purpose

Product module sở hữu catalog data, product categories, products, và mô tả sản phẩm.

## Owns

- **R-\***: pending — `R-ADM-040` (giám sát sản phẩm, quản lý danh mục)
- **BR-\***: pending Stage 4 — `BR-PRD-*`
- **STM-\***: none

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/product/`
- **Controllers:** `ProductManagementController` (`/api/v1`)
- **Frontend pages:** `AdminProductsPage.jsx`

## Depends-on

- common

## API surface

- pending Stage 5 — product/category endpoints

## Tests

- pending — admin product management tests

## Open gaps

- pending — product validation rules nếu mở rộng catalog
