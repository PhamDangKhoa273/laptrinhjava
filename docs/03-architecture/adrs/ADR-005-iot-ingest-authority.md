---
id: ADR-005
title: IoT Ingest Authority
status: proposed
date: 2026-05-16
decision: IoT sensor readings ingest qua API yêu cầu deviceCode + apiKey match farm/device contract; cross-farm ingest reject trước khi persist.
context: Brief Farm Manager yêu cầu "Nhận thông báo về nhiệt độ, độ ẩm, độ pH trong ngày"; codebase có IoT module với ownership check.
consequences: SensorReading entity validate ownership trước save; IoTAlert generated cả on breach và scheduled daily (xem D4 trong design.md); BR-IOT-010, BR-IOT-020 enforce.
---

# ADR-005 — IoT Ingest Authority

## Status

proposed

## Context

Brief: "Nhận thông báo về nhiệt độ, độ ẩm, độ pH trong ngày." Codebase đã có `modules/iot/` với gateway identity fields (`deviceCode`, `apiKey`, `gatewayTimestamp`).

Cần định nghĩa rõ:

1. Ai được phép ingest sensor readings?
2. Cadence của notifications?
3. Cross-farm ingest xử lý thế nào?

## Decision

**Ingest authority:**

- Role `farm_manager` có thể ingest readings cho batch/season thuộc farm của mình ([`BR-IOT-020`](../../02-domain/business-rules.md))
- Role `admin` có thể ingest cho governance/recovery
- IoT gateway production gửi `deviceCode` + `apiKey`; backend validate match farm/device contract trước khi persist
- Cross-farm ingest reject với code `CROSS_FARM_INGEST_FORBIDDEN` trước khi `SensorReading` saved

**Cadence (per design D4 → resolved [`GAP-007`](../../09-governance/gap-register.md)):**

1. **On-threshold breach (immediate):** sensor reading vượt ngưỡng → `IoTAlert` (kind=BREACH) + push notification ngay
2. **Scheduled daily summary (07:00 ICT theo timezone farm):** aggregate 24h readings → `IoTAlert` (kind=DAILY_DIGEST) + send digest dù không có breach

**Trust model:**

- Sensor readings KHÔNG được tin nếu không validate; payload validation trước khi accept
- Optional gateway identity fields cho production (deviceCode, apiKey, gatewayTimestamp)

## Consequences

- **Positive:**
  - Bảo đảm farm chỉ nhận data từ chính sensors của mình (security boundary rõ ràng)
  - Cadence rõ ràng: cả real-time alerts và daily summary
  - "Trong ngày" trong Brief được resolve = per-day cadence (immediate + 07:00 digest)
- **Negative:**
  - Yêu cầu device key management — production IoT gateway phải có secure key store
  - Daily digest ở 07:00 ICT có thể không phù hợp cho farm ở timezone khác (mitigation: timezone field per farm)
- **Follow-up:**
  - Define gateway key rotation policy
  - Define threshold configuration per crop type (defer)

## Alternatives Considered

- **Open ingest (no auth):** Reject — bảo mật không chấp nhận được, dễ flood DB
- **State machine cho IoTAlert (PENDING → SENT → ACKED):** Reject (per design D4) — alert delivery không có business lifecycle, chỉ là notification rule
- **On-breach only (no daily digest):** Reject — Brief explicit "trong ngày" gợi ý cadence per-day không phụ thuộc breach
