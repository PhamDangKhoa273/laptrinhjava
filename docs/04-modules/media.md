---
title: Module — Media
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [common]
---

# Media

## Purpose

Media module sở hữu uploaded files, image attachments cho shipment proof và retailer delivery confirmation, và controlled upload paths.

## Owns

- **R-\***: pending — `R-RTL-160` (upload ảnh đã giao), shipment proof images
- **BR-\***: pending Stage 4 — `BR-MED-*`
- **STM-\***: none

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/media/`
- **Controllers:** `MediaController` (`/api/v1/media`)
- **Frontend service:** `mediaService.js`
- **Upload directory configuration:** `APP_MEDIA_UPLOAD_DIR` env var

## Depends-on

- common

## API surface

- pending Stage 5 — media upload/download endpoints

## Tests

- pending — upload path traversal tests, sanitization tests

## Open gaps

- pending — virus scanning / file type whitelist policy formal definition
