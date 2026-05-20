---
title: Module — Subscription
ids: []
status: draft
last-reviewed: 2026-05-18
language: bilingual
depends-on: [farm, common]
---

# Subscription

## Purpose

Subscription module sở hữu service packages, farm subscriptions, subscription payment records, và package-based platform access/capabilities.

## Owns

- **R-\***: pending — `R-FRM-040` (mua gói dịch vụ), `R-FRM-050` (thanh toán)
- **BR-\***: `BR-SUB-010`, `BR-SUB-020`, `BR-SUB-060`, `BR-SUB-070`, `BR-SUB-075`, `BR-SUB-080`
- **STM-\***: `STM-SUB-T01..T07`

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/subscription/`
- **Key concepts:** `ServicePackage`, `FarmSubscription`, `SubscriptionPayment`
- **Controllers:** `ServicePackageController` (`/api/v1/packages`), `FarmSubscriptionController` (`/api/v1/farm-subscriptions`), `SubscriptionPaymentController` (`/api/v1/subscription-payments`)
- **Frontend pages:** `AdminPackagesPage.jsx`, `FarmSubscriptionPage.jsx`
- **Frontend services:** `adminService.js`, `businessService.js`, `subscriptionService.js`

## Depends-on

- farm, common

## API surface

- `POST /api/v1/farm-subscriptions` tạo subscription pending cho farm hiện tại
- Nếu farm đang có subscription còn hiệu lực (`ACTIVE`, `EXPIRING_SOON`, `GRACE_PERIOD` và chưa qua `endDate`), backend queue subscription mới với `startDate = latestEffectiveEndDate + 1 day`
- Payment callback / admin override mới chuyển subscription pending sang trạng thái usable

## Tests

- backend: payment callback activation tests, queued purchase tests (`FarmSubscriptionServiceTests`)

## Open gaps

- pending — payment provider integration nếu external payment thêm vào
- terminology gap: code currently persist `PENDING` cho trạng thái vừa mua, trong khi state-machine docs mô tả cùng phase là `PENDING_PAYMENT`
