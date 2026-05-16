---
title: Module — Subscription
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [farm, common]
---

# Subscription

## Purpose

Subscription module sở hữu service packages, farm subscriptions, subscription payment records, và package-based platform access/capabilities.

## Owns

- **R-\***: pending — `R-FRM-040` (mua gói dịch vụ), `R-FRM-050` (thanh toán)
- **BR-\***: pending Stage 4 — `BR-SUB-010` (Subscription expire không khóa data farm, chỉ khóa write actions)
- **STM-\***: pending Stage 4 (S4.T5) — `STM-SUB-T*`

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/subscription/`
- **Key concepts:** `ServicePackage`, `FarmSubscription`, `SubscriptionPayment`
- **Controllers:** `ServicePackageController` (`/api/v1/packages`), `FarmSubscriptionController` (`/api/v1/farm-subscriptions`), `SubscriptionPaymentController` (`/api/v1/subscription-payments`)
- **Frontend pages:** `AdminPackagesPage.jsx`
- **Frontend services:** `adminService.js`, `businessService.js`

## Depends-on

- farm, common

## API surface

- pending Stage 5 — subscription endpoints

## Tests

- pending — package CRUD và subscription payment transition tests

## Open gaps

- pending — payment provider integration nếu external payment thêm vào
