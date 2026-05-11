-- V56 - Thêm blockchain_status / tx_hash / contract_address cho farming_seasons.
SET @schema_name = DATABASE();

SET @has = (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema=@schema_name AND table_name='farming_seasons' AND column_name='blockchain_status');
SET @stmt = IF(@has=0, 'ALTER TABLE farming_seasons ADD COLUMN blockchain_status VARCHAR(50) NULL', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has = (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema=@schema_name AND table_name='farming_seasons' AND column_name='tx_hash');
SET @stmt = IF(@has=0, 'ALTER TABLE farming_seasons ADD COLUMN tx_hash VARCHAR(100) NULL', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has = (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema=@schema_name AND table_name='farming_seasons' AND column_name='contract_address');
SET @stmt = IF(@has=0, 'ALTER TABLE farming_seasons ADD COLUMN contract_address VARCHAR(100) NULL', 'SELECT 1');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;
