---
id: ADR-004
title: Deposit-Backed Order Flow
status: proposed
date: 2026-05-16
decision: Order yêu cầu retailer pay deposit trước khi farm manager accept; deposit refund tự động khi farm reject hoặc retailer cancel hợp lệ.
context: Brief Retailer yêu cầu "Thanh toán tiền đặt cọc để đặt mua nông sản"; cần định nghĩa lifecycle order kết hợp deposit gateway.
consequences: Order STM có 2 transitions tách biệt (PENDING → DEPOSIT_PAID; DEPOSIT_PAID → ACCEPTED|REJECTED); deposit gateway callback phải HMAC verified và idempotent.
---

# ADR-004 — Deposit-Backed Order Flow

## Status

proposed

## Context

Brief Retailer:
- "Tạo yêu cầu đặt mua nông sản"
- "Thanh toán tiền đặt cọc để đặt mua nông sản"
- "Hủy yêu cầu đặt mua nông sản"

Brief Farm:
- "Xử lý các yêu cầu mua nông sản từ Nhà bán lẻ"

Cần định nghĩa order lifecycle khớp với 4 bullets này và kết nối với shipment + retailer confirmation flow.

## Decision

**Lifecycle:**

1. Retailer tạo order → `STM-ORD-T01: PENDING`
2. Retailer pay deposit qua payment gateway → callback verified → `STM-ORD-T02: DEPOSIT_PAID`
3. Farm manager review order:
   - Accept → `STM-ORD-T03: ACCEPTED` → fulfillment
   - Reject → `STM-ORD-T04: REJECTED` → trigger refund job → `STM-ORD-T08: REFUNDED`
4. Retailer cancel before fulfillment (PENDING or DEPOSIT_PAID) → `STM-ORD-T07: CANCELLED` → if deposit paid, trigger refund → `STM-ORD-T08`
5. Order moves to fulfillment after accept → shipment created (links to STM-SHP)
6. Shipment confirmed by retailer (STM-SHP-T06) → fires order → `STM-ORD-T06: DELIVERED`

**Constraints:**

- Deposit minimum amount enforced per listing ([`BR-ORD-020`](../../02-domain/business-rules.md))
- Deposit gateway callback: HMAC verified + idempotent
- Cancel only valid in `PENDING` or `DEPOSIT_PAID` ([`BR-ORD-030`](../../02-domain/business-rules.md))
- Reject only by farm owner ([`BR-ORD-050`](../../02-domain/business-rules.md))

## Consequences

- **Positive:**
  - Farm bảo đảm có commitment thực từ retailer trước khi đầu tư fulfillment
  - Retailer có cơ chế cancel rõ ràng với refund
  - Lifecycle states map 1-1 với Brief bullets
- **Negative:**
  - Phụ thuộc payment gateway integration (callback verification, refund job)
  - Edge case: deposit refund failure → order stuck `REJECTED` không bao giờ tới `REFUNDED` (mitigation: admin retry job)
- **Follow-up:**
  - Cần chốt provider payment gateway cụ thể (placeholder: `APP_ORDER_DEPOSIT_GATEWAY_SECRET`)
  - Refund job retry policy chưa định nghĩa cụ thể; cần defer hoặc mở rộng

## Alternatives Considered

- **No deposit (full payment on delivery):** Reject — Brief explicit yêu cầu deposit.
- **Full payment upfront:** Reject — không khớp Brief "tiền đặt cọc"; thường không phù hợp B2B agricultural commerce.
