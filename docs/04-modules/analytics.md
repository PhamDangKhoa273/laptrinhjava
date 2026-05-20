---
title: Module — Analytics
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [common]
---

# Analytics

## Purpose

Analytics module sở hữu operational dashboards và reporting summaries cho admin và role dashboards. Discovery/search được tách sang `discovery` module riêng.

## Owns

- **R-\***: pending — admin analytics requirements (subset of R-ADM-*)
- **BR-\***: pending Stage 4 — `BR-ANL-*`
- **STM-\***: none

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/analytics/`
- **Related modules called:** listing, product, order, shipment, farm, retailer
- **Frontend pages:** `AnalyticsDashboardPage.jsx`
- **Frontend service:** `analyticsService.js`

## Depends-on

- common

## API surface

- pending Stage 5 — analytics endpoints (out of scope, defer to `docs-openapi-completion`)

## Tests

- pending — backend aggregation tests khi query logic thay đổi

## Open gaps

- pending — metric definitions nếu analytics trở thành part of grading/reporting criteria
