---
title: Module - Common (Cross-cutting Infrastructure)
ids: []
status: draft
last-reviewed: 2026-05-18
language: bilingual
depends-on: []
---

# Common (Cross-cutting Infrastructure)

## Purpose

Common module owns cross-module infrastructure: notifications, audit logging, exception handling, rate limiting, CORS, JWT filters, security context, observability/actuator, and response envelope.

## Owns

- **R-***: shared notifications and infrastructure behavior referenced by farm, retailer, driver, shipping-manager, and admin requirements.
- **BR-***: `BR-AUT-*` for cross-cutting auth; notification permission rules are enforced in code until formal `BR-CMN-*` IDs are added.
- **STM-***: none

## Implements

- **Backend packages:** `backend/src/main/java/com/bicap/modules/common/` for notifications, audit logs, and announcements.
- **Backend core:** `backend/src/main/java/com/bicap/core/` for config, security, exceptions, rate limits, JWT, and observability.
- **Frontend areas:** API client (`services/api.js`), error handling, notifications UI.

## Depends-on

- none; common is the bottom layer.

## API Surface

- `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus` - operations endpoints.
- `POST /api/v1/notifications` - create user/role notification. Target permission supports `ORDER`, `CONTRACT`, and `LISTING`; `LISTING` allows the farm owner to notify admin for listing review and admin to notify the listing owner.
- `GET /api/v1/notifications/me` - list notifications for the current user and roles.
- `PATCH /api/v1/notifications/{id}/read` - mark a visible notification as read.

## Tests

- Backend targeted tests should cover notification target permission when notification behavior changes.
- Frontend audit must report zero moderate+ vulnerabilities.

## Open Gaps

- Add formal `BR-CMN-*` IDs for notification permission rules.
- Add a formal endpoint permission matrix if the common API surface grows.
