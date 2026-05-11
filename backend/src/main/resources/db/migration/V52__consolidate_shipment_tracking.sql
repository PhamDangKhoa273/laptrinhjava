-- V52__consolidate_shipment_tracking.sql
-- Hợp nhất module shipment: 1 bộ bảng duy nhất.
--   shipments            (V21 + V25/V29/V38/V39/V40)
--   shipment_logs        (V26)
--   shipment_reports     (V26)
--   tracking_locations   (tạo tại migration này)
--   qr_codes             (V7, cho batch)
-- Drop các bảng trùng do logistics cũ sinh ra (nếu tồn tại).

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS logistics_tracking_locations;
DROP TABLE IF EXISTS logistics_shipment_history;
DROP TABLE IF EXISTS logistics_qr_codes;
DROP TABLE IF EXISTS logistics_shipments;
DROP TABLE IF EXISTS shipment_history;

-- Tạo bảng tracking_locations theo schema mới (không phụ thuộc logistics cũ).
CREATE TABLE IF NOT EXISTS tracking_locations (
    location_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shipment_id BIGINT NOT NULL,
    driver_id BIGINT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    accuracy FLOAT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_tracking_locations_shipment (shipment_id),
    KEY idx_tracking_locations_driver (driver_id),
    KEY idx_tracking_locations_created_at (created_at)
);

SET FOREIGN_KEY_CHECKS = 1;
