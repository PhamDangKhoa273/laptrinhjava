---
title: Module — Traceability
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [vechain, iot, batch, season, listing, shipment, common]
---

# Traceability

## Purpose

Traceability module là cross-cutting facade cho proof of origin: liên kết farm → batch → season → listing → order → shipment events qua VeChainThor proofs và IoT evidence. Public trace lookup phục vụ guest/retailer.

## Owns

- **R-\***: pending — `R-RTL-060` (quét QR truy xuất), `R-DRV-030` (quét QR khi tới farm), public trace endpoints
- **BR-\***: pending Stage 4 — `BR-TRC-*`
- **STM-\***: none

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/traceability/` (nếu tồn tại) hoặc cross-cutting facade qua vechain + batch + season + listing + shipment modules
- **Frontend pages:** `PublicTracePage.jsx`, related farm blockchain/export/IOT routes
- **Frontend services:** `phase3Service.js` (workflow/business services khi fetch trace data)

## Depends-on

- vechain, iot, batch, season, listing, shipment, common

## API surface

- pending Stage 5 — public trace endpoints

## Tests

- pending — public trace data redaction tests (no private operational fields)
- pending — QR scan round-trip tests

## Open gaps

- pending — public trace media policy nếu media-rich trace mở rộng
## Change notes

- 2026-05-21: Public trace lookups use Spring cache (`publicTrace`) so repeated QR/product trace reads can be served from Redis in staging/prod (`SPRING_CACHE_TYPE=redis`) instead of hitting DB/blockchain-adjacent services on every scan.
