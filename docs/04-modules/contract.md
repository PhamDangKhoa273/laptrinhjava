---
title: Module — Contract
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [farm, retailer, order, common]
---

# Contract

## Purpose

Contract module sở hữu farm-retailer commitments, dispute/report windows, và contract status workflows.

## Owns

- **R-\***: pending — `R-FRM-150` (xem retailer đã ký hợp đồng)
- **BR-\***: pending Stage 4 — `BR-CON-*`
- **STM-\***: none owned directly

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/contract/`
- **Controllers:** `FarmRetailerContractController` (`/api/v1/contracts`)
- **Frontend services:** `contractService.js`

## Depends-on

- farm, retailer, order, common

## API surface

- pending Stage 5 — contract endpoints

## Tests

- pending — contract dispute window tests

## Open gaps

- pending — formal dispute resolution flow nếu mở rộng
