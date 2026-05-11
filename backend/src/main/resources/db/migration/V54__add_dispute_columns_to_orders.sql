-- V54 - Thêm cột dispute_raised_at, dispute_note cho bảng orders (đã có trên entity nhưng thiếu migration).
SET @schema_name = DATABASE();

SET @has_dr = (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = @schema_name AND table_name = 'orders' AND column_name = 'dispute_raised_at');
SET @stmt = IF(@has_dr = 0, 'ALTER TABLE orders ADD COLUMN dispute_raised_at DATETIME NULL', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_dn = (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = @schema_name AND table_name = 'orders' AND column_name = 'dispute_note');
SET @stmt = IF(@has_dn = 0, 'ALTER TABLE orders ADD COLUMN dispute_note VARCHAR(500) NULL', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;
