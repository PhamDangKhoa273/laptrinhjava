---
title: Module — Common (Cross-cutting Infrastructure)
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: []
---

# Common (Cross-cutting Infrastructure)

## Purpose

Common module sở hữu các infrastructure xuyên-module: notifications, audit logging, exception handling, rate limiting, CORS, JWT filters, security context, observability/actuator, response envelope.

## Owns

- **R-\***: shared (notifications xuất hiện trong R-FRM, R-RTL, R-DRV, R-SHM)
- **BR-\***: pending Stage 4 — `BR-CMN-*` (notification rules), `BR-AUT-*` (cross-cutting auth)
- **STM-\***: none

## Implements

- **Backend packages:**
  - `backend/src/main/java/com/bicap/modules/common/` — notifications, audit logs, announcements
  - `backend/src/main/java/com/bicap/core/` — config, security, exception handling
  - `backend/src/main/java/com/bicap/core/security/` — `RateLimitFilter`, JWT filters, security utils
- **Examples:**
  - `RateLimitFilter.java`
  - JWT/security configuration
  - audit log service/entity/repository
  - exception handling
  - actuator configuration
- **Frontend areas:** API client (`services/api.js`), error handling, notifications UI

## Depends-on

- (none — common is the bottom layer)

## API surface

- `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus` (operations endpoints)
- pending Stage 5 — notification endpoints

## Tests

- pending — backend security/rate-limit tests
- frontend audit must report zero moderate+ vulnerabilities

## Open gaps

- pending — formal endpoint permission matrix nếu API surface mở rộng
