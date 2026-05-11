ALTER TABLE orders
    ADD COLUMN deposit_released_at DATETIME NULL,
    ADD COLUMN deposit_released_by_user_id BIGINT NULL,
    ADD COLUMN deposit_release_note VARCHAR(500) NULL,
    ADD CONSTRAINT fk_orders_deposit_released_by FOREIGN KEY (deposit_released_by_user_id) REFERENCES users(user_id);
