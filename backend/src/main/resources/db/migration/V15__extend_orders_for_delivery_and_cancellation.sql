ALTER TABLE orders
    ADD COLUMN cancellation_reason VARCHAR(500) NULL,
    ADD COLUMN cancelled_at DATETIME NULL,
    ADD COLUMN delivery_confirmed_at DATETIME NULL,
    ADD COLUMN delivery_confirmed_by_user_id BIGINT NULL,
    ADD COLUMN delivery_proof_image_url VARCHAR(500) NULL,
    ADD COLUMN shipping_proof_image_url VARCHAR(500) NULL,
    ADD CONSTRAINT fk_orders_delivery_confirmed_by FOREIGN KEY (delivery_confirmed_by_user_id) REFERENCES users(user_id);
