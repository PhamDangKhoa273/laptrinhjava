# Farm Module

## Purpose

The Farm module owns farm-facing production workflows: farm profile, packages/batches,
seasons, blockchain trace actions, QR export, marketplace publishing, contracts,
shipping coordination, IoT, and reports.

## Backend Ownership

- Package: `backend/src/main/java/com/bicap/modules/farm`
- Related modules: `batch`, `season`, `listing`, `contract`, `shipment`, `iot`, `vechain`

## Frontend Ownership

- Routes:
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
- Pages:
  - `FarmWorkspacePage.jsx`
  - `farmWorkspace/FarmWorkspaceShell.jsx`
  - `FarmWorkflowPage.jsx`
  - `FarmPhase3Page.jsx`
- Services: `phase3Service.js`, `workflowService.js`, `businessService.js`

## Roles

| Role | Access |
|---|---|
| Farm | Farm workspace and farm-owned workflows |
| Admin | Oversight via admin pages |
| Others | No direct farm workspace access |

## Business Rules

1. Farm users work on farm-owned production data.
2. Batches/packages and seasons form the production traceability base.
3. Farm marketplace publishing should preserve trace links to batch/package data.
4. Farm shipping coordination must connect to shipment/order workflows.
5. Farm IoT and blockchain actions support traceability evidence.
6. Local demo data for farm workflows should include farm profiles, seasons, batches, QR codes, and approved listings so marketplace behavior is driven by real database rows.

## Security Rules

1. Farm workspace routes require `ROLES.FARM`.
2. Farm-owned resources should be isolated from other farms.
3. Admin oversight should not weaken ownership checks in service logic.

## Tests and Verification

- `FarmServiceTests.java` covers farm service behavior.
- `AppRoutes.test.jsx` verifies farm workspace route availability.

## Known Gaps

- Add explicit ownership-isolation tests for every farm-owned resource if not already covered.
