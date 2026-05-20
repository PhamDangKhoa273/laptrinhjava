---
title: Non-Functional — Performance
ids: [NFR-PRF-010]
status: planned
last-reviewed: 2026-05-16
language: vi
---

# Non-Functional — Performance

## NFR-PRF-010 — Latency và Throughput

- **source quote:** Brief không nêu rõ con số. Suy ra từ requirement chung "khả năng mở rộng".
- **status:** planned
- **gap:** [`GAP-004`](../../09-governance/gap-register.md)

### Targets

| Metric | Target | Note |
|---|---|---|
| API p95 latency (read) | `[TBD: ms]` | Pending team agreement |
| API p95 latency (write) | `[TBD: ms]` | Pending team agreement |
| Page load time p95 | `[TBD: seconds]` | Pending team agreement |
| QR scan resolve latency | `[TBD: ms]` | End-user UX critical |

### Acceptance Criteria (planned)

1. WHEN load test chạy theo cấu hình tại `NFR-SCL-010`, THE system SHALL có p95 latency dưới `[TBD: ms]` cho read endpoints.
2. THE system SHALL có p95 latency dưới `[TBD: ms]` cho write endpoints.

### Resolution Path

- Team chốt latency targets → cập nhật, resolve `GAP-004`.
