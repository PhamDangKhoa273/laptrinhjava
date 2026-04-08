CREATE TABLE product_batches (
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
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_batches_season FOREIGN KEY (season_id) REFERENCES farming_seasons(season_id),
    CONSTRAINT fk_batches_product FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE qr_codes (
    qr_code_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    batch_id BIGINT NOT NULL UNIQUE,
    qr_value TEXT NOT NULL,
    qr_url VARCHAR(255) NULL,
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_qr_codes_batch FOREIGN KEY (batch_id) REFERENCES product_batches(batch_id)
);
