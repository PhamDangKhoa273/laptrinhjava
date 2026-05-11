ALTER TABLE blockchain_transactions
    ADD COLUMN tx_origin VARCHAR(80) NULL,
    ADD COLUMN tx_seed VARCHAR(255) NULL;
