-- Repair schema drift introduced by partial/manual demo database resets.
-- This migration is intentionally idempotent because some development databases were
-- manually repaired before the migration was added.

CREATE TABLE IF NOT EXISTS permissions (
    permission_id BIGINT NOT NULL AUTO_INCREMENT,
    permission_name VARCHAR(80) NOT NULL,
    description VARCHAR(255) NULL,
    PRIMARY KEY (permission_id),
    UNIQUE KEY uk_permissions_permission_name (permission_name)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_permission_id BIGINT NOT NULL AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_permission_id),
    UNIQUE KEY ux_role_permission (role_id, permission_id),
    KEY idx_role_permissions_permission_id (permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(role_id),
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
);

CREATE TABLE IF NOT EXISTS refresh_token_sessions (
    session_id BIGINT NOT NULL AUTO_INCREMENT,
    jti VARCHAR(64) NOT NULL,
    user_id BIGINT NOT NULL,
    issued_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    device_info VARCHAR(512) NULL,
    refresh_token_hash VARCHAR(64) NULL,
    rotation_reason VARCHAR(128) NULL,
    replaced_by_jti VARCHAR(128) NULL,
    active BIT NOT NULL DEFAULT b'1',
    PRIMARY KEY (session_id),
    UNIQUE KEY idx_refresh_token_sessions_jti (jti),
    KEY idx_refresh_token_sessions_user_id (user_id),
    CONSTRAINT fk_refresh_token_sessions_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS system_announcements (
    announcement_id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(500) NULL,
    content_html LONGTEXT NOT NULL,
    category VARCHAR(80) NULL,
    is_pinned BIT NOT NULL DEFAULT b'0',
    publish_at DATETIME NULL,
    expire_at DATETIME NULL,
    is_active BIT NOT NULL DEFAULT b'1',
    created_by_user_id BIGINT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (announcement_id),
    KEY idx_system_announcements_created_by (created_by_user_id),
    CONSTRAINT fk_system_announcements_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
);

SET @schema_name = DATABASE();

SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'shipment_logs')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'shipment_logs' AND column_name = 'qr_evidence'),
    'ALTER TABLE shipment_logs ADD COLUMN qr_evidence VARCHAR(500) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'shipment_logs')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'shipment_logs' AND column_name = 'override_reason'),
    'ALTER TABLE shipment_logs ADD COLUMN override_reason VARCHAR(500) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'subscription_payments')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'subscription_payments' AND column_name = 'currency'),
    'ALTER TABLE subscription_payments ADD COLUMN currency VARCHAR(255) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'subscription_payments')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'subscription_payments' AND column_name = 'gateway_transaction_id'),
    'ALTER TABLE subscription_payments ADD COLUMN gateway_transaction_id VARCHAR(255) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'subscription_payments')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'subscription_payments' AND column_name = 'gateway_signature'),
    'ALTER TABLE subscription_payments ADD COLUMN gateway_signature VARCHAR(255) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'subscription_payments')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'subscription_payments' AND column_name = 'idempotency_key'),
    'ALTER TABLE subscription_payments ADD COLUMN idempotency_key VARCHAR(255) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT IGNORE INTO permissions(permission_name, description) VALUES
    ('ALL_ACCESS', 'ALL_ACCESS'),
    ('USERS_MANAGE', 'USERS_MANAGE'),
    ('FARMS_REVIEW', 'FARMS_REVIEW'),
    ('BLOCKCHAIN_GOVERNANCE', 'BLOCKCHAIN_GOVERNANCE'),
    ('RETAILERS_MANAGE', 'RETAILERS_MANAGE'),
    ('SHIPMENTS_MANAGE', 'SHIPMENTS_MANAGE'),
    ('NOTIFICATIONS_MANAGE', 'NOTIFICATIONS_MANAGE');

INSERT IGNORE INTO role_permissions(role_id, permission_id, assigned_at)
SELECT r.role_id, p.permission_id, NOW()
FROM roles r
JOIN permissions p
WHERE r.role_name = 'ADMIN';

UPDATE orders
SET status = 'READY_FOR_SHIPMENT'
WHERE status = 'PENDING_SHIPMENT';
