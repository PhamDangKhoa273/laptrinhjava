---
title: Module — IoT
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
depends-on: [farm, batch, season, common]
---

# IoT

## Purpose

IoT module sở hữu sensor data ingestion (nhiệt độ, độ ẩm, pH), IoT alerts, và notification cadence cho farm owners.

## Owns

- **R-\***: pending — `R-FRM-200` (nhận thông báo IoT trong ngày)
- **BR-\***: `BR-IOT-010` (sự kiện vượt ngưỡng → IoTAlert + notification per cadence dưới đây) — referenced trong design D4
- **STM-\***: none (per design D4: IoT alerts là notification rule, không phải state machine)

## Implements

- **Backend package:** `backend/src/main/java/com/bicap/modules/iot/`
- **Controllers:** `IoTController` (`/api/v1/iot`)
- **Related entities:** `SensorReading`, `IoTAlert`
- **Frontend route:** `/farm/iot`

## Depends-on

- farm, batch, season, common

## Cadence

Per design D4 (resolved [`GAP-007`](../09-governance/gap-register.md)). Hai trigger rules:

1. **On-threshold breach** (immediate). Sensor reading vượt ngưỡng cấu hình → tạo `IoTAlert` + đẩy notification ngay.
2. **Scheduled daily summary** (07:00 ICT theo timezone của farm). Tổng hợp toàn bộ readings 24h trước → gửi 1 digest dù không có breach.

"Trong ngày" trong Brief = per-day cadence, bao gồm cả breach event lẫn daily digest.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Sensor as IoT Sensor Gateway
    participant Backend as BICAP Backend
    participant DB as MySQL
    participant Worker as Notification Worker
    participant Farm as Farm Manager

    Sensor->>Backend: POST sensor reading (deviceCode, apiKey, value)
    Backend->>Backend: validate ownership (BR-IOT-*)
    Backend->>DB: persist SensorReading
    alt threshold breach
        Backend->>DB: persist IoTAlert (kind=BREACH)
        Backend->>Worker: enqueue immediate notification
        Worker->>Farm: deliver notification
    end
    Note over Worker: scheduled daily 07:00 ICT
    Worker->>DB: aggregate 24h readings per farm
    Worker->>Farm: deliver daily digest
```

## API surface

- pending Stage 5 — IoT ingest endpoints (out of scope cho spec hiện tại; defer to `docs-openapi-completion`)

## Tests

- pending — cross-farm ingest rejection tests
- pending — gateway key validation tests

## Open gaps

- pending — gateway key rotation policy
