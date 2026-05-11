-- V57 - Thêm cột version (optimistic locking) cho iot_alerts.
SET @schema_name = DATABASE();

SET @has = (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema=@schema_name AND table_name='iot_alerts' AND column_name='version');
SET @stmt = IF(@has=0, 'ALTER TABLE iot_alerts ADD COLUMN version BIGINT NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;
