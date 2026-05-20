---
title: Non-Functional — Scalability
ids: [NFR-SCL-010]
status: planned
last-reviewed: 2026-05-16
language: vi
---

# Non-Functional — Scalability

## NFR-SCL-010 — Khả năng mở rộng linh hoạt

- **source quote:** "Hệ thống phải có khả năng mở rộng linh hoạt để xử lý số lượng lớn người dùng và các truy vấn dữ liệu từ nhiều nguồn khác nhau. Các thành phần như AWS/Google Cloud, Docker và Redis cần được cấu hình để mở rộng liền mạch."
- **status:** planned
- **gap:** [`GAP-003`](../../09-governance/gap-register.md)

### Targets

| Metric | Target | Note |
|---|---|---|
| Concurrent active users | `[TBD: target user volume]` | Pending team agreement |
| Peak RPS | `[TBD: peak RPS]` | Pending team agreement |
| Autoscaling thresholds (CPU/RAM) | `[TBD: thresholds]` | Pending team agreement |
| Horizontal scaling unit | Backend stateless container, Redis cache, MySQL read replicas | Architectural |

### Acceptance Criteria (planned)

1. WHEN deployment được cấu hình autoscaling theo `[TBD: thresholds]`, THE system SHALL handle `[TBD: target user volume]` concurrent users với p95 API latency dưới giá trị tại `NFR-PRF-010`.
2. THE backend SHALL stateless để hỗ trợ horizontal scaling; session/state lưu Redis hoặc DB.
3. THE Redis cache SHALL có maxmemory policy `allkeys-lru` (đã configured in `docker-compose.yml`).

### Resolution Path

- Team chốt 3 con số `[TBD]` ở trên → cập nhật `status: active`, xóa `[TBD]` placeholders, cập nhật `GAP-003` status `resolved`.
