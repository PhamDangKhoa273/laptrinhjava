---
title: Module — Discovery
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [listing, product, content, common]
---

# Discovery

## Purpose

Discovery module sở hữu marketplace search, filter, và discovery support cho retailer, guest, và public users.

## Owns

- **R-\***: pending — `R-GST-020` (search/filter), portion of `R-RTL-040` (search nông sản)
- **BR-\***: pending Stage 4 — `BR-DSC-*`
- **STM-\***: none

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/discovery/`
- **Frontend areas:** marketplace search trong public/guest/retailer pages
- **Frontend services:** `searchService.js`

## Depends-on

- listing, product, content, common

## API surface

- pending Stage 5 — search endpoints

## Tests

- pending — public search must not leak private data tests

## Open gaps

- pending — filter taxonomy formal definition (origin, certification, availability per Brief)
