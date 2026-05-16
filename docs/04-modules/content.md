---
title: Module — Content
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [media, common]
---

# Content

## Purpose

Content module sở hữu public announcements, education content, và website appearance assets/settings. Media uploads tách sang `media` module riêng.

## Owns

- **R-\***: pending — `R-GST-030` (educational content access)
- **BR-\***: pending Stage 4 — `BR-CNT-*`
- **STM-\***: none

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/content/`
- **Frontend pages:** `AdminContentPage.jsx`, `PublicAnnouncementsPage.jsx`, `WebsiteAppearancePage.jsx`
- **Sanitization:** `announcementSanitizer` bundle/source

## Depends-on

- media, common

## API surface

- pending Stage 5 — content endpoints

## Tests

- pending — sanitizer tests khi rich-text/HTML handling thay đổi
- pending — public announcement render safety tests

## Open gaps

- pending — content moderation/draft-publish workflow nếu mở rộng
