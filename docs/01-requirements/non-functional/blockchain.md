---
title: Non-Functional — Blockchain
ids: [NFR-BC-010, NFR-BC-020]
status: planned
last-reviewed: 2026-05-16
language: vi
---

# Non-Functional — Blockchain

## NFR-BC-010 — VeChainThor concurrency và throughput

- **source quote:** "Blockchain (VeChainThor) cần hỗ trợ nhiều giao dịch đồng thời khi khối lượng dữ liệu IoT tăng lên hoặc khi nhu cầu truy xuất thông tin sản phẩm tăng mạnh."
- **status:** planned
- **gap:** [`GAP-006`](../../09-governance/gap-register.md)

### Targets

| Metric | Target | Note |
|---|---|---|
| Sustained TPS | `[TBD: tx/s]` | Pending team agreement |
| Confirmation latency p95 | `[TBD: seconds]` | From submit to confirmed on chain |
| IoT batch size | `[TBD: readings/batch]` | Maximum readings per blockchain commit |
| Backoff / retry policy | `[TBD: max retries, backoff curve]` | Worker behavior on chain congestion |

### Acceptance Criteria (planned)

1. THE system SHALL submit blockchain transactions async với job queue + idempotency keys.
2. THE system SHALL retry failed transactions theo `[TBD: backoff curve]`.
3. WHILE chain bị congestion, THE system SHALL không block user-facing API; transactions stay `PENDING` trong DB.
4. THE system SHALL handle `[TBD: tx/s]` sustained throughput.

## NFR-BC-020 — Tính minh bạch và bất biến của trace data

- **source quote:** "Blockchain phải đảm bảo tính minh bạch và bất biến của dữ liệu nguồn gốc sản phẩm. Các tiêu chuẩn mã hóa của VeChainThor cần được sử dụng để bảo mật thông tin."
- **status:** active

### Acceptance Criteria

1. WHEN một trace event (season create, process update, QR generate) được commit, THE system SHALL persist `BlockchainTransaction` record với tx hash AND public-trace SHALL link tới hash.
2. THE system SHALL không cho phép modify một blockchain commit đã `SUCCESS`; nếu cần sửa, tạo event mới.
3. THE public trace SHALL hiển thị tx hash để verify on-chain.
4. THE system SHALL dùng VeChainThor crypto standards (per AGENTS.md "Canonical blockchain path").

### Resolution Path

- Team chốt TPS/latency/batch targets cho NFR-BC-010 → resolve `GAP-006`.
