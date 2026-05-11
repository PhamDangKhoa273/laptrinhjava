-- V18__create_logistician_module.sql
-- Phiên bản gốc của V18 trùng lặp với V1 (bảng drivers, vehicles) và với V21/V26/V52 (bảng shipments, qr_codes, shipment_history).
-- Đã được thay thế bởi:
--   V1  (drivers, vehicles)
--   V21 (shipments)
--   V26 (shipment_logs, shipment_reports)
--   V52 (dọn bảng trùng, chuẩn hoá qr_codes theo V7)
-- Giữ bản ghi Flyway để chuỗi version liên tục, không chạy CREATE TABLE.
SELECT 1;
