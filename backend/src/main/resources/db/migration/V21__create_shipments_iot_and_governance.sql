ALTER TABLE audit_logs
    ADD COLUMN details VARCHAR(1000) NULL;

ALTER TABLE blockchain_transactions
    ADD COLUMN governance_status VARCHAR(30) NULL,
    ADD COLUMN governance_note VARCHAR(500) NULL,
    ADD COLUMN retry_count INT NULL,
    ADD COLUMN last_retry_at DATETIME NULL;

CREATE TABLE shipments (
    shipment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    shipping_manager_user_id BIGINT NOT NULL,
    driver_id BIGINT NULL,
    vehicle_id BIGINT NULL,
    status VARCHAR(30) NOT NULL,
    pickup_confirmed_at DATETIME NULL,
    delivery_confirmed_at DATETIME NULL,
    cancel_reason VARCHAR(500) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE iot_readings (
    reading_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_id BIGINT NOT NULL,
    temperature DECIMAL(10,2) NULL,
    humidity DECIMAL(10,2) NULL,
    ph_value DECIMAL(10,2) NULL,
    captured_at DATETIME NOT NULL
);

CREATE TABLE iot_alerts (
    alert_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_id BIGINT NOT NULL,
    level VARCHAR(20) NOT NULL,
    metric VARCHAR(30) NOT NULL,
    message VARCHAR(500) NOT NULL,
    created_at DATETIME NOT NULL
);
