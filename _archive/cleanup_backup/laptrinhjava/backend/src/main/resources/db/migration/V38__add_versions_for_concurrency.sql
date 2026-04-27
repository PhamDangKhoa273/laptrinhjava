ALTER TABLE product_listings ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE shipments ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE subscription_payments ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE order_status_history ADD COLUMN idempotency_key VARCHAR(120);
ALTER TABLE shipments ADD COLUMN idempotency_key VARCHAR(120);
ALTER TABLE subscription_payments ADD COLUMN idempotency_key VARCHAR(120);

CREATE UNIQUE INDEX ux_order_status_history_idempotency_key ON order_status_history(idempotency_key);
CREATE UNIQUE INDEX ux_shipments_idempotency_key ON shipments(idempotency_key);
CREATE UNIQUE INDEX ux_subscription_payments_idempotency_key ON subscription_payments(idempotency_key);
