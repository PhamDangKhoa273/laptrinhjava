-- V55 - Thêm created_at / updated_at cho drivers và vehicles (entity đã expose, schema V1 thiếu).
SET @schema_name = DATABASE();

SET @has = (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema=@schema_name AND table_name='drivers' AND column_name='created_at');
SET @stmt = IF(@has=0, 'ALTER TABLE drivers ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has = (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema=@schema_name AND table_name='drivers' AND column_name='updated_at');
SET @stmt = IF(@has=0, 'ALTER TABLE drivers ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has = (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema=@schema_name AND table_name='vehicles' AND column_name='created_at');
SET @stmt = IF(@has=0, 'ALTER TABLE vehicles ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has = (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema=@schema_name AND table_name='vehicles' AND column_name='updated_at');
SET @stmt = IF(@has=0, 'ALTER TABLE vehicles ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;
