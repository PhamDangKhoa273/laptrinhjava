---
title: Module - VeChain
ids: []
status: draft
last-reviewed: 2026-05-19
language: bilingual
depends-on: [common]
---

# VeChain

## Purpose

VeChain module owns integration with VeChainThor: signing transactions, persisting blockchain transaction metadata, retry orchestration, proof commit/track operations, and admin smart-contract governance.

## Owns

- **R-\***: shared (R-FRM blockchain bullets, R-ADM-050 smart contract management)
- **BR-\***: `BR-VCH-010`, `BR-VCH-020`
- **STM-\***: none. Blockchain transaction status is implementation lifecycle metadata, not a domain state machine.

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/vechain/` and governance support in `backend/src/main/java/com/bicap/modules/batch/`
- **Controllers:** `BlockchainGovernanceController` (`/api/v1/blockchain/governance`), `AdminGovernanceController` (`/api/v1/admin/governance`)
- **Key services:** `VeChainProofService`, `VeChainTraceabilityProofService`, `BlockchainGovernanceService`
- **Frontend pages:** `AdminBlockchainTracePage.jsx`

## Depends-on

- common

## API surface

- `GET /api/v1/blockchain/governance/config`
- `GET /api/v1/blockchain/governance/transactions`
- `POST /api/v1/blockchain/governance/deploy`
- `POST /api/v1/blockchain/governance/transactions/{entityType}/{entityId}/retry`

## Tests

- `BlockchainGovernanceServiceTests`
- pending - end-to-end VeChain transaction lifecycle tests

## UI notes

- 2026-05-19: Admin blockchain page exposes smart-contract governance actions: validate, deploy, update, and manage. These actions record governance evidence and require write readiness for on-chain governance operations.
- 2026-05-19: Governance retry is limited to records with `governanceStatus = FAILED`. Missing/disabled blockchain configuration is recorded as `CONFIG_BLOCKED`, not as a retryable failed transaction.
- 2026-05-21: Season-export VeChain commits are queued as `PENDING` DB transactions and processed by `VeChainTxWorker` with configurable concurrency (`vechain.thor.worker-concurrency`) and batch size (`vechain.thor.worker-batch-size`). Requests persist business data first; chain submission happens async with retry/idempotent payload hash metadata.
- 2026-05-21: The `blockchain_transactions.governance_status` database check includes the worker claim state `PROCESSING`, matching `BlockchainGovernanceStatus` and preventing queue retries from violating schema constraints.

## Open gaps

- [`GAP-001`](../09-governance/gap-register.md) - real production contract deployment still needs final KMS/Vault release-pipeline decision.
