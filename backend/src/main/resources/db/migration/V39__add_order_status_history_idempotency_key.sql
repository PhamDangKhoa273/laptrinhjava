-- V39 - đã bị V38 cover (cột idempotency_key + unique index cho order_status_history).
-- Giữ file để chuỗi Flyway không bị gap.
SELECT 1;
