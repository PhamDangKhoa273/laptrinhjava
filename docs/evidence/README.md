# Evidence Pack

Last updated: 2026-04-26.

## Current truth

- BICAP is a modular role-based agricultural supply-chain platform.
- Frontend is a mobile-friendly PWA-style web app, not a native app.
- Driver mobile route is installable as a standalone web experience.
- QR/public trace flows, marketplace, admin control center, and governance views are primary demo targets.
- Reporting and analytics views exist, but forecasting is not proven.
- Deployment assets are production-oriented and config-render verified, but no cloud deployment screenshot is included.

## Reviewer-facing evidence index

- Final pack: `docs/final-evidence-pack.md`
- Final verification log: `docs/FINAL_VERIFICATION_LOG.md`
- Security checklist: `docs/SECURITY_REVIEW_CHECKLIST.md`
- Backup/recovery runbook: `docs/backup-recovery-runbook.md`
- Deployment runbook: `deploy/README.md`
- Production checklist: `deploy/PRODUCTION_CHECKLIST.md`
- Metrics summary: `docs/evidence/metrics.md`
- Architecture summary: `docs/ARCHITECTURE.md`
- Blockchain architecture: `docs/BLOCKCHAIN_ARCHITECTURE.md`
- Vietnamese demo script: `docs/DEMO_SCRIPT_VI.md`

## Evidence available

- Frontend route tests and production build logs.
- Targeted backend authorization/security service tests.
- Docker Compose production and local config rendering.
- K8s probes/resource-budget manifests.
- Backup scripts and restore runbook.
- Role E2E/static matrix in Antigravity artifacts.

## Still not included

- Cloud deployment screenshots.
- Full `docker compose up --build` runtime proof for this phase.
- Production monitoring screenshots.
- Seeded logged-in role E2E browser recordings.
- Forecasting/prediction proof.
