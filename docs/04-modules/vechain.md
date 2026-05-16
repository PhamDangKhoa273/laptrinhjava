---
title: Module — VeChain
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [common]
---

# VeChain

## Purpose

VeChain module sở hữu integration với VeChainThor: signing transactions, persisting blockchain transaction metadata, retry orchestration, và proof commit/track operations.

## Owns

- **R-\***: shared (R-FRM blockchain bullets, R-ADM-050 smart contract management)
- **BR-\***: pending Stage 4 — `BR-VCH-*`
- **STM-\***: none (blockchain transaction status không phải state machine domain — nó là implementation detail của VeChain governance lifecycle, xem [`BLOCKCHAIN_ARCHITECTURE.md`](../03-architecture/component.md) sau migration)

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/vechain/`
- **Controllers:** `BlockchainGovernanceController` (`/api/v1/blockchain/governance`), `AdminGovernanceController` (`/api/v1/admin/governance`)
- **Key services:** `VeChainProofService`, `VeChainTraceabilityProofService`
- **Frontend pages:** `AdminBlockchainTracePage.jsx`

## Depends-on

- common

## API surface

- pending Stage 5 — VeChain governance endpoints (out of scope cho spec hiện tại)

## Tests

- pending — VeChain transaction lifecycle tests
- pending — retry/failure handling tests

## Open gaps

- [`GAP-001`](../09-governance/gap-register.md) — Brief Admin yêu cầu deploy/update smart contracts; hiện tại chỉ có validation/manage. Cần product decision: build deploy pipeline thật hay revise Brief.
