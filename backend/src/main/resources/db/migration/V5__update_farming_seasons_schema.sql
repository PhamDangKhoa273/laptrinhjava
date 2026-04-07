CREATE TABLE products (
    product_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_code VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(150) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE farming_seasons
    RENAME COLUMN name TO season_code,
    RENAME COLUMN expected_end_date TO expected_harvest_date,
    RENAME COLUMN status TO season_status,
    ADD COLUMN product_id BIGINT,
    ADD COLUMN actual_harvest_date DATE,
    ADD COLUMN farming_method VARCHAR(255),
    MODIFY COLUMN season_code VARCHAR(50) NOT NULL UNIQUE,
    ADD CONSTRAINT fk_farming_season_product FOREIGN KEY (product_id) REFERENCES products(product_id);
