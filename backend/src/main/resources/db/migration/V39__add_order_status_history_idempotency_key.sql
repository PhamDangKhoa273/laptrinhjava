ALTER TABLE order_status_history ADD COLUMN idempotency_key VARCHAR(120);
CREATE UNIQUE INDEX ux_order_status_history_idempotency_key ON order_status_history(idempotency_key);
