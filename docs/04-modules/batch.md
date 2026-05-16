---
title: Module — Batch
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [product, season, vechain, common]
---

# Batch

## Purpose

Batch module sở hữu traceable production units (batches/packages), QR trace links, và lifecycle data dùng bởi farm, retailer, admin, public trace.

## Owns

- **R-\***: pending — portion of farm batch operations (link với R-FRM-*)
- **BR-\***: pending Stage 4 — `BR-BAT-*`
- **STM-\***: pending — batch lifecycle nếu cần (defer trừ khi statuses mở rộng)

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/batch/`
- **Controllers:** `BlockchainGovernanceController` (related), batch-specific controllers
- **Frontend pages:** `BatchDetailPage.jsx`
- **Frontend route:** `/farm/packages`

## Depends-on

- product, season, vechain, common

## API surface

- pending Stage 5 — batch endpoints

## Tests

- pending — batch lifecycle và ownership tests

## Open gaps

- pending — status transition matrix nếu batch statuses trở nên phức tạp
