-- Create orders table
CREATE TABLE orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    retailer_id BIGINT NOT NULL,
    farm_id BIGINT NOT NULL,
    total_amount DECIMAL(18, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_retailer FOREIGN KEY (retailer_id) REFERENCES retailers (retailer_id),
    CONSTRAINT fk_orders_farm FOREIGN KEY (farm_id) REFERENCES farms (farm_id),
    INDEX idx_retailer_id (retailer_id),
    INDEX idx_farm_id (farm_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create order_items table
CREATE TABLE order_items (
    order_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    listing_id BIGINT NOT NULL,
    quantity DECIMAL(15, 2) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_listing FOREIGN KEY (listing_id) REFERENCES product_listings (listing_id),
    INDEX idx_order_id (order_id),
    INDEX idx_listing_id (listing_id)
);

-- Create order_status_history table for tracking all status changes
CREATE TABLE order_status_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    previous_status VARCHAR(30) NOT NULL,
    new_status VARCHAR(30) NOT NULL,
    reason VARCHAR(500),
    blockchain_tx_hash VARCHAR(255),
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_status_history_order FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_changed_at (changed_at),
    INDEX idx_new_status (new_status)
);