CREATE TABLE product_batches (
    batch_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    farm_id BIGINT NOT NULL,
    season_id BIGINT NULL,
    batch_code VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(150) NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    export_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    trace_url VARCHAR(255) NULL,
    qr_code_data TEXT NULL,
    blockchain_tx_hash VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_batches_farm
        FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);
