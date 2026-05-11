-- Migration V29: Extend iot_alerts with rich fields, add note to shipments

-- Extend iot_alerts table
ALTER TABLE iot_alerts
    ADD COLUMN farm_id BIGINT NULL,
    ADD COLUMN season_id BIGINT NULL,
    ADD COLUMN value DECIMAL(15,4) NULL,
    ADD COLUMN min_value DECIMAL(15,4) NULL,
    ADD COLUMN max_value DECIMAL(15,4) NULL,
    ADD COLUMN severity VARCHAR(20) NULL,
    ADD COLUMN title VARCHAR(255) NULL,
    ADD COLUMN description VARCHAR(1000) NULL,
    ADD COLUMN measured_at DATETIME NULL,
    ADD COLUMN status VARCHAR(30) NULL DEFAULT 'OPEN',
    ADD COLUMN resolved_at DATETIME NULL,
    MODIFY COLUMN batch_id BIGINT NULL;
