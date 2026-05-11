-- Migration V30: Create missing tables for Phase 3 IoT (SensorReadings and ThresholdRules)

CREATE TABLE sensor_readings (
    reading_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_id BIGINT NULL,
    season_id BIGINT NULL,
    farm_id BIGINT NULL,
    metric VARCHAR(100) NOT NULL,
    value DECIMAL(18,4) NOT NULL,
    measured_at DATETIME NOT NULL,
    CONSTRAINT fk_sensor_batch FOREIGN KEY (batch_id) REFERENCES product_batches(batch_id),
    CONSTRAINT fk_sensor_season FOREIGN KEY (season_id) REFERENCES farming_seasons(season_id),
    CONSTRAINT fk_sensor_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);

CREATE TABLE threshold_rules (
    rule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farm_id BIGINT NOT NULL,
    metric VARCHAR(100) NOT NULL,
    min_value DECIMAL(18,4) NULL,
    max_value DECIMAL(18,4) NULL,
    enabled BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_threshold_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);

