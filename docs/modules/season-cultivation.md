# Season and Cultivation Module

## Purpose

The Season/Cultivation module owns farming seasons, cultivation process timelines, and
season export workflows that connect farm production records to traceability.

## Backend Ownership

- Package: `backend/src/main/java/com/bicap/modules/season`
- Key concepts: farming season, farming process, season export

## Frontend Ownership

- Farm route: `/farm/seasons`
- Farm route: `/farm/export-qr`
- Farm workspace components inside `FarmWorkspacePage.jsx` and `farmWorkspace/`

## Roles

| Role | Access |
|---|---|
| Farm | Manage own seasons/process/export data |
| Admin | Oversight if exposed through admin pages |
| Public/Guest/Retailer | Only see safe trace-derived information |

## Business Rules

1. Seasons group farming production over a time period.
2. Farming process entries describe cultivation timeline/evidence.
3. Season export supports QR/trace workflows.
4. Season data should connect to farm-owned products/batches where applicable.

## Security Rules

1. Farm season data is farm-owned.
2. Cross-farm reads/writes require admin-level governance or explicit safe public trace output.
3. Exported QR/trace data must not expose internal-only records.

## Tests and Verification

- Backend service tests should cover season creation/update/export rules.
- Frontend farm workspace route coverage validates farm access.

## Known Gaps

- Document exact season status lifecycle when finalized in code/enums.
