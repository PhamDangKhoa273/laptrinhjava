ALTER TABLE orders
    ADD COLUMN payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID' AFTER status,
    ADD COLUMN deposit_amount DECIMAL(18, 2) NULL AFTER payment_status,
    ADD COLUMN deposit_paid_at DATETIME NULL AFTER deposit_amount;
