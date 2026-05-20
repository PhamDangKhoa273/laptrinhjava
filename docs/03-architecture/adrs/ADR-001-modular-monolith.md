---
id: ADR-001
title: Modular Monolith Architecture
status: accepted
date: 2026-05-16
decision: BICAP triển khai như một modular monolith với bounded-context modules dưới `backend/src/main/java/com/bicap/modules/`.
context: BICAP cần một kiến trúc hỗ trợ nhiều bounded context với deploy đơn giản và có thể tách thành microservices về sau nếu cần.
consequences: Một deployable application duy nhất, ranh giới module rõ ràng, dễ refactor sang microservices về sau.
---

# ADR-001 — Modular Monolith Architecture

## Status

accepted

## Context

BICAP có nhiều bounded context (auth, farm, retailer, order, shipment, season, batch, listing, IoT, vechain, etc.) phục vụ 6 vai trò khác nhau. Đội phát triển vừa và nhỏ. Yêu cầu deploy đơn giản cho local, staging, prod.

Hai phương án chính:

- **Microservices từ đầu:** mỗi bounded context là 1 service riêng. Phù hợp nếu đội lớn và cần độc lập deploy.
- **Modular monolith:** một deployable nhưng module hoá rõ ràng theo bounded context.

## Decision

Chọn **Modular Monolith**:

- Một application Spring Boot duy nhất
- 22 bounded-context modules dưới `modules/` (xem [`MODULES`](../../04-modules/README.md))
- Cross-cutting infrastructure dưới `core/`
- Mỗi module layered: `controller/`, `dto/`, `service/`, `entity/`, `repository/`, `enums/`
- Business rules chỉ ở `service/`, không ở `controller/`

## Consequences

- **Positive:**
  - Deploy đơn giản: một container backend, một database
  - Refactor cross-module dễ (in-process call)
  - Test integration nhanh hơn microservices
  - Module boundary rõ ràng → tách microservices về sau khi cần
- **Negative:**
  - Một fail point duy nhất cho backend (mitigation: HPA + multiple replicas)
  - Module coupling có thể tăng theo thời gian (mitigation: review `depends-on` trong module docs)
- **Follow-up:**
  - Định kỳ review cross-module dependencies trong [`relationships.md`](../../02-domain/relationships.md)
  - Khi một module phát triển quá lớn (≥10k LoC), cân nhắc tách

## Alternatives Considered

- **Microservices:** Reject vì overhead vận hành và test integration cao hơn lợi ích cho team size hiện tại.
- **Layered monolith (no module boundary):** Reject vì khó refactor về sau và mất ranh giới bounded context.
