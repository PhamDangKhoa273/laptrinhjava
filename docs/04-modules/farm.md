---
title: Module - Farm
ids: []
status: draft
last-reviewed: 2026-05-19
language: bilingual
depends-on: [batch, season, listing, contract, shipment, iot, vechain, subscription, common]
---

# Farm

## Purpose

Farm module owns farm profile, approval-facing farm registration data, packages/batches, seasons, blockchain trace actions, QR export, marketplace publishing, contracts, shipping coordination, IoT, and reports.

Admin can review farm registrations and manage farm profile details needed for approval: business license number/file, certification status, contact person, phone, email, address, province, and area.

## Owns

- **R-\***: pending Stage 3 (S3.T3) - `R-FRM-010..210` (21 IDs)
- **BR-\***: `BR-FRM-010`, `BR-FRM-020`, `BR-FRM-030`, `BR-FRMAPP-020`, `BR-FRMAPP-030`
- **STM-\***: pending - none owned directly (Season STM owned by season module)

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/farm/`
- **Frontend routes:**
  - `/dashboard/farm`
  - `/farm/profile`
  - `/farm/packages`
  - `/farm/seasons`
  - `/farm/blockchain`
  - `/farm/export-qr`
  - `/farm/marketplace`
  - `/farm/contracts`
  - `/farm/shipping`
  - `/farm/iot`
  - `/farm/reports`
  - `/farm/workflow`
  - `/farm/phase3`
- **Admin frontend route:** `/dashboard/admin/farms`
- **Frontend pages:**
  - `FarmWorkspacePage.jsx`
  - `farmWorkspace/FarmWorkspaceShell.jsx`
  - `FarmWorkflowPage.jsx`
  - `FarmPhase3Page.jsx`
  - `AdminFarmsPage.jsx`
- **Frontend services:** `phase3Service.js`, `workflowService.js`, `businessService.js`, `adminService.js`

## Depends-on

- batch, season, listing, contract, shipment, iot, vechain, subscription, common

## API surface

- pending Stage 5 - `API-FRM-001` (farm profile read placeholder)
- `PUT /api/v1/farms/{id}/admin` accepts farm profile update fields including contact phone/email for admin oversight.

## Tests

- `FarmServiceTests.java`
- `AppRoutes.test.jsx` - farm route access verification

## UI notes

- 2026-05-19: Admin farm page separates the registration queue from the selected farm detail panel. The detail panel exposes approval/rejection actions plus certification, license, contact, and location data.
- 2026-05-20: Farm production pages use Vietnamese text repair coverage for season, batch, and QR export labels to keep the farm workspace copy readable while legacy mojibake strings are being replaced.
- 2026-05-20: Farm batch and business pages now replace legacy mojibake copy directly. Batch lists show harvest/expiry as `YYYY-MM-DD` and mark expired lots so marketplace eligibility is clear before listing.

## Open gaps

- pending - ownership-isolation tests for every farm-owned resource
