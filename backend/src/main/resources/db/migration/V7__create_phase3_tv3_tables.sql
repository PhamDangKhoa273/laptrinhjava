CREATE TABLE IF NOT EXISTS product_batches (
    batch_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    season_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    batch_code VARCHAR(50) NOT NULL UNIQUE,
    harvest_date DATE NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    available_quantity DECIMAL(12,2) NOT NULL,
    quality_grade VARCHAR(30) NULL,
    expiry_date DATE NULL,
    batch_status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qr_codes (
    qr_code_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    batch_id BIGINT NOT NULL UNIQUE,
    qr_value TEXT NOT NULL,
    qr_url VARCHAR(255) NULL,
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_qr_codes_batch
        FOREIGN KEY (batch_id) REFERENCES product_batches(batch_id)
);

CREATE TABLE IF NOT EXISTS blockchain_transactions (
    blockchain_tx_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    related_entity_type VARCHAR(50) NOT NULL,
    related_entity_id BIGINT NOT NULL,
    action_type VARCHAR(30) NOT NULL,
    tx_hash VARCHAR(255) NOT NULL,
    tx_status VARCHAR(30) NOT NULL,
    message VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
