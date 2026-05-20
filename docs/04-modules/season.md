---
title: Module — Season
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [farm, batch, vechain, iot, common]
---

# Season

## Purpose

Season module sở hữu farming seasons, cultivation process timelines, và season export workflows kết nối farm production records với traceability.

## Owns

- **R-\***: pending — `R-FRM-060..120` (xem/tạo/cập nhật/xuất mùa vụ + tạo QR)
- **BR-\***: pending Stage 4 — `BR-SEA-010` (Season create với farm owner reference + blockchain commit job)
- **STM-\***: pending Stage 4 (S4.T3) — `STM-SEA-T*`

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/season/`
- **Controllers:** `SeasonController` (`/api/v1/seasons`), `SeasonExportController` (`/api/v1/seasons`), `FarmingProcessController` (`/api/v1/processes`)
- **Frontend routes:** `/farm/seasons`, `/farm/export-qr`
- **Frontend areas:** trong `FarmWorkspacePage.jsx` và `farmWorkspace/`

## Depends-on

- farm, batch, vechain, iot, common

## API surface

- pending Stage 5 — season CRUD + export endpoints

## Tests

- pending — season creation/update/export rules tests
- pending — blockchain commit failure handling tests

## Open gaps

- pending — season status lifecycle exact enum khi finalized
