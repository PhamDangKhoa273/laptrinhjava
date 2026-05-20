---
title: Non-Functional — Reliability
ids: [NFR-REL-010]
status: planned
last-reviewed: 2026-05-16
language: vi
---

# Non-Functional — Reliability

## NFR-REL-010 — Uptime, RPO, RTO

- **source quote:** Brief không nêu rõ con số. Suy ra từ requirement chung về production deployment.
- **status:** planned
- **gap:** [`GAP-005`](../../09-governance/gap-register.md)

### Targets

| Metric | Target | Note |
|---|---|---|
| Uptime SLO | `[TBD: %]` | Pending team agreement |
| Recovery Point Objective (RPO) | `[TBD: minutes]` | Backup interval |
| Recovery Time Objective (RTO) | `[TBD: minutes]` | Failover time |
| Backup retention | `[TBD: days]` | DB + media backups |

### Acceptance Criteria (planned)

1. WHEN production system fail, THE system SHALL recover trong `[TBD: minutes]` (RTO).
2. THE backup strategy SHALL bảo đảm data loss không quá `[TBD: minutes]` (RPO).
3. THE system SHALL có readiness/liveness probes (đã có ở `/actuator/health/readiness` và `/actuator/health/liveness`).

### Resolution Path

- Team chốt SLO + RPO/RTO numbers → resolve `GAP-005`. See [`../../07-operations/runbook-backup.md`](../../07-operations/runbook-backup.md).
