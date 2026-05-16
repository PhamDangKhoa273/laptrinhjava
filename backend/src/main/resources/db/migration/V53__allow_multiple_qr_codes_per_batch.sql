-- V53__allow_multiple_qr_codes_per_batch.sql
-- Cho phép nhiều QR/batch (re-issue -> status INACTIVE) + thêm serial_no.

SET @schema_name = DATABASE();

-- 1) Drop FK fk_qr_codes_batch nếu có, để có thể drop unique index trên batch_id.
SET @has_fk = (
    SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_schema = @schema_name
      AND table_name = 'qr_codes'
      AND constraint_name = 'fk_qr_codes_batch'
);
SET @stmt = IF(@has_fk > 0, 'ALTER TABLE qr_codes DROP FOREIGN KEY fk_qr_codes_batch', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2) Drop unique index batch_id nếu còn.
SET @uk_count = (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = @schema_name
      AND table_name = 'qr_codes'
      AND non_unique = 0
      AND column_name = 'batch_id'
);
SET @stmt = IF(@uk_count > 0, 'ALTER TABLE qr_codes DROP INDEX batch_id', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3) Thêm serial_no nếu chưa có.
SET @has_serial = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = @schema_name
      AND table_name = 'qr_codes'
      AND column_name = 'serial_no'
);
SET @stmt = IF(@has_serial = 0, 'ALTER TABLE qr_codes ADD COLUMN serial_no VARCHAR(60) NULL AFTER batch_id', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4) Tạo index phẳng cho batch_id (không unique) + index (batch_id,status).
SET @has_idx_batch = (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = @schema_name
      AND table_name = 'qr_codes'
      AND index_name = 'idx_qr_codes_batch'
);
SET @stmt = IF(@has_idx_batch = 0, 'CREATE INDEX idx_qr_codes_batch ON qr_codes(batch_id)', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_idx_bs = (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = @schema_name
      AND table_name = 'qr_codes'
      AND index_name = 'idx_qr_codes_batch_status'
);
SET @stmt = IF(@has_idx_bs = 0, 'CREATE INDEX idx_qr_codes_batch_status ON qr_codes(batch_id, status)', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5) Re-add FK fk_qr_codes_batch (non-unique bây giờ dùng được index idx_qr_codes_batch).
SET @has_fk2 = (
    SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_schema = @schema_name
      AND table_name = 'qr_codes'
      AND constraint_name = 'fk_qr_codes_batch'
);
SET @stmt = IF(@has_fk2 = 0, 'ALTER TABLE qr_codes ADD CONSTRAINT fk_qr_codes_batch FOREIGN KEY (batch_id) REFERENCES product_batches(batch_id)', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;
