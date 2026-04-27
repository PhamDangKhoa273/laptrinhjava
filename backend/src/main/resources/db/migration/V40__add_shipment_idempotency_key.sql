ALTER TABLE shipments ADD COLUMN idempotency_key VARCHAR(120);
CREATE UNIQUE INDEX ux_shipments_idempotency_key ON shipments(idempotency_key);
