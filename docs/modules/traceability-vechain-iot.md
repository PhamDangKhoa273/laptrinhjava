# Traceability, VeChain, and IoT Module

## Purpose

This module group owns blockchain trace proof, VeChain integration, IoT evidence, public
trace lookup, and traceability continuity across farm, batch, listing, order, and shipment data.

## Backend Ownership

- Packages:
  - `modules/vechain`
  - `modules/iot`
- Related modules: `batch`, `season`, `farm`, `listing`, `shipment`
- Supporting docs: `docs/BLOCKCHAIN_ARCHITECTURE.md`, local blockchain demo docs

## Frontend Ownership

- Public trace page: `PublicTracePage.jsx`
- Admin blockchain trace page: `AdminBlockchainTracePage.jsx`
- Batch detail page: `BatchDetailPage.jsx`
- Farm blockchain/export/IOT routes
- Services: `phase3Service.js`, workflow/business services where trace data is fetched

## Roles

| Role | Access |
|---|---|
| Admin | Trace oversight and blockchain operations view |
| Farm | Create/export trace evidence for farm production |
| Retailer | Trace purchased/listed products |
| Driver/Shipping | Attach logistics proof where applicable |
| Guest/Public | Public trace lookup |

## Business Rules

1. Traceability links production, batch, listing, order, and shipment events.
2. Blockchain proof records evidence, but application state remains validated by backend rules.
3. IoT events support evidence and monitoring but should be validated before trust.
4. Public trace output must be stable and safe to expose.

## Security Rules

1. Private keys and blockchain credentials must be environment-only.
2. Public trace cannot expose internal secrets, private operational notes, or unrelated user data.
3. IoT ingestion should validate payloads and avoid trusting unsigned/unverified input by default.

## Tests and Verification

- Verify public trace and admin blockchain pages after integration changes.
- Use existing blockchain/IOT benchmark docs for non-functional evidence.

## Known Gaps

- Document exact VeChain transaction lifecycle when production integration is finalized.
