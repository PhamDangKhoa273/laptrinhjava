CREATE TABLE farm_retailer_contracts (
    contract_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farm_id BIGINT NOT NULL,
    retailer_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    signed_at DATETIME,
    valid_from DATETIME,
    valid_to DATETIME,
    product_scope VARCHAR(500),
    agreed_price_rule VARCHAR(500),
    notes VARCHAR(1000),
    related_listing_ids VARCHAR(1000),
    related_order_ids VARCHAR(1000),
    created_by_user_id BIGINT,
    reviewed_by_user_id BIGINT,
    reviewed_at DATETIME
);
